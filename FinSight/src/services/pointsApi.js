const CONFIGURED_API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");
const DIRECT_API_BASE_URL = (import.meta.env.VITE_API_TARGET || "http://127.0.0.1:8001").replace(/\/$/, "");
const API_BASE_URLS = Array.from(new Set([CONFIGURED_API_BASE_URL, DIRECT_API_BASE_URL].filter(Boolean)));

const emitPointsUpdated = (userId, totalPoints) => {
  if (!userId || typeof totalPoints !== "number") return;
  try {
    localStorage.setItem(`finsight_points_${userId}`, String(totalPoints));
  } catch {
    // Ignore localStorage write issues
  }
  window.dispatchEvent(new CustomEvent("finsight:points-updated", { detail: { userId, totalPoints } }));
};

const parseResponse = async (response, fallbackMessage) => {
  const rawText = await response.text();
  let data = null;
  if (rawText) {
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const detail =
      data?.detail ||
      data?.message ||
      (typeof rawText === "string" && rawText.trim() ? rawText.trim().slice(0, 240) : fallbackMessage);
    throw new Error(detail || fallbackMessage);
  }

  return data || {};
};

const requestJson = async (method, path, body, fallbackMessage) => {
  for (const baseUrl of API_BASE_URLS) {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      continue;
    }

    if (!response.ok && baseUrl.startsWith("/") && API_BASE_URLS.length > 1 && [404, 502, 503].includes(response.status)) {
      continue;
    }

    return parseResponse(response, fallbackMessage);
  }

  throw new Error(
    `Cannot reach backend. Tried ${API_BASE_URLS.join(", ")}. Start backend/auth_server.py on http://127.0.0.1:8001.`
  );
};

export const getStoredPoints = (userId) => {
  if (!userId) return null;
  const raw = localStorage.getItem(`finsight_points_${userId}`);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

export const getPointsSummary = async (userId) => {
  const data = await requestJson("GET", `/users/${userId}/points`, null, "Unable to fetch points");
  if (typeof data?.total_points === "number") {
    emitPointsUpdated(userId, data.total_points);
  }
  return data;
};

export const getPointTransactions = async (userId, limit = 50) =>
  requestJson("GET", `/users/${userId}/point-transactions?limit=${limit}`, null, "Unable to fetch point history");

export const awardPoints = async (userId, action, extra = {}) => {
  const data = await requestJson(
    "POST",
    `/users/${userId}/points/award`,
    { action, ...extra },
    "Unable to award points"
  );
  if (typeof data?.total_points === "number") emitPointsUpdated(userId, data.total_points);
  return data;
};

export const deductPointsForCourse = async (userId, courseCost, metadata = {}) => {
  const data = await requestJson(
    "POST",
    `/users/${userId}/points/deduct`,
    { action: "course_unlocked_paid", course_cost: courseCost, metadata },
    "Unable to deduct points"
  );
  if (typeof data?.total_points === "number") emitPointsUpdated(userId, data.total_points);
  return data;
};

export const pointsEvents = {
  emit: emitPointsUpdated,
};
