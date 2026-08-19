import { Router } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";
import { requireAuth } from "../lib/auth";

const router: Router = Router();

// Simple per-user rate limiting so authenticated users can't run up unbounded AI costs.
const AI_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const AI_MAX_CALLS_PER_WINDOW = 30;
const aiUsage = new Map<number, { windowStart: number; count: number }>();

function checkAiQuota(userId: number): boolean {
  const now = Date.now();
  const usage = aiUsage.get(userId);
  if (!usage || now - usage.windowStart > AI_WINDOW_MS) {
    aiUsage.set(userId, { windowStart: now, count: 1 });
    return true;
  }
  if (usage.count >= AI_MAX_CALLS_PER_WINDOW) return false;
  usage.count += 1;
  return true;
}

function getOpenAI() {
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "placeholder";
  if (baseURL) {
    return new OpenAI({ baseURL, apiKey });
  }
  // Fallback: use OPENAI_API_KEY if set directly
  const directKey = process.env.OPENAI_API_KEY;
  if (directKey) {
    return new OpenAI({ apiKey: directKey });
  }
  return null;
}

// POST /api/ai/invoke — Base44 InvokeLLM replacement (auth + quota)
router.post("/ai/invoke", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { prompt, response_json_schema } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  if (!checkAiQuota(user.id)) {
    res.status(429).json({ error: "AI usage limit reached. Try again later." });
    return;
  }

  const client = getOpenAI();
  if (!client) {
    res.status(503).json({ error: "AI service not configured" });
    return;
  }

  try {
    const isJson = !!response_json_schema;
    const completion = await client.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [{ role: "user", content: prompt }],
      ...(isJson ? { response_format: { type: "json_object" } } : {}),
      max_completion_tokens: 1024,
    });

    const content = completion.choices[0]?.message?.content ?? "";

    if (isJson) {
      try {
        const parsed = JSON.parse(content);
        res.json(parsed);
      } catch {
        res.json({ result: content });
      }
    } else {
      // Return raw text
      res.json(content);
    }
  } catch (err: unknown) {
    logger.error({ err }, "AI invoke failed");
    res.status(500).json({ error: "AI invocation failed" });
  }
});

// POST /api/ai/extract — Base44 ExtractDataFromUploadedFile replacement (auth + quota)
router.post("/ai/extract", requireAuth, async (req, res): Promise<void> => {
  // @ts-ignore
  const user = req.user;
  const { file_url, json_schema } = req.body;

  if (!file_url) {
    res.status(400).json({ error: "file_url is required" });
    return;
  }

  if (!checkAiQuota(user.id)) {
    res.status(429).json({ error: "AI usage limit reached. Try again later." });
    return;
  }

  const client = getOpenAI();
  if (!client) {
    res.status(503).json({ error: "AI service not configured" });
    return;
  }

  try {
    const schemaStr = json_schema ? JSON.stringify(json_schema) : "extract all data";
    const prompt = `You are a data extraction assistant. The user has uploaded a file at: ${file_url}

Extract the data according to this JSON schema:
${schemaStr}

Return a valid JSON object matching the schema. If the file is a CSV, parse each row as an item in the "rows" array.
Return only valid JSON, no explanation.`;

    const completion = await client.chat.completions.create({
      model: "gpt-5.6-luna",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_completion_tokens: 4096,
    });

    const content = completion.choices[0]?.message?.content ?? "{}";
    try {
      const parsed = JSON.parse(content);
      res.json({ status: "success", output: parsed });
    } catch {
      res.json({ status: "error", details: "Failed to parse AI response" });
    }
  } catch (err: unknown) {
    logger.error({ err }, "AI extract failed");
    res.status(500).json({ status: "error", details: "Extraction failed" });
  }
});

export default router;
