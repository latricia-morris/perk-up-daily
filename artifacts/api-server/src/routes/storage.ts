import { Readable } from 'stream';
import crypto from 'crypto';
import { z } from 'zod';
import { Router, type IRouter, type Request, type Response } from 'express';

const RequestUploadUrlBody = z.object({
  name: z.string().min(1),
  size: z.number().int().nonnegative(),
  contentType: z.string().min(1),
});

const RequestUploadUrlResponse = z.object({
  uploadURL: z.string(),
  objectPath: z.string(),
  finalizeToken: z.string(),
});

const FinalizeUploadBody = z.object({
  // Upload URLs are only generated for this random private prefix. Restricting
  // finalization to it prevents a client from claiming arbitrary private files.
  objectPath: z.string().regex(/^\/objects\/uploads\/[0-9a-f-]{36}$/i),
  finalizeToken: z.string().min(20),
});

import { ObjectPermission } from '../lib/objectAcl';
import {
  ObjectNotFoundError,
  ObjectStorageService,
} from '../lib/objectStorage';
import { requireAuth } from '../lib/auth';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();
const FINALIZE_TOKEN_TTL_MS = 15 * 60 * 1000;

function createFinalizeToken(objectPath: string, ownerId: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error('SESSION_SECRET is not configured');

  const payload = Buffer.from(JSON.stringify({
    objectPath,
    ownerId,
    expiresAt: Date.now() + FINALIZE_TOKEN_TTL_MS,
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyFinalizeToken(token: string, objectPath: string, ownerId: string): boolean {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const actualSignature = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);
  if (
    actualSignature.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(actualSignature, expectedSignatureBuffer)
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return (
      decoded.objectPath === objectPath &&
      decoded.ownerId === ownerId &&
      Number.isFinite(decoded.expiresAt) &&
      decoded.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 * Uses bearer-token session auth so public callers cannot mint write-capable URLs.
 */
router.post(
  '/storage/uploads/request-url',
  requireAuth,
  async (req: Request, res: Response) => {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    try {
      const { name, size, contentType } = parsed.data;
      // @ts-ignore — set by requireAuth
      const ownerId = String(req.user.id);

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);
      const finalizeToken = createFinalizeToken(objectPath, ownerId);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          finalizeToken,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * POST /storage/uploads/finalize
 *
 * A presigned PUT cannot attach our application ACL. After the browser has
 * confirmed the upload succeeded, it finalizes the object here. This verifies
 * that the object exists and assigns its authenticated owner before returning
 * a path that can be served from the private-object route.
 */
router.post(
  '/storage/uploads/finalize',
  requireAuth,
  async (req: Request, res: Response) => {
    const parsed = FinalizeUploadBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid object path' });
      return;
    }

    try {
      // @ts-ignore — set by requireAuth
      const owner = String(req.user.id);
      if (!verifyFinalizeToken(parsed.data.finalizeToken, parsed.data.objectPath, owner)) {
        res.status(403).json({ error: 'This upload does not belong to your account' });
        return;
      }
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        parsed.data.objectPath,
        { owner, visibility: 'private' },
      );
      res.json({ objectPath });
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        res.status(400).json({ error: 'Upload did not complete' });
        return;
      }
      req.log.error({ err: error }, 'Error finalizing uploaded object');
      res.status(500).json({ error: 'Failed to finalize uploaded object' });
    }
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve public object' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get('/storage/objects/*path', requireAuth, async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;
    const objectFile =
      await objectStorageService.getObjectEntityFile(objectPath);

    // ACL check: only the owner (or objects without a restrictive ACL) may be read.
    // @ts-ignore — req.user is set by requireAuth
    const userId = String(req.user.id);
    const canAccess = await objectStorageService.canAccessObjectEntity({
      userId,
      objectFile,
      requestedPermission: ObjectPermission.READ,
    });
    if (!canAccess) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
