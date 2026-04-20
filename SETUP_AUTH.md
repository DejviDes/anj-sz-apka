# Auth + Device Lock Setup

## 1) Install and run

```bash
npm install
ADMIN_SECRET=your-very-secret-value npm run dev
```

Open `http://localhost:3000`.

Safari note (localhost):

- Use `http://localhost:3000` (not `https://localhost:3000`) unless you configure local TLS certificates.
- If Safari auto-upgrades to HTTPS, disable "Use HTTPS for all websites" for local testing or explicitly load the HTTP version.

## 2) Open admin web panel

Open:

http://localhost:3000/admin.html

In panel:

- First screen is only "Admin prihlásenie" (other admin elements are hidden)
- Enter `ADMIN_SECRET` and click "Prihlásiť do admin panelu"
- Admin secret is not persisted in browser storage; after refresh you must enter it again
- Then create users directly in the form
- Use row actions for Activate/Deactivate and Reset zariadenia
- Use row action "Zmazať" when user should be removed
- Use button "Exportovať používateľov" for downloadable backup JSON
- Use "Obnoviť logy" to see login audit
- Use "Zmazať staré logy" or "Zmazať všetky logy" when cleanup is needed

## 3) Optional CLI create user

```bash
npm run create-user -- user@example.com StrongPass123
```

## 4) Login behavior

- First successful login locks account to that browser/device (`deviceId`).
- Next login from other device is blocked with `DEVICE_LOCKED`.
- Same device continues to work normally.
- Password stays exactly as you created it. There is no forced password change on first login.
- Login has rate limit on failed attempts (per IP window) and can return `RATE_LIMITED`.
- Session is now stored as secure cookie (`quiz_session`) and persisted on server in `data/sessions.json`.

## 5) Audit log

- Login attempts are stored in `data/login_logs.json`.
- Each record includes: time, IP, email, deviceId, result/code.
- Logs are visible directly in admin panel table.

## 6) Admin API endpoints (optional)

Send header `x-admin-secret: <ADMIN_SECRET>`.

Create user:

```bash
curl -X POST http://localhost:3000/api/admin/create-user \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{"email":"user@example.com","password":"StrongPass123","isActive":true}'
```

Reset locked device:

```bash
curl -X POST http://localhost:3000/api/admin/reset-device \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{"email":"user@example.com"}'
```

Deactivate/activate user:

```bash
curl -X POST http://localhost:3000/api/admin/set-active \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{"email":"user@example.com","isActive":false}'
```

List users:

```bash
curl -X GET http://localhost:3000/api/admin/users \
  -H 'x-admin-secret: your-very-secret-value'
```

List login logs:

```bash
curl -X GET 'http://localhost:3000/api/admin/login-logs?limit=100' \
  -H 'x-admin-secret: your-very-secret-value'
```

Export users backup:

```bash
curl -X GET 'http://localhost:3000/api/admin/export-users' \
  -H 'x-admin-secret: your-very-secret-value' -o users-backup.json
```

Delete user:

```bash
curl -X POST 'http://localhost:3000/api/admin/delete-user' \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{"email":"user@example.com"}'
```

Clear all login logs:

```bash
curl -X POST 'http://localhost:3000/api/admin/clear-login-logs' \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{}'
```

Clear login logs older than X days:

```bash
curl -X POST 'http://localhost:3000/api/admin/clear-login-logs' \
  -H 'Content-Type: application/json' \
  -H 'x-admin-secret: your-very-secret-value' \
  -d '{"olderThanDays":30}'
```

## 7) Production notes

- Always set strong `ADMIN_SECRET` in environment.
- Keep HTTPS enabled.
- Do not commit `data/users.json`.
- Do not commit `data/login_logs.json`.
- Do not commit `data/sessions.json`.
- This is a practical lock model, not cryptographically unbreakable web DRM.

## 8) Security hardening status

Implemented now:

- Security headers via `helmet`.
- Cookie-only auth (`HttpOnly`, `SameSite=Lax`, `Secure` in production).
- CSRF protection for admin POST endpoints (`x-csrf-token` + cookie pair).
- Persistent sessions across restart (`data/sessions.json`).
- Automatic cleanup of expired sessions from memory and disk.
- Login rate limit and admin-secret rate limit.
- Password strength policy for user creation (min 10 chars + upper + lower + digit).
- Email format validation for login and user creation.
- Login log retention pruning (`LOGIN_LOG_RETENTION_DAYS`, default 90).
- API responses marked as `Cache-Control: no-store`.
- Production startup is blocked when `ADMIN_SECRET` stays on default value `change-me`.

Recommended env vars for deploy:

```bash
NODE_ENV=production
ADMIN_SECRET=replace-with-strong-secret
TRUST_PROXY=1
LOGIN_LOG_RETENTION_DAYS=90
```

Current status:

- Main production hardening items are implemented for this architecture.
