# Oracle Always Free Deploy Guide (24/7 + HTTPS + Security)

This guide deploys your Node app on Oracle Cloud Always Free with:

- 24/7 running service
- HTTPS (automatic certificate)
- reverse proxy
- basic server hardening
- restart on reboot/crash

## 0) What you need before start

- Oracle Cloud account (Always Free)
- A domain name (recommended)
- GitHub repository with your app
- Local generated strong admin secret

Generate a strong admin secret locally:

```bash
openssl rand -hex 32
```

## 1) Create Oracle VM (Always Free)

In Oracle Cloud Console:

1. Go to Compute -> Instances -> Create instance
2. Name: for example `vocab-app-prod`
3. Image: Ubuntu 24.04 LTS (or Ubuntu 22.04 LTS)
4. Shape: Always Free eligible
   - Preferred: Ampere A1 Flex (if available)
   - Otherwise: E2 Micro Always Free
5. Networking:
   - Put in public subnet
   - Assign public IPv4
6. Add SSH key (download private key if generated there)
7. Create instance

## 2) Open required ports

You must allow traffic in BOTH places:

- VCN Security List / NSG (Oracle network layer)
- OS firewall (UFW on VM)

Allow these inbound ports:

- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)

Do NOT expose 3000 publicly.

## 3) Point domain to VM

At your DNS provider:

- Add A record:
  - Host: your domain (or subdomain like `app`)
  - Value: VM public IP

Wait for DNS propagation.

## 4) SSH into server

From your local machine:

```bash
ssh -i /path/to/private_key ubuntu@YOUR_VM_PUBLIC_IP
```

(Username can differ by image, usually `ubuntu`.)

## 5) Prepare server packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git ufw fail2ban curl
```

Install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 6) Basic firewall hardening

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Enable fail2ban:

```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
sudo systemctl status fail2ban --no-pager
```

## 7) Create deploy user (recommended)

```bash
sudo adduser --disabled-password --gecos "" appuser
sudo usermod -aG sudo appuser
sudo mkdir -p /opt/anj-sz-apka
sudo chown -R appuser:appuser /opt/anj-sz-apka
```

Switch user:

```bash
sudo -u appuser -H bash
cd /opt/anj-sz-apka
```

## 8) Pull app code and install deps

If repository is public:

```bash
git clone https://github.com/DejviDes/anj-sz-apka.git .
npm ci
```

If repository is private, configure SSH key for `appuser` and clone over SSH.

Create data folder and set permissions:

```bash
mkdir -p data
chmod 700 data
```

## 9) Create production environment file

As `appuser`, create `/opt/anj-sz-apka/.env`:

```env
NODE_ENV=production
PORT=3000
ADMIN_SECRET=PUT_YOUR_LONG_RANDOM_SECRET_HERE
TRUST_PROXY=1
LOGIN_LOG_RETENTION_DAYS=90
```

Protect env file:

```bash
chmod 600 .env
```

## 10) Create systemd service (auto-start + auto-restart)

Exit to your sudo-capable shell if needed and create service:

```bash
sudo tee /etc/systemd/system/anj-sz-apka.service >/dev/null <<'EOF'
[Unit]
Description=anj-sz-apka node service
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/anj-sz-apka
EnvironmentFile=/opt/anj-sz-apka/.env
ExecStart=/usr/bin/node /opt/anj-sz-apka/server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=/opt/anj-sz-apka/data

[Install]
WantedBy=multi-user.target
EOF
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable anj-sz-apka
sudo systemctl start anj-sz-apka
sudo systemctl status anj-sz-apka --no-pager
```

Check logs:

```bash
sudo journalctl -u anj-sz-apka -f
```

## 11) Install Caddy for HTTPS reverse proxy

Install Caddy:

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

Create Caddy config:

```bash
sudo tee /etc/caddy/Caddyfile >/dev/null <<'EOF'
your-domain.com {
  encode zstd gzip
  reverse_proxy 127.0.0.1:3000
}

www.your-domain.com {
  redir https://your-domain.com{uri} permanent
}
EOF
```

Reload Caddy:

```bash
sudo systemctl reload caddy
sudo systemctl status caddy --no-pager
```

Caddy will automatically issue and renew TLS certificates.

## 12) Verify production behavior

Check app is up:

```bash
curl -I https://your-domain.com
```

Open in browser:

- `https://your-domain.com`
- `https://your-domain.com/admin.html`

Verify cookies are secure in production:

- open devtools network/cookies
- confirm `quiz_session` has `Secure` and `HttpOnly`

## 13) Backup strategy for data

Your app state is in:

- `/opt/anj-sz-apka/data/users.json`
- `/opt/anj-sz-apka/data/login_logs.json`
- `/opt/anj-sz-apka/data/sessions.json`

Simple daily local backup:

```bash
mkdir -p /opt/anj-sz-apka/backups
(crontab -l 2>/dev/null; echo "0 3 * * * tar -czf /opt/anj-sz-apka/backups/data-$(date +\%F).tgz -C /opt/anj-sz-apka data") | crontab -
```

Recommended: copy backups to remote storage as well.

## 14) Deploy updates safely

As `appuser`:

```bash
cd /opt/anj-sz-apka
git pull
npm ci
```

Restart service:

```bash
sudo systemctl restart anj-sz-apka
sudo systemctl status anj-sz-apka --no-pager
```

## 15) Quick troubleshooting

- App not starting:
  - `sudo journalctl -u anj-sz-apka -n 200 --no-pager`
- HTTPS not issuing:
  - DNS A record must point to VM
  - ports 80/443 must be open in Oracle + UFW
  - `sudo journalctl -u caddy -n 200 --no-pager`
- Admin login failing:
  - verify `ADMIN_SECRET` in `.env`
  - restart app service after changing `.env`

## 16) Security checklist (must-have)

- Use long random `ADMIN_SECRET`
- Keep `NODE_ENV=production`
- Keep HTTPS only for users
- Keep data directory private (never serve directly)
- Keep system packages updated regularly
- Disable password SSH login (key-only), optional but recommended

Done. This setup is suitable for 24/7 Always Free hosting with practical production security for your current app architecture.
