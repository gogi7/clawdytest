# Full Self-Hosting Guide (No Cloud Services)

How to host a website from your home PC without Cloudflare, ngrok, or any tunnel service — just your internet connection and your hardware.

**Difficulty:** ⭐⭐⭐ Advanced  
**Time:** 2-4 hours  
**Prerequisites:** Basic Linux/networking knowledge

---

## Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                         │
│                                                                              │
│  User types: https://clawdytest.example.com                                  │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                         DNS PROVIDER                                          │
│                                                                              │
│  clawdytest.example.com → 203.45.67.89 (your public IP)                     │
│  (or DDNS: yoursite.duckdns.org)                                            │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                           YOUR ROUTER                                         │
│                                                                              │
│  Port Forwarding:                                                            │
│    External 80  → 192.168.1.100:80                                          │
│    External 443 → 192.168.1.100:443                                         │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            YOUR PC/SERVER                                     │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                        FIREWALL (UFW)                               │    │
│   │            Allow: 80, 443, 22 (SSH) — Block everything else        │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │              REVERSE PROXY (Caddy or Nginx)                         │    │
│   │                                                                     │    │
│   │   - Listens on ports 80/443                                        │    │
│   │   - Handles SSL/TLS (HTTPS)                                        │    │
│   │   - Auto-obtains Let's Encrypt certificates                        │    │
│   │   - Routes traffic to internal apps                                │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                    YOUR APPLICATIONS                                │    │
│   │                                                                     │    │
│   │   PM2 / Docker / systemd                                           │    │
│   │     ├── clawdytest     → localhost:3000                            │    │
│   │     ├── another-app    → localhost:3001                            │    │
│   │     └── api-server     → localhost:8080                            │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Prerequisites Check

Before starting, verify you can self-host:

### 1. Check if your ISP allows it

```bash
# From your PC, check your public IP
curl ifconfig.me
```

Then check if ports 80/443 are blocked:
- Use https://canyouseeme.org/ after setting up port forwarding
- Some ISPs block these ports on residential connections

### 2. Check for CGNAT

If your public IP starts with `100.64.x.x` to `100.127.x.x`, you're behind CGNAT (Carrier-Grade NAT) and **cannot self-host** without calling your ISP.

```bash
# Your router's WAN IP should match this
curl ifconfig.me
```

### 3. Check your router

You need access to your router's admin panel to set up port forwarding.

---

## Part 1: Domain & DNS

### Option A: Own Domain (Recommended)

Buy a cheap domain (~$10-15/year):
- Namecheap
- Cloudflare Registrar
- Porkbun
- Google Domains

Point it to your IP:
```
Type: A
Name: clawdytest (or @)
Value: YOUR_PUBLIC_IP
TTL: 300 (5 min, for testing)
```

### Option B: Free Dynamic DNS (DDNS)

If your IP changes (most home internet), use free DDNS:

**DuckDNS (Free):**
1. Go to https://www.duckdns.org
2. Sign in with Google/GitHub
3. Create subdomain: `yourname.duckdns.org`
4. Note your token

**Auto-update script (add to cron):**
```bash
# Update DuckDNS every 5 minutes
*/5 * * * * curl -s "https://www.duckdns.org/update?domains=yourname&token=YOUR_TOKEN&ip="
```

**No-IP (Free):**
1. Go to https://www.noip.com
2. Create hostname: `yourname.ddns.net`
3. Install their update client

---

## Part 2: Router Configuration

### Port Forwarding

Access your router (usually http://192.168.1.1 or http://192.168.0.1)

Add these port forwards:

| External Port | Internal IP | Internal Port | Protocol |
|---------------|-------------|---------------|----------|
| 80 | 192.168.1.100 | 80 | TCP |
| 443 | 192.168.1.100 | 443 | TCP |
| 22 | 192.168.1.100 | 22 | TCP (optional, for SSH) |

Replace `192.168.1.100` with your PC's local IP.

**Find your local IP:**
```bash
# Linux/WSL2
ip addr show | grep "inet 192"

# Or
hostname -I
```

### Reserve IP (DHCP Reservation)

Make sure your PC always gets the same local IP:
- Router → DHCP settings → Reserve IP by MAC address

---

## Part 3: Firewall Setup

### UFW (Uncomplicated Firewall) on Ubuntu/WSL2

```bash
# Install
sudo apt install ufw

# Default: deny incoming, allow outgoing
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow specific ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Fail2Ban (Brute Force Protection)

```bash
# Install
sudo apt install fail2ban

# Start and enable
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

---

## Part 4: Reverse Proxy

### Option A: Caddy (Recommended - Easiest)

Caddy automatically handles SSL certificates!

**Install Caddy:**
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**Configure Caddy:**
```bash
sudo nano /etc/caddy/Caddyfile
```

```
# /etc/caddy/Caddyfile

clawdytest.yourdomain.com {
    reverse_proxy localhost:3000
}

# Add more sites:
api.yourdomain.com {
    reverse_proxy localhost:8080
}
```

**Start Caddy:**
```bash
sudo systemctl enable caddy
sudo systemctl start caddy

# Check status
sudo systemctl status caddy

# View logs
sudo journalctl -u caddy -f
```

Caddy will automatically:
- Obtain SSL certificate from Let's Encrypt
- Redirect HTTP to HTTPS
- Renew certificates before expiry

### Option B: Nginx (More Control)

**Install:**
```bash
sudo apt install nginx
```

**Configure site:**
```bash
sudo nano /etc/nginx/sites-available/clawdytest
```

```nginx
server {
    listen 80;
    server_name clawdytest.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name clawdytest.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/clawdytest /etc/nginx/sites-enabled/
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

**Get SSL certificate with Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d clawdytest.yourdomain.com
```

---

## Part 5: SSL Certificates

### With Caddy
Automatic! Caddy handles everything.

### With Nginx + Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate (interactive)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Or standalone (if nginx not configured yet)
sudo certbot certonly --standalone -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Certificates are stored in `/etc/letsencrypt/live/yourdomain.com/`

### Wildcard Certificates (*.yourdomain.com)

Requires DNS challenge:
```bash
sudo certbot certonly --manual --preferred-challenges dns -d "*.yourdomain.com"
```

---

## Part 6: Run Your App

### Using PM2 (Node.js apps)

```bash
# Install PM2
npm install -g pm2

# Start app
cd /path/to/clawdytest
pm2 start npm --name "clawdytest" -- start

# Auto-start on boot
pm2 startup systemd
pm2 save
```

### Using Docker

```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t clawdytest .
docker run -d -p 3000:3000 --name clawdytest --restart unless-stopped clawdytest
```

### Using Docker Compose (Multiple Apps)

```yaml
# docker-compose.yml
version: '3.8'
services:
  clawdytest:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
    
  caddy:
    image: caddy:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
    restart: unless-stopped

volumes:
  caddy_data:
```

### Using systemd (Native Linux)

```bash
sudo nano /etc/systemd/system/clawdytest.service
```

```ini
[Unit]
Description=Clawdytest Next.js App
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/path/to/clawdytest
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable clawdytest
sudo systemctl start clawdytest
```

---

## Part 7: Security Hardening

### 1. Keep Everything Updated

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### 2. SSH Hardening

```bash
sudo nano /etc/ssh/sshd_config
```

```
# Disable password auth (use keys only)
PasswordAuthentication no
PubkeyAuthentication yes

# Disable root login
PermitRootLogin no

# Change default port (optional, security through obscurity)
Port 2222
```

### 3. Rate Limiting with Nginx

```nginx
# In nginx.conf http block
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

# In server block
location / {
    limit_req zone=one burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### 4. Security Headers

```nginx
# Add to nginx server block
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self';" always;
```

---

## Part 8: Monitoring

### Basic Monitoring

```bash
# Check if services are running
systemctl status nginx
systemctl status caddy
pm2 status

# Check ports
sudo netstat -tlnp | grep -E ':(80|443|3000)'

# Check logs
sudo tail -f /var/log/nginx/access.log
pm2 logs clawdytest
```

### Uptime Monitoring (Free)

- **UptimeRobot** (https://uptimerobot.com) - Free 50 monitors
- **Healthchecks.io** - Cron job monitoring
- **Better Uptime** - Free tier available

---

## Common Issues & Solutions

### "Connection Refused" from internet

1. Check port forwarding in router
2. Check firewall: `sudo ufw status`
3. Check if app is running: `curl localhost:3000`
4. Check if ISP blocks ports: https://canyouseeme.org

### SSL Certificate Errors

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check Caddy logs
sudo journalctl -u caddy -f
```

### Dynamic IP Changed

- Set up DDNS (DuckDNS/No-IP)
- Lower DNS TTL to 300 seconds during testing

### Performance Issues

```bash
# Check system resources
htop
df -h

# Check nginx connections
sudo nginx -t
sudo systemctl status nginx
```

---

## Cost Comparison

| Item | Self-Host | Cloud (Vercel/etc) |
|------|-----------|-------------------|
| Domain | $10-15/year | Optional |
| Server | Your electricity | $0-20/month |
| SSL | Free (Let's Encrypt) | Free |
| Bandwidth | Your internet plan | Usually free tier |
| **Total** | **~$10-15/year** | **$0-20/month** |

---

## Pros & Cons

### ✅ Pros
- Complete control over your data
- No vendor lock-in
- Learn valuable skills
- Can be very cheap
- No usage limits

### ❌ Cons
- Your PC must stay on 24/7
- Your internet must be reliable
- ISP may block ports
- Security is your responsibility
- Dynamic IP hassle
- No geographic redundancy

---

## Recommended Stack for Beginners

1. **DuckDNS** - Free dynamic DNS
2. **Caddy** - Automatic HTTPS, simple config
3. **PM2** - Process management for Node.js
4. **UFW + Fail2Ban** - Basic security

This combo is the easiest path to full self-hosting!

---

## Further Reading

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [r/selfhosted](https://reddit.com/r/selfhosted) - Great community

---

*Document created: 2026-01-28*
*For learning purposes - use tunnel services (HOSTING.md) for easier setup*
