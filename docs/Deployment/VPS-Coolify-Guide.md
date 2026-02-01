# Deployment Guide: Ninja Gen Z on Hostinger KVM VPS

**Target:** Hostinger KVM 2 VPS (Ubuntu 24.04 LTS)
**Management Tool:** Coolify (Open Source PaaS)

---

## 1. Initial VPS Setup

1.  **Login to Hostinger Panel:**
    *   Go to your VPS dashboard.
    *   Ensure OS is **Ubuntu 24.04 64bit**. If not, choose "Rebuild OS" (Warning: this deletes all data).
    *   Note your **IP Address** and **Root Password**.

2.  **Connect to VPS:**
    *   **Option A (Easiest):** Click the **"Terminal" (محطة)** button in the top-right corner of your Hostinger dashboard.
    *   **Option B (Manual):** Open PowerShell/Terminal on your computer and run: `ssh root@YOUR_VPS_IP`
    *   Enter password when prompted.

3.  **Update System:**
    ```bash
    apt update && apt upgrade -y
    ```

---

## 2. Install Coolify

Coolify makes managing your server as easy as Vercel/Netlify.

1.  **Run Installation Command:**
    ```bash
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
    ```
    *   This will install Docker and Coolify automatically.
    *   Wait for 5-10 minutes.

2.  **Access Coolify Dashboard:**
    *   Open your browser and go to: `http://YOUR_VPS_IP:8000`
    *   Create your admin account.

---

## 3. Deploy Resources

### A. Database (PostgreSQL)
1.  In Coolify, go to **Projects** -> **New Project** -> **New Environment**.
2.  Click **+ New Resource** -> **Database** -> **PostgreSQL**.
3.  Choose version **15+**.
4.  Coolify will start the database and give you the connection string (e.g., `postgresql://postgres:password@...`).
5.  **Important:** Save these credentials.

### B. Redis (Cache/Queues)
1.  Click **+ New Resource** -> **Database** -> **Redis**.
2.  Start the service.

### C. Backend (NestJS)
1.  Click **+ New Resource** -> **Application** -> **Public Repository**.
2.  Enter your GitHub URL (e.g., `https://github.com/your-user/ninja-gen-z`).
3.  Build Pack: **Nixpacks** (Automatic) or **Dockerfile**.
4.  **Environment Variables:** Add your database URL, Redis URL, and Supabase Auth keys here.
5.  Click **Deploy**.

### D. Frontend (Vite/React)
1.  Click **+ New Resource** -> **Application** -> **Public Repository**.
2.  Enter GitHub URL.
3.  Build Pack: **Static** (for Vite).
4.  **Output Directory:** `dist`
5.  **Build Command:** `npm run build`
6.  Click **Deploy**.

---

## 4. Domain Setup

1.  **In Hostinger (DNS):**
    *   Point `A Record` for `@` (root) to `YOUR_VPS_IP`.
    *   Point `A Record` for `api` (backend) to `YOUR_VPS_IP`.

2.  **In Coolify:**
    *   Go to Frontend settings -> **Domains**: Set `https://yourdomain.com`.
    *   Go to Backend settings -> **Domains**: Set `https://api.yourdomain.com`.
    *   Coolify will automatically generate **SSL Certificates** (HTTPS).

---

## 5. Automation (n8n)
1.  Click **+ New Resource** -> **Service** -> **n8n**.
2.  Deploy it.
3.  Set domain to `https://automation.yourdomain.com`.

---

## Troubleshooting

*   **Logs:** Check "Logs" tab in Coolify for any deployment errors.
*   **Restart:** You can restart any service individually.
*   **Resources:** Monitor CPU/RAM usage in Coolify dashboard.
