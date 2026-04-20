const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const app = express();

const PORT = process.env.PORT || 3000;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-me";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const COOKIE_NAME = "quiz_session";
const ADMIN_CSRF_COOKIE = "admin_csrf";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const LOGIN_RATE_WINDOW_MS = 1000 * 60 * 15;
const LOGIN_RATE_MAX_ATTEMPTS = 8;
const ADMIN_RATE_WINDOW_MS = 1000 * 60 * 10;
const ADMIN_RATE_MAX_ATTEMPTS = 20;

const LOGIN_LOG_MAX_ITEMS = 2000;
const LOGIN_LOG_RETENTION_DAYS = Number.parseInt(
  process.env.LOGIN_LOG_RETENTION_DAYS || "90",
  10,
);

const ROOT_DIR = __dirname;
const USERS_PATH = path.join(ROOT_DIR, "data", "users.json");
const LOGIN_LOGS_PATH = path.join(ROOT_DIR, "data", "login_logs.json");
const SESSIONS_PATH = path.join(ROOT_DIR, "data", "sessions.json");
const DATASET_EN_SK = path.join(ROOT_DIR, "vocabulary.json");
const DATASET_SK_EN = path.join(ROOT_DIR, "vocabulary_sk_to_en.json");

const sessions = new Map();
const loginRateMap = new Map();
const adminRateMap = new Map();

if (process.env.TRUST_PROXY !== undefined) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY));
}
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        "upgrade-insecure-requests": IS_PRODUCTION ? [] : null,
      },
    },
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store");
  }
  next();
});

function nowIso() {
  return new Date().toISOString();
}

function ensureJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, "[]\n", "utf8");
  }
}

function readJsonArray(filePath) {
  ensureJsonFile(filePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonArray(filePath, rows) {
  fs.writeFileSync(filePath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function readUsers() {
  return readJsonArray(USERS_PATH);
}

function writeUsers(users) {
  writeJsonArray(USERS_PATH, users);
}

function readLoginLogs() {
  return readJsonArray(LOGIN_LOGS_PATH);
}

function writeLoginLogs(logs) {
  writeJsonArray(LOGIN_LOGS_PATH, logs);
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function pruneExpiredSessions() {
  const now = Date.now();
  let removed = 0;
  for (const [token, session] of sessions.entries()) {
    if (!session?.expiresAt || Number(session.expiresAt) < now) {
      sessions.delete(token);
      removed += 1;
    }
  }
  if (removed > 0) {
    saveSessionsToFile();
  }
}

function loadSessionsFromFile() {
  const rows = readJsonArray(SESSIONS_PATH);
  const now = Date.now();
  let changed = false;
  sessions.clear();
  rows.forEach((row) => {
    if (row?.token && row?.email && row?.expiresAt) {
      const expiresAt = Number(row.expiresAt);
      if (!Number.isFinite(expiresAt) || expiresAt < now) {
        changed = true;
        return;
      }
      sessions.set(String(row.token), {
        email: String(row.email),
        expiresAt,
      });
    }
  });
  if (changed) {
    saveSessionsToFile();
  }
}

function saveSessionsToFile() {
  const rows = Array.from(sessions.entries()).map(([token, session]) => ({
    token,
    email: session.email,
    expiresAt: session.expiresAt,
  }));
  writeJsonArray(SESSIONS_PATH, rows);
}

function pruneOldLoginLogs() {
  if (
    !Number.isFinite(LOGIN_LOG_RETENTION_DAYS) ||
    LOGIN_LOG_RETENTION_DAYS < 1
  ) {
    return;
  }

  const logs = readLoginLogs();
  const thresholdMs =
    Date.now() - LOGIN_LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const kept = logs.filter((log) => {
    const ts = Date.parse(String(log.time || ""));
    if (Number.isNaN(ts)) return true;
    return ts >= thresholdMs;
  });

  if (kept.length !== logs.length) {
    writeLoginLogs(kept);
  }
}

function appendLoginLog(entry) {
  pruneOldLoginLogs();
  const logs = readLoginLogs();
  logs.unshift(entry);
  if (logs.length > LOGIN_LOG_MAX_ITEMS) {
    logs.length = LOGIN_LOG_MAX_ITEMS;
  }
  writeLoginLogs(logs);
}

function sanitizeUser(user) {
  return {
    email: user.email,
    isActive: Boolean(user.isActive),
    lockedDeviceId: user.lockedDeviceId || null,
    createdAt: user.createdAt,
  };
}

function createPasswordHash(
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 120000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  const { hash } = createPasswordHash(password, user.passwordSalt);
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(user.passwordHash),
  );
}

function validatePasswordStrength(password) {
  if (typeof password !== "string") return false;
  const hasMinLen = password.length >= 10;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasMinLen && hasLower && hasUpper && hasDigit;
}

function getClientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "").trim();
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const directIp = req.socket?.remoteAddress || req.ip || "unknown";
  return String(directIp);
}

function getRateState(map, ip, windowMs) {
  const now = Date.now();
  const state = map.get(ip) || { attempts: [] };
  state.attempts = state.attempts.filter((ts) => now - ts <= windowMs);
  map.set(ip, state);
  return state;
}

function createSession(email) {
  pruneExpiredSessions();
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    email,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  saveSessionsToFile();
  return token;
}

function deleteSession(token) {
  if (sessions.delete(token)) {
    saveSessionsToFile();
  }
}

function cleanupSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    deleteSession(token);
    return null;
  }
  return session;
}

function getTokenFromRequest(req) {
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) {
    return String(cookieToken).trim();
  }
  return "";
}

function setSessionCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
  });
}

function safeEqualText(a, b) {
  const aBuf = Buffer.from(String(a), "utf8");
  const bBuf = Buffer.from(String(b), "utf8");
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function setAdminCsrfCookie(res, token) {
  res.cookie(ADMIN_CSRF_COOKIE, token, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    maxAge: SESSION_TTL_MS,
    path: "/",
  });
}

function issueAdminCsrfToken(res) {
  const token = crypto.randomBytes(24).toString("hex");
  setAdminCsrfCookie(res, token);
  return token;
}

function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);
  if (!token) {
    clearSessionCookie(res);
    return res
      .status(401)
      .json({ error: "Missing token", code: "MISSING_TOKEN" });
  }

  const session = cleanupSession(token);
  if (!session) {
    clearSessionCookie(res);
    return res
      .status(401)
      .json({ error: "Invalid session", code: "INVALID_SESSION" });
  }

  const users = readUsers();
  const user = users.find((u) => u.email === session.email);
  if (!user || !user.isActive) {
    deleteSession(token);
    clearSessionCookie(res);
    return res
      .status(401)
      .json({ error: "User not active", code: "USER_INACTIVE" });
  }

  req.authToken = token;
  req.user = user;
  req.users = users;
  return next();
}

function requireAdmin(req, res, next) {
  const ip = getClientIp(req);
  const state = getRateState(adminRateMap, ip, ADMIN_RATE_WINDOW_MS);
  if (state.attempts.length >= ADMIN_RATE_MAX_ATTEMPTS) {
    return res.status(429).json({
      error: "Too many failed admin attempts.",
      code: "ADMIN_RATE_LIMITED",
    });
  }

  const provided = String(req.headers["x-admin-secret"] || "");
  if (provided !== ADMIN_SECRET) {
    state.attempts.push(Date.now());
    adminRateMap.set(ip, state);
    return res
      .status(403)
      .json({ error: "Forbidden", code: "ADMIN_FORBIDDEN" });
  }

  adminRateMap.delete(ip);
  return next();
}

function requireAdminCsrf(req, res, next) {
  const headerToken = String(req.headers["x-csrf-token"] || "").trim();
  const cookieToken = String(req.cookies?.[ADMIN_CSRF_COOKIE] || "").trim();

  if (!headerToken || !cookieToken) {
    return res.status(403).json({
      error: "Missing CSRF token",
      code: "ADMIN_CSRF_REQUIRED",
    });
  }

  if (!safeEqualText(headerToken, cookieToken)) {
    return res.status(403).json({
      error: "Invalid CSRF token",
      code: "ADMIN_CSRF_INVALID",
    });
  }

  return next();
}

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password || "");
  const deviceId = String(req.body?.deviceId || "").trim();
  const ip = getClientIp(req);

  const fail = (status, error, code) => {
    if (code !== "BAD_INPUT" && code !== "RATE_LIMITED") {
      const state = getRateState(loginRateMap, ip, LOGIN_RATE_WINDOW_MS);
      state.attempts.push(Date.now());
      loginRateMap.set(ip, state);
    }

    appendLoginLog({
      time: nowIso(),
      ip,
      email: email || null,
      deviceId: deviceId || null,
      result: "FAILED",
      code,
    });

    return res.status(status).json({ error, code });
  };

  const state = getRateState(loginRateMap, ip, LOGIN_RATE_WINDOW_MS);
  if (state.attempts.length >= LOGIN_RATE_MAX_ATTEMPTS) {
    appendLoginLog({
      time: nowIso(),
      ip,
      email: email || null,
      deviceId: deviceId || null,
      result: "RATE_LIMITED",
      code: "RATE_LIMITED",
    });
    return res.status(429).json({
      error: "Too many failed attempts. Try again later.",
      code: "RATE_LIMITED",
    });
  }

  if (!email || !password || !deviceId) {
    return fail(400, "Missing email/password/deviceId", "BAD_INPUT");
  }
  if (!isValidEmail(email)) {
    return fail(400, "Invalid email", "BAD_INPUT");
  }

  const users = readUsers();
  const user = users.find((u) => u.email === email);
  if (!user || !user.isActive) {
    return fail(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (!verifyPassword(password, user)) {
    return fail(401, "Invalid credentials", "INVALID_CREDENTIALS");
  }

  if (!user.lockedDeviceId) {
    user.lockedDeviceId = deviceId;
    user.updatedAt = nowIso();
    writeUsers(users);
  } else if (user.lockedDeviceId !== deviceId) {
    return fail(403, "Account is locked to another device", "DEVICE_LOCKED");
  }

  loginRateMap.delete(ip);

  appendLoginLog({
    time: nowIso(),
    ip,
    email,
    deviceId,
    result: "SUCCESS",
    code: "LOGIN_OK",
  });

  const token = createSession(user.email);
  setSessionCookie(res, token);
  return res.json({
    user: sanitizeUser(user),
  });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  deleteSession(req.authToken);
  clearSessionCookie(res);
  return res.json({ ok: true });
});

app.post(
  "/api/admin/create-user",
  requireAdmin,
  requireAdminCsrf,
  (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    const isActive = req.body?.isActive !== false;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Missing email/password", code: "BAD_INPUT" });
    }
    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ error: "Invalid email", code: "BAD_INPUT" });
    }

    if (!validatePasswordStrength(password)) {
      return res.status(400).json({
        error: "Weak password. Use at least 10 chars with upper/lower/digit.",
        code: "WEAK_PASSWORD",
      });
    }

    const users = readUsers();
    if (users.some((u) => u.email === email)) {
      return res
        .status(409)
        .json({ error: "User already exists", code: "USER_EXISTS" });
    }

    const pass = createPasswordHash(password);
    const user = {
      email,
      passwordHash: pass.hash,
      passwordSalt: pass.salt,
      isActive,
      lockedDeviceId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    users.push(user);
    writeUsers(users);

    return res.status(201).json({ user: sanitizeUser(user) });
  },
);

app.post(
  "/api/admin/reset-device",
  requireAdmin,
  requireAdminCsrf,
  (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ error: "Missing email", code: "BAD_INPUT" });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", code: "USER_NOT_FOUND" });
    }

    user.lockedDeviceId = null;
    user.updatedAt = nowIso();
    writeUsers(users);

    return res.json({ user: sanitizeUser(user) });
  },
);

app.post(
  "/api/admin/set-active",
  requireAdmin,
  requireAdminCsrf,
  (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const isActive = Boolean(req.body?.isActive);
    if (!email) {
      return res
        .status(400)
        .json({ error: "Missing email", code: "BAD_INPUT" });
    }

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found", code: "USER_NOT_FOUND" });
    }

    user.isActive = isActive;
    user.updatedAt = nowIso();
    writeUsers(users);

    return res.json({ user: sanitizeUser(user) });
  },
);

app.get("/api/admin/users", requireAdmin, (_req, res) => {
  const users = readUsers()
    .map((user) => sanitizeUser(user))
    .sort((a, b) => a.email.localeCompare(b.email));

  return res.json({ users });
});

app.get("/api/admin/csrf", requireAdmin, (_req, res) => {
  const token = issueAdminCsrfToken(res);
  return res.json({ csrfToken: token });
});

app.get("/api/admin/export-users", requireAdmin, (_req, res) => {
  const users = readUsers();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `users-backup-${stamp}.json`;

  return res
    .status(200)
    .setHeader("Content-Type", "application/json")
    .setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`)
    .send(`${JSON.stringify(users, null, 2)}\n`);
});

app.post(
  "/api/admin/delete-user",
  requireAdmin,
  requireAdminCsrf,
  (req, res) => {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    if (!email) {
      return res
        .status(400)
        .json({ error: "Missing email", code: "BAD_INPUT" });
    }

    const users = readUsers();
    const idx = users.findIndex((u) => u.email === email);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: "User not found", code: "USER_NOT_FOUND" });
    }

    users.splice(idx, 1);
    writeUsers(users);

    for (const [token, session] of sessions.entries()) {
      if (session.email === email) {
        sessions.delete(token);
      }
    }
    saveSessionsToFile();

    return res.json({ ok: true, email });
  },
);

app.get("/api/admin/login-logs", requireAdmin, (req, res) => {
  pruneOldLoginLogs();
  const requestedLimit = Number.parseInt(String(req.query.limit || "100"), 10);
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(1, Math.min(500, requestedLimit))
    : 100;

  const logs = readLoginLogs().slice(0, limit);
  return res.json({ logs });
});

app.post(
  "/api/admin/clear-login-logs",
  requireAdmin,
  requireAdminCsrf,
  (req, res) => {
    const olderThanDaysRaw = req.body?.olderThanDays;

    if (
      olderThanDaysRaw === undefined ||
      olderThanDaysRaw === null ||
      olderThanDaysRaw === ""
    ) {
      const previous = readLoginLogs();
      writeLoginLogs([]);
      return res.json({
        ok: true,
        removed: previous.length,
        remaining: 0,
        mode: "all",
      });
    }

    const olderThanDays = Number.parseInt(String(olderThanDaysRaw), 10);
    if (!Number.isFinite(olderThanDays) || olderThanDays < 0) {
      return res
        .status(400)
        .json({ error: "Invalid olderThanDays", code: "BAD_INPUT" });
    }

    const logs = readLoginLogs();
    const thresholdMs = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    const kept = logs.filter((log) => {
      const ts = Date.parse(String(log.time || ""));
      if (Number.isNaN(ts)) {
        return true;
      }
      return ts >= thresholdMs;
    });

    writeLoginLogs(kept);
    return res.json({
      ok: true,
      removed: logs.length - kept.length,
      remaining: kept.length,
      mode: "older-than-days",
      olderThanDays,
    });
  },
);

app.get("/api/data/:direction", requireAuth, (req, res) => {
  const direction = req.params.direction;
  const source = direction === "sk-en" ? DATASET_SK_EN : DATASET_EN_SK;

  try {
    const payload = fs.readFileSync(source, "utf8");
    return res.type("application/json").send(payload);
  } catch {
    return res
      .status(500)
      .json({ error: "Unable to load dataset", code: "DATASET_ERROR" });
  }
});

app.get(["/vocabulary.json", "/vocabulary_sk_to_en.json"], (_req, res) => {
  return res
    .status(403)
    .json({ error: "Forbidden", code: "DATASET_FORBIDDEN" });
});

app.use(express.static(ROOT_DIR));

loadSessionsFromFile();
pruneOldLoginLogs();

if (IS_PRODUCTION && ADMIN_SECRET === "change-me") {
  console.error("Refusing to start in production with default ADMIN_SECRET.");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (ADMIN_SECRET === "change-me") {
    console.log("Warning: set ADMIN_SECRET env var in production.");
  }
});
