# Azure Student Deploy Guide (Node App, 24/7, HTTPS, Secure)

This guide deploys your app on Azure VM with:

- 24/7 running service
- HTTPS with automatic cert renewal
- reverse proxy
- basic hardening
- persistent local data files

This approach fits your current architecture (JSON files in `data/`).

## 0) Before you start

You need:

- Azure Student subscription active
- Domain name (recommended)
- GitHub repository
- SSH key pair

Generate strong admin secret locally:

```bash
openssl rand -hex 32
```

## 1) Create Ubuntu VM in Azure

In Azure Portal:

1. Create resource -> Virtual machine
2. Subscription: your Student subscription
3. Resource group: create new (for example `rg-anj-sz-apka`)
4. VM name: `vm-anj-sz-apka`
5. Region: nearest to users
6. Image: Ubuntu Server 24.04 LTS (or 22.04)
7. Size:
   - Start with B1s or B1ms (watch student credit)
8. Authentication type: SSH public key
9. Username: `azureuser`
10. Inbound ports: allow SSH (22), HTTP (80), HTTPS (443)
11. Create

## 2) Reserve static public IP (important)

1. Open VM -> Networking -> Public IP address
2. Set Assignment to Static
3. Save

This prevents IP changes that would break DNS/HTTPS.

## 3) DNS setup

At your DNS provider:

- Add A record to VM public IP
  - Host: `@` or `app`
  - Value: VM static IP

Wait for DNS propagation.

## 4) SSH into VM

```bash
ssh -i /path/to/private_key azureuser@YOUR_VM_IP
```

## 5) Update system and install essentials

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw fail2ban
```

Install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 6) Configure firewall

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

## 7) Prepare app directory and user

```bash
sudo adduser --disabled-password --gecos "" appuser
sudo usermod -aG sudo appuser
sudo mkdir -p /opt/anj-sz-apka
sudo chown -R appuser:appuser /opt/anj-sz-apka
```

Switch to app user:

```bash
sudo -u appuser -H bash
cd /opt/anj-sz-apka
```

## 8) Clone app and install dependencies

```bash
git clone https://github.com/DejviDes/anj-sz-apka.git .
npm ci
mkdir -p data
chmod 700 data
```

## 9) Create production env file

Create `/opt/anj-sz-apka/.env`:

```env
NODE_ENV=production
PORT=3000
ADMIN_SECRET=PUT_LONG_RANDOM_SECRET_HERE
TRUST_PROXY=1
LOGIN_LOG_RETENTION_DAYS=90
```

Secure file permissions:

```bash
chmod 600 .env
```

## 10) Create systemd service (auto start + restart)

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

Start service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable anj-sz-apka
sudo systemctl start anj-sz-apka
sudo systemctl status anj-sz-apka --no-pager
```

Logs:

```bash
sudo journalctl -u anj-sz-apka -f
```

## 11) Install Caddy (HTTPS + reverse proxy)

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

## 12) Verify deployment

```bash
curl -I https://your-domain.com
```

Then open:

- `https://your-domain.com`
- `https://your-domain.com/admin.html`

Check cookies in browser devtools:

- `quiz_session` should be `Secure` + `HttpOnly`

## 13) Update deployment (new version)

```bash
sudo -u appuser -H bash -lc 'cd /opt/anj-sz-apka && git pull && npm ci'
sudo systemctl restart anj-sz-apka
sudo systemctl status anj-sz-apka --no-pager
```

## 14) Backup `data/` daily

Create backup folder:

```bash
sudo -u appuser mkdir -p /opt/anj-sz-apka/backups
```

Add cron for appuser:

```bash
sudo -u appuser crontab -l 2>/dev/null | cat
```

Add line:

```cron
0 3 * * * tar -czf /opt/anj-sz-apka/backups/data-$(date +\%F).tgz -C /opt/anj-sz-apka data
```

Optional but recommended:

- upload backups to external storage (Azure Blob, S3-compatible, etc.)

## 15) Cost control for Azure Student

- Always monitor Credits in Azure Portal
- VM must stay running for 24/7, so watch budget
- Stop/delete unused resources:
  - unattached disks
  - extra public IPs
  - snapshots you do not need

## 16) Security checklist

- Keep `NODE_ENV=production`
- Keep long random `ADMIN_SECRET`
- Use HTTPS only
- Do not expose port 3000 publicly
- Keep `/opt/anj-sz-apka/.env` readable only by owner
- Keep server updated (`apt upgrade` regularly)

## 17) Troubleshooting

Service not starting:

```bash
sudo journalctl -u anj-sz-apka -n 200 --no-pager
```

HTTPS not issuing:

- DNS A record must point to VM static IP
- NSG + UFW must allow 80/443
- Check Caddy logs:

```bash
sudo journalctl -u caddy -n 200 --no-pager
```

Admin login fails:

- check `.env` `ADMIN_SECRET`
- restart service after env changes:

```bash
sudo systemctl restart anj-sz-apka
```

## 18) Optional: Azure App Service route

Possible, but not ideal for your current JSON file persistence model. If you want App Service anyway, migrate data to managed DB first.

Done. This is the practical Azure Student path for your current app and production-like security.
