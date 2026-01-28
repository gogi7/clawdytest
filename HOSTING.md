# Clawdytest Self-Hosting Guide

Technical documentation for hosting Clawdytest from your local PC (WSL2 on Windows 11) and making it accessible via the internet.

**Last tested:** 2026-01-28 ✅ Working

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
│                                                                             │
│    Users access: https://random-words.trycloudflare.com                     │
│                  (e.g., jurisdiction-newport-yours-fired.trycloudflare.com) │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                      │
│                                                                             │
│    - SSL/TLS termination (free HTTPS)                                       │
│    - DDoS protection                                                        │
│    - Global CDN                                                             │
│    - No account required for quick tunnels!                                 │
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
│  │   │   (~/cloudflared)      │ (process mgr)   │      │  (port 3000) │ │  │
│  │   └─────────────────┘      └─────────────────┘      └──────────────┘ │  │
│  │                                                                       │  │
│  │   Location: /mnt/c/tools/phpc/clawdytest                             │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick Start (TL;DR)

Already set up? Here's how to start everything:

```bash
# 1. Start the app (if not already running)
pm2 start clawdytest

# 2. Start the tunnel (get a new public URL)
~/cloudflared tunnel --url http://localhost:3000

# That's it! Share the URL that appears.
```

---

## Components

### 1. Next.js Application
- **What:** The Clawdytest news aggregator web app
- **Tech:** Next.js 16, React 19, Tailwind CSS, TypeScript
- **Port:** 3000 (default)
- **Location:** 
  - Windows: `C:\tools\phpc\clawdytest`
  - WSL2: `/mnt/c/tools/phpc/clawdytest`

### 2. PM2 (Process Manager)
- **What:** Node.js process manager that keeps your app running
- **Features:**
  - Auto-restart on crash
  - Log management
  - Startup script generation
  - Process monitoring
- **Location:** Installed globally via npm

### 3. Cloudflare Tunnel (cloudflared)
- **What:** Secure tunnel that exposes local services to the internet
- **Features:**
  - No port forwarding required
  - No firewall changes needed
  - Free HTTPS/SSL certificates
  - DDoS protection
  - Works behind NAT/CGNAT
  - **No account required for quick tunnels!**
- **Location:** `~/cloudflared` (in WSL2 home directory)

---

## Initial Setup (One-Time)

### Step 1: Install PM2

```bash
npm install -g pm2
```

### Step 2: Install Cloudflared

```bash
# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o ~/cloudflared

# Make it executable
chmod +x ~/cloudflared

# Verify installation
~/cloudflared --version
```

### Step 3: Build the Next.js App

```bash
cd /mnt/c/tools/phpc/clawdytest
npm run build
```

### Step 4: Register App with PM2

```bash
cd /mnt/c/tools/phpc/clawdytest
pm2 start npm --name "clawdytest" -- start

# Save PM2 config (for resurrection after reboot)
pm2 save
```

---

## Daily Usage

### Starting Everything

```bash
# 1. Check if app is running
pm2 status

# 2. If not running, start it
pm2 start clawdytest

# 3. Start tunnel (gives you a new public URL each time)
~/cloudflared tunnel --url http://localhost:3000
```

The tunnel will output something like:
```
Your quick Tunnel has been created! Visit it at:
https://jurisdiction-newport-yours-fired.trycloudflare.com
```

### Stopping Everything

```bash
# Stop the tunnel
Ctrl+C (in the terminal running cloudflared)

# Stop the app
pm2 stop clawdytest
```

---

## PM2 Commands Reference

| Command | Description |
|---------|-------------|
| `pm2 status` | Show status of all processes |
| `pm2 start clawdytest` | Start the app |
| `pm2 stop clawdytest` | Stop the app |
| `pm2 restart clawdytest` | Restart the app |
| `pm2 logs clawdytest` | View live logs |
| `pm2 logs clawdytest --lines 100` | View last 100 log lines |
| `pm2 monit` | Interactive monitoring dashboard |
| `pm2 save` | Save current process list |
| `pm2 resurrect` | Restore saved processes (after reboot) |
| `pm2 delete clawdytest` | Remove from PM2 |

---

## Cloudflared Commands Reference

| Command | Description |
|---------|-------------|
| `~/cloudflared tunnel --url http://localhost:3000` | Start quick tunnel (no account) |
| `~/cloudflared --version` | Check version |
| `~/cloudflared update` | Update cloudflared |

---

## Tunnel Options

### Option A: Quick Tunnel (No Account) ✅ Current Setup

**Pros:**
- No signup required
- Instant setup
- Free forever

**Cons:**
- Random URL each time you start
- URL changes on restart
- No uptime guarantee

**Best for:** Testing, demos, temporary sharing

```bash
~/cloudflared tunnel --url http://localhost:3000
```

### Option B: Named Tunnel (Free Cloudflare Account)

**Pros:**
- Permanent custom subdomain (e.g., `clawdytest.yourdomain.com`)
- Same URL every time
- Better uptime

**Cons:**
- Requires free Cloudflare account
- Requires a domain (can buy cheap ~$10/year)
- More setup steps

**Best for:** Production, permanent hosting

```bash
# One-time setup
~/cloudflared tunnel login
~/cloudflared tunnel create clawdytest
~/cloudflared tunnel route dns clawdytest clawdytest.yourdomain.com

# Daily run
~/cloudflared tunnel run clawdytest
```

---

## Running Tunnel in Background with PM2

Instead of keeping a terminal open for the tunnel:

```bash
# Add tunnel to PM2
pm2 start ~/cloudflared --name "tunnel" -- tunnel --url http://localhost:3000

# Save config
pm2 save

# Now both app and tunnel are managed by PM2
pm2 status
```

**Note:** Quick tunnels get a new URL each restart. Check logs for the URL:
```bash
pm2 logs tunnel --lines 20
```

---

## Updating the App

After making code changes:

```bash
# 1. Pull latest (if using git)
cd /mnt/c/tools/phpc/clawdytest
git pull

# 2. Rebuild
npm run build

# 3. Restart
pm2 restart clawdytest
```

---

## WSL2 Considerations

### After Windows Reboot

WSL2 processes don't survive Windows reboots. To restore:

```bash
# Open WSL2 terminal, then:
pm2 resurrect
```

### Keeping WSL2 Alive

WSL2 may shut down after ~8 minutes of inactivity.

**Option A: Keep a terminal open**
Just leave a WSL2 terminal window open.

**Option B: Windows Task Scheduler**
1. Open Task Scheduler
2. Create Basic Task → "Keep WSL Alive"
3. Trigger: At startup
4. Action: Start program
   - Program: `wsl.exe`
   - Arguments: `-d Ubuntu -e bash -c "while true; do sleep 3600; done"`

**Option C: Enable systemd in WSL2**
```bash
# Edit /etc/wsl.conf in WSL2
sudo nano /etc/wsl.conf

# Add:
[boot]
systemd=true
```
Then restart WSL: `wsl --shutdown` from PowerShell.

---

## File Structure

```
C:\tools\phpc\clawdytest\          # Windows path
/mnt/c/tools/phpc/clawdytest/      # WSL2 path
├── .next/                          # Production build
├── node_modules/                   # Dependencies
├── public/                         # Static assets
├── src/
│   ├── app/                        # Next.js pages
│   ├── components/                 # React components
│   │   ├── CategoryFilter.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── NewsCard.tsx
│   │   ├── NewsFeed.tsx
│   │   └── SearchBar.tsx
│   ├── context/
│   │   └── ThemeContext.tsx        # Dark/light mode
│   └── data/
│       └── news.ts                 # News articles data
├── package.json
├── HOSTING.md                      # This document
└── README.md

~/                                  # WSL2 home directory
├── cloudflared                     # Tunnel binary
└── .pm2/                          # PM2 data
    ├── logs/                      # App logs
    └── dump.pm2                   # Saved process list
```

---

## Troubleshooting

### App not starting

```bash
# Check PM2 status
pm2 status

# Check logs for errors
pm2 logs clawdytest --lines 50

# Try manual start
cd /mnt/c/tools/phpc/clawdytest
npm start
```

### Port 3000 already in use

```bash
# Find what's using the port
lsof -i :3000

# Kill it
kill -9 <PID>

# Or restart PM2 app
pm2 restart clawdytest
```

### Tunnel not connecting

```bash
# Check if app is running first
curl http://localhost:3000

# If app works, restart tunnel
~/cloudflared tunnel --url http://localhost:3000
```

### Can't access from Windows browser

WSL2 localhost forwarding usually works. If not:
```bash
# Start app with explicit binding
npm run dev -- -H 0.0.0.0
```

### PM2 processes gone after reboot

```bash
pm2 resurrect
```

---

## Cost Summary

| Component | Cost |
|-----------|------|
| PM2 | Free |
| Cloudflare Quick Tunnel | Free |
| Cloudflare Named Tunnel | Free (need account) |
| Custom domain (optional) | ~$10-15/year |
| **Total** | **$0** (or ~$10/year with custom domain) |

---

## Security Notes

1. **Cloudflare Tunnel** encrypts all traffic end-to-end
2. **Quick tunnels** are public — anyone with the URL can access
3. Don't expose admin panels or databases without authentication
4. Keep dependencies updated: `npm audit fix`
5. The tunnel URL is random and hard to guess, but not secret

---

## Comparison: Self-Hosted vs Vercel

| Feature | Self-Hosted (This Guide) | Vercel |
|---------|-------------------------|--------|
| Cost | Free | Free |
| Custom domain | Optional (~$10/yr) | Free subdomain |
| Setup effort | Medium | Easy (1 click) |
| Auto-deploy | Manual `git pull` | Automatic on push |
| Uptime | Depends on your PC | 99.9%+ |
| Learning | ⭐⭐⭐ Great! | Minimal |

**Verdict:** Use Vercel for production, self-host for learning! 🎓

---

## Summary Checklist

- [x] PM2 installed globally
- [x] Cloudflared installed at `~/cloudflared`
- [x] App built with `npm run build`
- [x] App registered with PM2 as "clawdytest"
- [x] Quick tunnel tested and working
- [ ] (Optional) Set up named tunnel with custom domain
- [ ] (Optional) Configure PM2 startup on boot
- [ ] (Optional) Run tunnel via PM2 for background operation

---

*Document created: 2026-01-28*
*Last updated: 2026-01-28*
*Location: C:\tools\phpc\clawdytest\HOSTING.md*
