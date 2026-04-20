const adminSecretInput = document.getElementById("adminSecret");
const adminThemeToggle = document.getElementById("adminThemeToggle");
const adminThemeTogglePanel = document.getElementById("adminThemeTogglePanel");
const adminAuthGate = document.getElementById("adminAuthGate");
const adminContent = document.getElementById("adminContent");
const adminEnterBtn = document.getElementById("adminEnterBtn");
const adminLogoutBtn = document.getElementById("adminLogoutBtn");
const exportUsersBtn = document.getElementById("exportUsersBtn");
const loadUsersBtn = document.getElementById("loadUsersBtn");
const loadLogsBtn = document.getElementById("loadLogsBtn");
const clearOldLogsBtn = document.getElementById("clearOldLogsBtn");
const clearAllLogsBtn = document.getElementById("clearAllLogsBtn");
const logsOlderThanDays = document.getElementById("logsOlderThanDays");
const createUserBtn = document.getElementById("createUserBtn");
const newUserEmail = document.getElementById("newUserEmail");
const newUserPassword = document.getElementById("newUserPassword");
const newUserActive = document.getElementById("newUserActive");
const adminMessage = document.getElementById("adminMessage");
const usersTbody = document.getElementById("usersTbody");
const logsTbody = document.getElementById("logsTbody");

const THEME_STORAGE_KEY = "quiz_theme_dark";
let activeAdminSecret = "";
let adminCsrfToken = "";

function getStoredThemeIsDark() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === null) {
    return true;
  }
  return stored === "1";
}

function updateThemeToggleIcon() {
  const isDark = document.body.classList.contains("dark");
  if (adminThemeToggle) {
    adminThemeToggle.textContent = isDark ? "☾" : "☀︎";
  }
  if (adminThemeTogglePanel) {
    adminThemeTogglePanel.textContent = isDark ? "☾" : "☀︎";
  }
}

function setTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "1" : "0");
  updateThemeToggleIcon();
}

function setMessage(message, type = "") {
  if (!adminMessage) return;
  adminMessage.textContent = message;
  adminMessage.classList.remove("error", "success");
  if (type) {
    adminMessage.classList.add(type);
  }
}

function setAdminUnlocked(isUnlocked) {
  if (adminAuthGate) {
    adminAuthGate.classList.toggle("hidden", isUnlocked);
  }
  if (adminContent) {
    adminContent.classList.toggle("hidden", !isUnlocked);
  }
}

function getAdminSecret() {
  const typed = String(adminSecretInput?.value || "").trim();
  return typed || activeAdminSecret;
}

function clearAdminSessionState() {
  activeAdminSecret = "";
  adminCsrfToken = "";
}

async function refreshAdminCsrfToken(secret) {
  const response = await fetch("/api/admin/csrf", {
    method: "GET",
    headers: {
      "x-admin-secret": secret,
    },
    credentials: "same-origin",
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok || !payload.csrfToken) {
    const error = new Error(
      payload.error || "Unable to initialize CSRF token.",
    );
    error.code = payload.code || "ADMIN_CSRF_BOOTSTRAP_FAILED";
    throw error;
  }

  adminCsrfToken = String(payload.csrfToken);
}

async function adminRequest(path, options = {}) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Zadaj admin secret.");
  }

  const method = String(options.method || "GET").toUpperCase();
  const isMutating = method !== "GET" && path.startsWith("/api/admin/");

  if (isMutating && !adminCsrfToken) {
    await refreshAdminCsrfToken(secret);
  }

  const headers = {
    "Content-Type": "application/json",
    "x-admin-secret": secret,
    ...(isMutating && adminCsrfToken ? { "x-csrf-token": adminCsrfToken } : {}),
    ...(options.headers || {}),
  };

  let response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  });

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    if (
      isMutating &&
      (payload.code === "ADMIN_CSRF_REQUIRED" ||
        payload.code === "ADMIN_CSRF_INVALID")
    ) {
      await refreshAdminCsrfToken(secret);
      const retryHeaders = {
        ...headers,
        "x-csrf-token": adminCsrfToken,
      };
      response = await fetch(path, {
        ...options,
        headers: retryHeaders,
        credentials: "same-origin",
      });
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }
    }
  }

  if (!response.ok) {
    const code = payload.code || "REQUEST_FAILED";
    let message = payload.error || "Request failed";

    if (code === "ADMIN_FORBIDDEN") {
      message =
        "Nespravny admin secret. Skontroluj ADMIN_SECRET pri spusteni servera.";
    } else if (code === "ADMIN_RATE_LIMITED") {
      message =
        "Prilis vela zlych pokusov. Pockaj 10 minut alebo restartuj server.";
    }

    const error = new Error(message);
    error.code = code;
    throw error;
  }

  activeAdminSecret = secret;
  return payload;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("sk-SK");
}

function renderUsers(users) {
  usersTbody.innerHTML = "";

  if (!users || users.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Zatiaľ nie sú vytvorené účty.";
    row.appendChild(cell);
    usersTbody.appendChild(row);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement("tr");

    const emailTd = document.createElement("td");
    emailTd.textContent = user.email;

    const statusTd = document.createElement("td");
    statusTd.textContent = user.isActive ? "Aktívny" : "Neaktívny";

    const deviceTd = document.createElement("td");
    deviceTd.textContent = user.lockedDeviceId || "Nezamknuté";

    const createdTd = document.createElement("td");
    createdTd.textContent = formatDate(user.createdAt);

    const actionsTd = document.createElement("td");
    actionsTd.className = "admin-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "ghost";
    toggleBtn.textContent = user.isActive ? "Deaktivovať" : "Aktivovať";
    toggleBtn.addEventListener("click", async () => {
      try {
        await adminRequest("/api/admin/set-active", {
          method: "POST",
          body: JSON.stringify({
            email: user.email,
            isActive: !user.isActive,
          }),
        });
        setMessage(`Učet ${user.email} bol upravený.`, "success");
        await loadUsers();
      } catch (error) {
        setMessage(error.message, "error");
      }
    });

    const resetDeviceBtn = document.createElement("button");
    resetDeviceBtn.type = "button";
    resetDeviceBtn.className = "ghost";
    resetDeviceBtn.textContent = "Reset zariadenia";
    resetDeviceBtn.addEventListener("click", async () => {
      try {
        await adminRequest("/api/admin/reset-device", {
          method: "POST",
          body: JSON.stringify({ email: user.email }),
        });
        setMessage(`Zariadenie pre ${user.email} bolo resetované.`, "success");
        await loadUsers();
      } catch (error) {
        setMessage(error.message, "error");
      }
    });

    actionsTd.appendChild(toggleBtn);
    actionsTd.appendChild(resetDeviceBtn);

    const deleteUserBtn = document.createElement("button");
    deleteUserBtn.type = "button";
    deleteUserBtn.className = "ghost";
    deleteUserBtn.textContent = "Zmazať";
    deleteUserBtn.addEventListener("click", async () => {
      const confirmed = window.confirm(
        `Naozaj chceš zmazať používateľa ${user.email}?`,
      );
      if (!confirmed) return;

      try {
        await adminRequest("/api/admin/delete-user", {
          method: "POST",
          body: JSON.stringify({ email: user.email }),
        });
        setMessage(`Používateľ ${user.email} bol zmazaný.`, "success");
        await loadUsers();
      } catch (error) {
        setMessage(error.message, "error");
      }
    });

    actionsTd.appendChild(deleteUserBtn);

    row.appendChild(emailTd);
    row.appendChild(statusTd);
    row.appendChild(deviceTd);
    row.appendChild(createdTd);
    row.appendChild(actionsTd);

    usersTbody.appendChild(row);
  });
}

function renderLogs(logs) {
  logsTbody.innerHTML = "";

  if (!logs || logs.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = "Zatiaľ nie sú žiadne logy prihlásení.";
    row.appendChild(cell);
    logsTbody.appendChild(row);
    return;
  }

  logs.forEach((log) => {
    const row = document.createElement("tr");

    const timeTd = document.createElement("td");
    timeTd.textContent = formatDate(log.time);

    const emailTd = document.createElement("td");
    emailTd.textContent = log.email || "-";

    const ipTd = document.createElement("td");
    ipTd.textContent = log.ip || "-";

    const deviceTd = document.createElement("td");
    deviceTd.textContent = log.deviceId || "-";

    const resultTd = document.createElement("td");
    resultTd.textContent = `${log.result || "-"} (${log.code || "-"})`;

    row.appendChild(timeTd);
    row.appendChild(emailTd);
    row.appendChild(ipTd);
    row.appendChild(deviceTd);
    row.appendChild(resultTd);

    logsTbody.appendChild(row);
  });
}

async function loadUsers() {
  const data = await adminRequest("/api/admin/users");
  renderUsers(data.users || []);
}

async function loadLogs() {
  const data = await adminRequest("/api/admin/login-logs?limit=150");
  renderLogs(data.logs || []);
}

async function createUser() {
  const email = String(newUserEmail?.value || "")
    .trim()
    .toLowerCase();
  const password = String(newUserPassword?.value || "").trim();

  if (!email || !password) {
    setMessage("Vyplň email aj heslo.", "error");
    return;
  }

  await adminRequest("/api/admin/create-user", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      isActive: Boolean(newUserActive?.checked),
    }),
  });

  newUserEmail.value = "";
  newUserPassword.value = "";
  setMessage(`Učet ${email} bol vytvorený.`, "success");
  await loadUsers();
}

async function exportUsers() {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Zadaj admin secret.");
  }

  const response = await fetch("/api/admin/export-users", {
    method: "GET",
    headers: {
      "x-admin-secret": secret,
    },
  });

  if (!response.ok) {
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      payload = {};
    }
    throw new Error(payload.error || "Export failed");
  }

  saveAdminSecret(secret);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const cd = response.headers.get("content-disposition") || "";
  const match = cd.match(/filename=\"?([^\";]+)\"?/i);
  const filename = match?.[1] || `users-backup-${Date.now()}.json`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function clearLogs(olderThanDays = null) {
  const body =
    olderThanDays === null
      ? {}
      : {
          olderThanDays,
        };

  const data = await adminRequest("/api/admin/clear-login-logs", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return data;
}

if (loadUsersBtn) {
  loadUsersBtn.addEventListener("click", async () => {
    try {
      setMessage("Načítavam účty...");
      await loadUsers();
      setMessage("Účty načítané.", "success");
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (loadLogsBtn) {
  loadLogsBtn.addEventListener("click", async () => {
    try {
      await loadLogs();
      setMessage("Logy načítané.", "success");
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (clearOldLogsBtn) {
  clearOldLogsBtn.addEventListener("click", async () => {
    const days = Number.parseInt(String(logsOlderThanDays?.value || ""), 10);
    if (!Number.isFinite(days) || days < 0) {
      setMessage("Zadaj platný počet dní (0 alebo viac).", "error");
      return;
    }

    const confirmed = window.confirm(`Zmazať logy staršie ako ${days} dní?`);
    if (!confirmed) return;

    try {
      const result = await clearLogs(days);
      await loadLogs();
      setMessage(
        `Hotovo. Zmazané: ${result.removed}, zostáva: ${result.remaining}.`,
        "success",
      );
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (clearAllLogsBtn) {
  clearAllLogsBtn.addEventListener("click", async () => {
    const confirmed = window.confirm("Naozaj chceš zmazať všetky audit logy?");
    if (!confirmed) return;

    try {
      const result = await clearLogs(null);
      await loadLogs();
      setMessage(
        `Všetky logy zmazané. Počet zmazaných: ${result.removed}.`,
        "success",
      );
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (exportUsersBtn) {
  exportUsersBtn.addEventListener("click", async () => {
    try {
      await exportUsers();
      setMessage("Export používateľov bol stiahnutý.", "success");
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (createUserBtn) {
  createUserBtn.addEventListener("click", async () => {
    try {
      await createUser();
    } catch (error) {
      setMessage(error.message, "error");
    }
  });
}

if (adminEnterBtn) {
  adminEnterBtn.addEventListener("click", async () => {
    try {
      setMessage("Overujem admin secret...");
      await loadUsers();
      await loadLogs();
      await refreshAdminCsrfToken(getAdminSecret());
      setAdminUnlocked(true);
      setMessage("Admin panel odomknutý.", "success");
    } catch (error) {
      setAdminUnlocked(false);
      clearAdminSessionState();
      setMessage(error.message, "error");
    }
  });
}

if (adminSecretInput) {
  adminSecretInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      adminEnterBtn.click();
    }
  });
}

if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", () => {
    clearAdminSessionState();
    if (adminSecretInput) {
      adminSecretInput.value = "";
    }
    renderUsers([]);
    renderLogs([]);
    setAdminUnlocked(false);
    setMessage("Admin bol odhlásený.", "success");
  });
}

if (adminThemeToggle) {
  adminThemeToggle.addEventListener("click", () => {
    setTheme(!document.body.classList.contains("dark"));
  });
}

if (adminThemeTogglePanel) {
  adminThemeTogglePanel.addEventListener("click", () => {
    setTheme(!document.body.classList.contains("dark"));
  });
}

setAdminUnlocked(false);
setTheme(getStoredThemeIsDark());
