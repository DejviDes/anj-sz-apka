const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const USERS_PATH = path.join(__dirname, "..", "data", "users.json");

function ensureUsersFile() {
  if (!fs.existsSync(USERS_PATH)) {
    fs.mkdirSync(path.dirname(USERS_PATH), { recursive: true });
    fs.writeFileSync(USERS_PATH, "[]\n", "utf8");
  }
}

function readUsers() {
  ensureUsersFile();
  return JSON.parse(fs.readFileSync(USERS_PATH, "utf8"));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_PATH, `${JSON.stringify(users, null, 2)}\n`, "utf8");
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

function validatePasswordStrength(password) {
  if (typeof password !== "string") return false;
  const hasMinLen = password.length >= 10;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  return hasMinLen && hasLower && hasUpper && hasDigit;
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const email = String(process.argv[2] || "")
  .trim()
  .toLowerCase();
const password = String(process.argv[3] || "").trim();

if (!email || !password) {
  console.error("Usage: npm run create-user -- <email> <password>");
  process.exit(1);
}

if (!isValidEmail(email)) {
  console.error("Invalid email format.");
  process.exit(1);
}

if (!validatePasswordStrength(password)) {
  console.error("Weak password. Use at least 10 chars with upper/lower/digit.");
  process.exit(1);
}

const users = readUsers();
if (users.some((u) => u.email === email)) {
  console.error("User already exists.");
  process.exit(1);
}

const pass = createPasswordHash(password);
const now = new Date().toISOString();
users.push({
  email,
  passwordHash: pass.hash,
  passwordSalt: pass.salt,
  isActive: true,
  lockedDeviceId: null,
  createdAt: now,
  updatedAt: now,
});
writeUsers(users);

console.log(`User created: ${email}`);
