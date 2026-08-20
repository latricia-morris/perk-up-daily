/**
 * Base44 compatibility shim — replaces the Base44 SDK with calls to our own API server.
 * All entity methods, auth methods, and integration stubs match the Base44 SDK surface
 * so the rest of the app compiles and runs without modification.
 */

// ─── Token storage ────────────────────────────────────────────────────────────
const TOKEN_KEY = "perkup_session_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────
async function apiFetch(path, { method = "GET", body, authRequired = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const err = await res.json();
      message = err.error || err.message || message;
    } catch {}
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Query param builder ──────────────────────────────────────────────────────
function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// ─── Field mapping helpers ────────────────────────────────────────────────────
// Base44 used snake_case; our DB uses camelCase. We normalise outbound records.
function normalizeEntry(row) {
  if (!row) return row;
  return {
    ...row,
    // expose camelCase and snake_case aliases so existing code works
    entry_type: row.entryType ?? row.entry_type,
    created_date: row.createdAt ?? row.created_date,
    updated_date: row.updatedAt ?? row.updated_date,
    // flatten metadata fields to top-level (Base44 stored them flat)
    ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
  };
}

function normalizeLibrary(row) {
  if (!row) return row;
  return {
    ...row,
    content_type: row.contentType ?? row.content_type,
    sort_order: row.sortOrder ?? row.sort_order,
    image_url: row.imageUrl ?? row.image_url,
    created_date: row.createdAt ?? row.created_date,
    ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
  };
}

function normalizeNeurocycle(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.createdAt ?? row.created_date,
    updated_date: row.updatedAt ?? row.updated_date,
    ...(row.stepData && typeof row.stepData === "object" ? row.stepData : {}),
  };
}

function normalizeBug(row) {
  if (!row) return row;
  return {
    ...row,
    created_date: row.createdAt ?? row.created_date,
    ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
  };
}

function normalizePrompt(row) {
  if (!row) return row;
  return { ...row, created_date: row.createdAt ?? row.created_date };
}

function normalizeUser(row) {
  if (!row) return row;
  return {
    ...row,
    first_name: row.firstName ?? row.first_name,
    last_name: row.lastName ?? row.last_name,
    full_name: row.fullName ?? row.full_name,
    profile_picture: row.profilePicture ?? row.profile_picture,
    is_admin: row.isAdmin ?? row.is_admin,
    is_premium: row.isPremium ?? row.is_premium,
    onboarding_completed: row.onboardingCompleted ?? row.onboarding_completed,
    created_date: row.createdAt ?? row.created_date,
    // Surface metadata fields at top-level (christian_content, subscription_status, role, etc.)
    ...(row.metadata && typeof row.metadata === "object" ? row.metadata : {}),
  };
}

// ─── Filter helper ────────────────────────────────────────────────────────────
// Base44 filter(filters, sort?, limit?) → apply client-side sort + limit after fetch
function applySort(rows, sort) {
  if (!sort) return rows;
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  return [...rows].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    if (av < bv) return desc ? 1 : -1;
    if (av > bv) return desc ? -1 : 1;
    return 0;
  });
}

// ─── Entity: UserEntry ────────────────────────────────────────────────────────
const UserEntry = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : "";
    const rows = await apiFetch(`/entries${qs}`);
    const mapped = (rows || []).map(normalizeEntry);
    return applySort(mapped, sort);
  },
  async filter(filters = {}, sort, limit) {
    // Map Base44 snake_case filters to our query params
    const mapped = {};
    if (filters.entry_type) mapped.entry_type = filters.entry_type;
    if (filters.status) mapped.status = filters.status;
    const qs = buildQuery(mapped) + (limit ? `${buildQuery(mapped) ? "&" : "?"}limit=${limit}` : "");
    const rows = await apiFetch(`/entries${qs}`);
    let result = (rows || []).map(normalizeEntry);
    // client-side filter for any remaining keys
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "entry_type" && k !== "status") {
        result = result.filter(r => r[k] === v || r.metadata?.[k] === v);
      }
    }
    return applySort(result, sort);
  },
  async create(data) {
    // Map Base44 flat fields → our schema
    const { entry_type, entryType, body, title, category, status, metadata: meta, ...rest } = data;
    const payload = {
      entryType: entry_type || entryType,
      content: body,
      title: title || null,
      metadata: { category, status, ...rest, ...(meta || {}) },
    };
    const row = await apiFetch("/entries", { method: "POST", body: payload });
    return normalizeEntry(row);
  },
  async update(id, data) {
    const { body, title, category, status, metadata: meta, ...rest } = data;
    const payload = {
      content: body,
      title: title || null,
      metadata: { category, status, ...rest, ...(meta || {}) },
    };
    // strip undefined
    for (const k of Object.keys(payload)) {
      if (payload[k] === undefined) delete payload[k];
    }
    const row = await apiFetch(`/entries/${id}`, { method: "PATCH", body: payload });
    return normalizeEntry(row);
  },
  async delete(id) {
    return apiFetch(`/entries/${id}`, { method: "DELETE" });
  },
};

// ─── Entity: AppLibrary ───────────────────────────────────────────────────────
const AppLibrary = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : "";
    const rows = await apiFetch(`/library${qs}`);
    const mapped = (rows || []).map(normalizeLibrary);
    return applySort(mapped, sort);
  },
  async filter(filters = {}, sort, limit) {
    const mapped = {};
    if (filters.content_type) mapped.content_type = filters.content_type;
    if (filters.status) mapped.status = filters.status;
    if (limit) mapped.limit = limit;
    const rows = await apiFetch(`/library${buildQuery(mapped)}`);
    let result = (rows || []).map(normalizeLibrary);
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "content_type" && k !== "status") {
        result = result.filter(r => r[k] === v || r.metadata?.[k] === v);
      }
    }
    return applySort(result, sort);
  },
  async create(data) {
    const { content_type, contentType, body, is_christian, category, status, sort_order, image_url, author, ...rest } = data;
    const row = await apiFetch("/library", {
      method: "POST",
      body: {
        contentType: content_type || contentType,
        content: body || data.content,
        author: author || null,
        category: category || null,
        status: status || "active",
        sortOrder: sort_order ?? 0,
        imageUrl: image_url || null,
        metadata: { is_christian, ...rest },
      },
    });
    return normalizeLibrary(row);
  },
  async bulkCreate(items) {
    const mapped = items.map(({ content_type, contentType, body, is_christian, category, status, sort_order, image_url, author, ...rest }) => ({
      contentType: content_type || contentType,
      content: body || rest.content,
      author: author || null,
      category: category || null,
      status: status || "active",
      sortOrder: sort_order ?? 0,
      imageUrl: image_url || null,
      metadata: { is_christian, ...rest },
    }));
    const rows = await apiFetch("/library/bulk", { method: "POST", body: { items: mapped } });
    return (rows || []).map(normalizeLibrary);
  },
  async update(id, data) {
    const { body, is_christian, category, status, sort_order, image_url, author, ...rest } = data;
    const row = await apiFetch(`/library/${id}`, {
      method: "PATCH",
      body: {
        ...(body !== undefined ? { content: body } : {}),
        ...(author !== undefined ? { author } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(sort_order !== undefined ? { sortOrder: sort_order } : {}),
        ...(image_url !== undefined ? { imageUrl: image_url } : {}),
        metadata: { is_christian, ...rest },
      },
    });
    return normalizeLibrary(row);
  },
  async delete(id) {
    return apiFetch(`/library/${id}`, { method: "DELETE" });
  },
};

// ─── Entity: ReflectionPrompt ─────────────────────────────────────────────────
const ReflectionPrompt = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : "";
    const rows = await apiFetch(`/prompts${qs}`);
    const mapped = (rows || []).map(normalizePrompt);
    return applySort(mapped, sort);
  },
  async filter(filters = {}, sort, limit) {
    const qs = buildQuery({ ...(filters.status ? { status: filters.status } : {}), ...(limit ? { limit } : {}) });
    const rows = await apiFetch(`/prompts${qs}`);
    let result = (rows || []).map(normalizePrompt);
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "status") result = result.filter(r => r[k] === v);
    }
    return applySort(result, sort);
  },
  async create(data) {
    const row = await apiFetch("/prompts", { method: "POST", body: { prompt: data.prompt, category: data.category, status: data.status } });
    return normalizePrompt(row);
  },
  async update(id, data) {
    const row = await apiFetch(`/prompts/${id}`, { method: "PATCH", body: data });
    return normalizePrompt(row);
  },
  async delete(id) {
    return apiFetch(`/prompts/${id}`, { method: "DELETE" });
  },
};

// ─── Entity: BugReport ───────────────────────────────────────────────────────
const BugReport = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : "";
    const rows = await apiFetch(`/bugs${qs}`);
    const mapped = (rows || []).map(normalizeBug);
    return applySort(mapped, sort);
  },
  async filter(filters = {}, sort, limit) {
    const qs = buildQuery({ ...(filters.status ? { status: filters.status } : {}), ...(limit ? { limit } : {}) });
    const rows = await apiFetch(`/bugs${qs}`);
    let result = (rows || []).map(normalizeBug);
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "status") result = result.filter(r => r[k] === v || r.metadata?.[k] === v);
    }
    return applySort(result, sort);
  },
  async create(data) {
    const { title, description, report_type, ...rest } = data;
    const row = await apiFetch("/bugs", {
      method: "POST",
      body: { description, title, metadata: { report_type, ...rest } },
    });
    return normalizeBug(row);
  },
  async update(id, data) {
    const row = await apiFetch(`/bugs/${id}`, { method: "PATCH", body: data });
    return normalizeBug(row);
  },
  async delete(id) {
    return apiFetch(`/bugs/${id}`, { method: "DELETE" });
  },
};

// ─── Entity: NeurocycleCheckIn ────────────────────────────────────────────────
const NeurocycleCheckIn = {
  async filter(filters = {}, sort, limit) {
    const rows = await apiFetch("/neurocycle");
    let result = (rows || []).map(normalizeNeurocycle);
    for (const [k, v] of Object.entries(filters)) {
      result = result.filter(r => r[k] === v || r.stepData?.[k] === v);
    }
    return applySort(result, sort);
  },
  async create(data) {
    // Map flat Base44 fields into stepData
    const { cycle_date, cycle_id, cycle_day, cycle_status, focus_thought, replacement_thought, presence_level, active_reach, cycle_notes, ...rest } = data;
    const row = await apiFetch("/neurocycle", {
      method: "POST",
      body: {
        day: cycle_day || 1,
        stepData: { cycle_date, cycle_id, cycle_day, cycle_status, focus_thought, replacement_thought, presence_level, active_reach, cycle_notes, ...rest },
        completedAt: cycle_status === "completed" ? new Date().toISOString() : null,
      },
    });
    return normalizeNeurocycle(row);
  },
  async update(id, data) {
    const { cycle_status, cycle_day, ...rest } = data;
    const row = await apiFetch(`/neurocycle/${id}`, {
      method: "PATCH",
      body: {
        ...(cycle_day !== undefined ? { day: cycle_day } : {}),
        stepData: { cycle_status, ...rest },
        ...(cycle_status === "completed" ? { completedAt: new Date().toISOString() } : {}),
      },
    });
    return normalizeNeurocycle(row);
  },
};

// ─── Entity: NeuralTraining ───────────────────────────────────────────────────
const NeuralTraining = {
  async filter(filters = {}, sort, limit) {
    const qs = buildQuery({
      ...(filters.exercise_type ? { exercise_type: filters.exercise_type } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    });
    const rows = await apiFetch(`/neural-training${qs}`);
    let result = rows || [];
    for (const [k, v] of Object.entries(filters)) {
      if (k !== "exercise_type" && k !== "status") result = result.filter(r => r[k] === v);
    }
    return applySort(result, sort);
  },
};

// ─── Entity: User ─────────────────────────────────────────────────────────────
const User = {
  async list(sort, limit) {
    const qs = limit ? `?limit=${limit}` : "";
    const rows = await apiFetch(`/users${qs}`);
    const mapped = (rows || []).map(normalizeUser);
    return applySort(mapped, sort);
  },
  async update(id, data) {
    // Base44 user records use snake_case and arbitrary profile fields. The
    // admin-only API accepts durable columns plus a metadata object, so keep
    // subscription state and other imported fields in metadata rather than
    // silently dropping them.
    const {
      first_name, last_name, full_name, profile_picture, phone,
      birthday, onboarding_completed, is_premium, is_admin,
      metadata: suppliedMetadata, ...metadata
    } = data;
    const payload = {
      ...(first_name !== undefined ? { firstName: first_name } : {}),
      ...(last_name !== undefined ? { lastName: last_name } : {}),
      ...(full_name !== undefined ? { fullName: full_name } : {}),
      ...(profile_picture !== undefined ? { profilePicture: profile_picture } : {}),
      ...(phone !== undefined ? { phone } : {}),
      ...(birthday !== undefined ? { birthday } : {}),
      ...(onboarding_completed !== undefined ? { onboardingCompleted: onboarding_completed } : {}),
      ...(is_premium !== undefined ? { isPremium: is_premium } : {}),
      ...(is_admin !== undefined ? { isAdmin: is_admin } : {}),
    };
    const mergedMetadata = { ...(suppliedMetadata || {}), ...metadata };
    if (Object.keys(mergedMetadata).length > 0) payload.metadata = mergedMetadata;
    const row = await apiFetch(`/users/${id}`, { method: "PATCH", body: payload });
    return normalizeUser(row);
  },
};

// ─── Entity: AccessLimitInvite (stub) ─────────────────────────────────────────
const AccessLimitInvite = {
  async create(data) {
    console.warn("AccessLimitInvite.create: not implemented in this deployment", data);
    return { id: "stub", ...data };
  },
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
  async me() {
    const user = await apiFetch("/auth/me");
    return normalizeUser(user);
  },
  isAuthenticated() {
    return !!getToken();
  },
  setToken(token) {
    setToken(token);
  },
  async loginViaEmailPassword(email, password) {
    const { token, user } = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    setToken(token);
    return normalizeUser(user);
  },
  async register({ email, password }) {
    const { token, user } = await apiFetch("/auth/register", {
      method: "POST",
      body: { email, password },
    });
    setToken(token);
    return { access_token: token, user: normalizeUser(user) };
  },
  async updateMe(data) {
    // Map Base44 snake_case profile fields → our API
    const {
      first_name, last_name, full_name, profile_picture, phone, birthday,
      onboarding_completed,
      // Everything else goes into metadata
      ...metaFields
    } = data;
    const payload = {};
    if (first_name !== undefined) payload.firstName = first_name;
    if (last_name !== undefined) payload.lastName = last_name;
    if (full_name !== undefined) payload.fullName = full_name;
    if (profile_picture !== undefined) payload.profilePicture = profile_picture;
    if (phone !== undefined) payload.phone = phone;
    if (birthday !== undefined) payload.birthday = birthday;
    if (onboarding_completed !== undefined) payload.onboardingCompleted = onboarding_completed;
    if (Object.keys(metaFields).length > 0) payload.metadata = metaFields;

    const user = await apiFetch("/auth/update-me", { method: "PATCH", body: payload });
    return normalizeUser(user);
  },
  async logout(redirectUrl) {
    const token = getToken();
    if (token) {
      try {
        await apiFetch("/auth/logout", { method: "POST" });
      } catch {}
    }
    setToken(null);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.href = "/login";
    }
  },
  redirectToLogin(returnUrl) {
    const url = returnUrl ? `/login?returnTo=${encodeURIComponent(returnUrl)}` : "/login";
    window.location.href = url;
  },
  loginWithProvider(provider, redirectPath) {
    // OAuth providers not implemented — redirect to email login
    console.warn(`OAuth provider "${provider}" not available. Redirecting to email login.`);
    window.location.href = "/login";
  },
  async resetPasswordRequest(email) {
    return apiFetch("/auth/forgot-password", { method: "POST", body: { email } });
  },
  async resetPassword({ token, password }) {
    return apiFetch("/auth/reset-password", { method: "POST", body: { token, password } });
  },
};

// ─── Integrations (Core stubs) ────────────────────────────────────────────────
const integrations = {
  Core: {
    async UploadFile({ file }) {
      // Use presigned upload via our storage API
      const request = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!request.ok) {
        const err = await request.json().catch(() => ({}));
        throw new Error(err.error || "Unable to start file upload");
      }
      const meta = await request.json();

      const upload = await fetch(meta.uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("File upload failed");

      // The server verifies the object exists and attaches a private owner ACL
      // before returning it to callers, so users can only read their own files.
      const finalized = await apiFetch("/storage/uploads/finalize", {
        method: "POST",
        body: { objectPath: meta.objectPath, finalizeToken: meta.finalizeToken },
      });

      const fileUrl = `/api/storage${finalized.objectPath}`;
      return { file_url: fileUrl };
    },

    async InvokeLLM({ prompt, response_json_schema }) {
      // Call our AI proxy endpoint
      const res = await fetch("/api/ai/invoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({ prompt, response_json_schema }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "AI invocation failed");
      }
      return res.json();
    },

    async ExtractDataFromUploadedFile({ file_url, json_schema }) {
      const res = await fetch("/api/ai/extract", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({ file_url, json_schema }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { status: "error", details: err.error || "Extraction failed" };
      }
      return res.json();
    },
  },
};

// ─── Functions (stub cloud functions) ────────────────────────────────────────
const functions = {
  async invoke(name, payload = {}) {
    const res = await fetch(`/api/functions/${name}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Function ${name} failed`);
    }
    const data = await res.json();
    return { data };
  },
};

// ─── Web billing ──────────────────────────────────────────────────────────────
const billing = {
  async listPlans() {
    return apiFetch("/billing/plans");
  },
  async status() {
    return apiFetch("/billing/status");
  },
  async startCheckout(priceId) {
    return apiFetch("/billing/checkout", { method: "POST", body: { priceId } });
  },
  async openPortal() {
    return apiFetch("/billing/portal", { method: "POST" });
  },
};

// ─── Exported shim ────────────────────────────────────────────────────────────
export const base44 = {
  entities: {
    UserEntry,
    AppLibrary,
    ReflectionPrompt,
    BugReport,
    NeurocycleCheckIn,
    NeuralTraining,
    User,
    AccessLimitInvite,
  },
  auth,
  integrations,
  functions,
  billing,
};
