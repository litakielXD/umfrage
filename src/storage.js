const API_BASE_CANDIDATES = resolveApiBaseCandidates();

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function resolveApiBaseCandidates() {
  if (typeof window !== "undefined" && typeof window.UMFRAGE_API_BASE === "string") {
    return [window.UMFRAGE_API_BASE.replace(/\/+$/, "")];
  }

  const { hostname, pathname } = window.location;
  const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
  const candidates = [];

  if (isLocal) {
    candidates.push("http://127.0.0.1:8012/api");
  }

  if (pathname.startsWith("/umfrage/")) {
    candidates.push("/umfrage/api");
  }

  candidates.push("/api");
  return unique(candidates);
}

function apiUrl(base, path) {
  return `${base}${path}`;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let payload = null;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    payload = await response.json();
  }

  if (!response.ok) {
    const message = payload?.detail || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function requestApi(path, options = {}) {
  let lastError = null;

  for (const base of API_BASE_CANDIDATES) {
    try {
      return await requestJson(apiUrl(base, path), options);
    } catch (error) {
      lastError = error;
      if (error?.status !== 404) {
        throw error;
      }
    }
  }

  if (lastError) throw lastError;
  throw new Error("Keine API-Basis konfiguriert");
}

export async function saveResponse(response) {
  await requestApi("/responses", {
    method: "POST",
    body: JSON.stringify(response),
  });
}

export async function getResponsesBySurveyId(surveyId) {
  const params = new URLSearchParams({ surveyId });
  return requestApi(`/admin/responses?${params.toString()}`);
}

export async function adminLogin(password) {
  return requestApi("/admin/login", {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function adminLogout() {
  return requestApi("/admin/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function isAdminAuthenticated() {
  const payload = await requestApi("/admin/session");
  return payload?.authenticated === true;
}
