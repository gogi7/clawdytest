# Clawdytest Self-Hosting Guide

Technical documentation for hosting Clawdytest from your local PC (WSL2 on Windows 11) and making it accessible via the internet.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
│                                                                             │
│    Users access: https://clawdytest.yourdomain.com                         │
│                  (or https://random-name.trycloudflare.com)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                      │
│                                                                             │
│    - SSL/TLS termination (free HTTPS)                                       │
│    - DDoS protection                                                        │
│    - Global CDN                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Secure tunnel (no port forwarding needed)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR WINDOWS 11 PC                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                           WSL2 (Ubuntu)                                │  │
│  │                                                                       │  │
│  │   ┌─────────────────┐      ┌─────────────────┐      ┌──────────────┐ │  │
│  │   │   cloudflared   │ ──── │      PM2        │ ──── │  Next.js App │ │  │
│  │   │   (tunnel)      │      │ (process mgr)   │      │  (port 3000) │ │  │
│  │   └─────────────────┘      └─────────────────┘      └──────────────┘ │  │
│  │                                                                       │  │
│  │   Location: /mnt/c/tools/phpc/clawdytest                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. Next.js Application
- **What:** The Clawdytest news aggregator web app
- **Tech:** Next.js 16, React 19, Tailwind CSS, TypeScript
- **Port:** 3000 (default)
- **Location:** `C:\tools\phpc\clawdytest` (Windows) / `/mnt/c/tools/phpc/clawdytest` (WSL2)

### 2. PM2 (Process Manager)
- **What:** Node.js process manager that keeps your app running
- **Features:**
  - Auto-restart on crash
  - Log management
  - Startup script generation
  - Process monitoring
- **Install:** `npm install -g pm2`

### 3. Cloudflare Tunnel (cloudflared)
- **What:** Secure tunnel that exposes local services to the internet
- **Features:**
  - No port forwarding required
  - No firewall changes needed
  - Free HTTPS/SSL certificates
  - DDoS protection
  - Works behind NAT/CGNAT
- **Install:** `sudo apt install cloudflared` or download binary

---

## Setup Steps

### Step 1: Install PM2

```bash
# In WSL2
npm install -g pm2
```

### Step 2: Build the Next.js App for Production

```bash
cd /mnt/c/tools/phpc/clawdytest
npm run build
```

### Step 3: Start App with PM2

```bash
# Start the production server
pm2 start npm --name "clawdytest" -- start

# Verify it's running
pm2 status

# View logs
pm2 logs clawdytest
```

### Step 4: Configure PM2 Startup (Auto-start on WSL boot)

```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

### Step 5: Install Cloudflare Tunnel

```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/
```

### Step 6: Quick Tunnel (No Account Required)

```bash
# Creates a temporary public URL (great for testing)
cloudflared tunnel --url http://localhost:3000
```

This gives you a URL like: `https://random-words.trycloudflare.com`

### Step 7: Persistent Tunnel (With Cloudflare Account)

For a permanent custom domain:

```bash
# Login to Cloudflare
cloudflared tunnel login

# Create a named tunnel
cloudflared tunnel create clawdytest

# Create config file
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << EOF
tunnel: clawdytest
credentials-file: /home/YOUR_USER/.cloudflared/TUNNEL_ID.json

ingress:
  - hostname: clawdytest.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# Add DNS record (run once)
cloudflared tunnel route dns clawdytest clawdytest.yourdomain.com

# Run the tunnel
cloudflared tunnel run clawdytest
```

### Step 8: Run Tunnel with PM2

```bash
# Add cloudflared to PM2
pm2 start cloudflared --name "tunnel" -- tunnel --url http://localhost:3000

# Or for named tunnel:
pm2 start cloudflared --name "tunnel" -- tunnel run clawdytest

# Save PM2 config
pm2 save
```

---

## Management Commands

### PM2 Commands

```bash
# Status of all processes
pm2 status

# Stop the app
pm2 stop clawdytest

# Start the app
pm2 start clawdytest

# Restart the app
pm2 restart clawdytest

# View logs (live)
pm2 logs clawdytest

# View logs (last 100 lines)
pm2 logs clawdytest --lines 100

# Monitor (CPU/Memory dashboard)
pm2 monit

# Delete from PM2
pm2 delete clawdytest
```

### Cloudflared Commands

```bash
# List tunnels
cloudflared tunnel list

# Check tunnel status
cloudflared tunnel info clawdytest

# Stop tunnel (if running standalone)
# Ctrl+C or pm2 stop tunnel
```

---

## File Structure After Setup

```
C:\tools\phpc\clawdytest\
├── .next/                 # Production build output
├── node_modules/          # Dependencies
├── public/                # Static assets
├── src/                   # Source code
│   ├── app/              # Next.js app router
│   ├── components/       # React components
│   ├── context/          # React context (theme)
│   └── data/             # News data
├── package.json          # Dependencies & scripts
├── HOSTING.md            # This document
└── README.md             # Project readme

~/.cloudflared/           # Cloudflare config (WSL2 home)
├── config.yml            # Tunnel configuration
├── cert.pem              # Cloudflare certificate
└── <tunnel-id>.json      # Tunnel credentials

~/.pm2/                   # PM2 data (WSL2 home)
├── logs/                 # Application logs
├── pids/                 # Process IDs
└── dump.pm2              # Saved process list
```

---

## WSL2 Considerations

### Keeping WSL2 Alive

WSL2 may shut down after inactivity. Options:

**Option A: Windows Task Scheduler (Recommended)**
1. Open Task Scheduler
2. Create Basic Task → "Keep WSL Alive"
3. Trigger: At startup
4. Action: Start program → `wsl.exe` with args `-d Ubuntu -e sleep infinity`

**Option B: Background WSL Service**
```powershell
# In PowerShell (Admin)
wsl --exec dbus-launch true
```

**Option C: Install systemd in WSL2**
```bash
# Edit /etc/wsl.conf
[boot]
systemd=true
```
Then restart WSL: `wsl --shutdown` and reopen.

### After Windows Reboot

```bash
# In WSL2, restore PM2 processes
pm2 resurrect
```

---

## Troubleshooting

### App not accessible

1. Check PM2 status: `pm2 status`
2. Check logs: `pm2 logs clawdytest`
3. Test locally: `curl http://localhost:3000`
4. Check tunnel: `pm2 logs tunnel`

### Port already in use

```bash
# Find what's using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### WSL2 networking issues

```bash
# Restart WSL networking
wsl --shutdown
# Then reopen WSL terminal
```

### Rebuild after code changes

```bash
cd /mnt/c/tools/phpc/clawdytest
git pull                    # If using git
npm run build              # Rebuild
pm2 restart clawdytest     # Restart app
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start app | `pm2 start clawdytest` |
| Stop app | `pm2 stop clawdytest` |
| Restart app | `pm2 restart clawdytest` |
| View logs | `pm2 logs clawdytest` |
| Check status | `pm2 status` |
| Quick tunnel | `cloudflared tunnel --url http://localhost:3000` |
| Start saved tunnel | `pm2 start tunnel` |

---

## Security Notes

1. **Cloudflare Tunnel** is secure by default — traffic is encrypted end-to-end
2. **Don't expose** sensitive ports (databases, admin panels) without authentication
3. **Keep dependencies updated**: `npm audit fix`
4. **Monitor access** via Cloudflare dashboard analytics

---

## Cost

| Component | Cost |
|-----------|------|
| PM2 | Free |
| Cloudflare Tunnel | Free |
| Custom domain | ~$10-15/year (optional) |
| **Total** | **Free** (or ~$10/year with custom domain) |

---

## Next Steps

1. [ ] Install PM2
2. [ ] Build production app
3. [ ] Start app with PM2
4. [ ] Install cloudflared
5. [ ] Test with quick tunnel
6. [ ] (Optional) Set up persistent tunnel with custom domain
7. [ ] Configure auto-start on boot

---

*Document created: 2026-01-28*
*Location: C:\tools\phpc\clawdytest\HOSTING.md*
