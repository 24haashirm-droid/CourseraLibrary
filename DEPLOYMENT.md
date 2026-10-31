# Global Production Deployment Guide 🚀
### CourseFinder — Smart Global Library for Long-Duration Courses

This guide walks you through deploying **CourseFinder** globally to the cloud and distributing the **Chrome Extension**.

---

## 🔒 Security Updates & Demo Removal Summary

All temporary demo accounts and shortcuts have been removed:
- ❌ **Removed:** Hardcoded `admin@coursefinder.edu` / `admin123` credentials removed from database and codebase.
- ❌ **Removed:** "Demo Switcher" dropdown in Navbar removed.
- ❌ **Removed:** "Instant Demo Access" buttons in Auth Modal removed.
- ❌ **Removed:** Hardcoded pre-filled demo values in Browser Extension popup.
- ✅ **Added:** Dedicated secure CLI tool (`npm run create-admin`) to create and manage real administrator credentials.
- ✅ **Added:** Environment variable initialization (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`).
- ✅ **Added:** Unified production server: Express now directly serves the optimized React frontend build on a single domain.

---

## 🔑 How to Create Your Production Administrator Account

### Method 1: Using the CLI Tool (Recommended)
Run the interactive admin creation command:
```bash
npm run create-admin
```
Or pass credentials directly via arguments:
```bash
node backend/src/scripts/create-admin.js "dean@university.edu" "YourSecurePass123!" "Dr. Alex Taylor"
```

### Method 2: Via Cloud Environment Variables
Set the following environment variables in your cloud provider's dashboard (e.g. Render, Railway, Vercel):
- `ADMIN_EMAIL=dean@university.edu`
- `ADMIN_PASSWORD=YourSecurePass123!`
- `ADMIN_NAME=Dr. Alex Taylor`
- `JWT_SECRET=generate_a_random_32_character_secret_key`

When the backend boots for the first time, it will automatically register your administrator account with these secure credentials.

---

## 🌐 Cloud Deployment Options

### Option 1: Unified Single-Service Deployment on Render.com (Easiest & Free)

This deploys **both** the React frontend and Node.js backend under a **single URL** (e.g., `https://coursefinder.onrender.com`), eliminating all CORS issues and domain configuration.

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for production"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/coursefinder.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [dashboard.render.com](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Connect your GitHub repository `coursefinder`.
   - Configure the following settings:
     - **Runtime:** `Node`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Instance Type:** `Free` (or Starter)
   - Add **Environment Variables** in the Render settings:
     | Key | Value |
     | :--- | :--- |
     | `NODE_ENV` | `production` |
     | `JWT_SECRET` | *(Click "Generate" or enter a random secure string)* |
     | `ADMIN_EMAIL` | `your-admin@institution.edu` |
     | `ADMIN_PASSWORD` | `YourStrongAdminPassword` |
   - *(Optional for persistence)*: In the "Disks" section, add a disk mounted at `/app/backend/data`.

3. Click **Deploy Web Service**. Render will automatically build the React frontend, package the Express server, and make your app live on HTTPS!

---

### Option 2: Deploy on Railway.app

1. Go to [railway.app](https://railway.app) and click **New Project** > **Deploy from GitHub repo**.
2. Select the repository.
3. Railway automatically detects `package.json` and runs `npm run build` and `npm start`.
4. In **Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(Random secure string)*
   - `ADMIN_EMAIL` = `your-admin@institution.edu`
   - `ADMIN_PASSWORD` = `YourStrongAdminPassword`
5. In **Settings** > **Networking**, click **Generate Domain** to get your public `https://....up.railway.app` URL.

---

### Option 3: Split Deployment (Vercel for Frontend + Render/Railway for Backend)

If you prefer deploying the frontend onto Vercel's global CDN:

1. **Deploy Backend first** on Render or Railway (root directory: `backend`).
   - Copy your public backend URL (e.g. `https://coursefinder-api.onrender.com`).
2. **Deploy Frontend on Vercel:**
   - Go to [vercel.com](https://vercel.com) > **Add New Project**.
   - Select the repository.
   - Set **Root Directory** to `frontend`.
   - In **Environment Variables**, add:
     - `VITE_API_BASE_URL` = `https://coursefinder-api.onrender.com`
   - Click **Deploy**.
3. **Update Backend CORS (Optional):**
   - On the backend dashboard, add `CORS_ORIGINS=https://your-frontend.vercel.app`.

---

### Option 4: Docker & VPS (DigitalOcean / AWS / GCP / Hetzner)

A production-ready `Dockerfile` and `docker-compose.yml` are included in the repository.

1. SSH into your VPS:
   ```bash
   git clone https://github.com/YOUR_USERNAME/coursefinder.git
   cd coursefinder
   ```
2. Set environment variables in `docker-compose.yml` or a `.env` file:
   ```bash
   JWT_SECRET=super_secret_production_key_2026
   ADMIN_EMAIL=admin@university.edu
   ADMIN_PASSWORD=StrongPassword123!
   ```
3. Launch with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Put Nginx with Let's Encrypt SSL in front of port 5000:
   ```nginx
   server {
       server_name coursefinder.yourdomain.com;
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

---

## 🧩 Packaging & Distributing the Chrome Extension

1. **Configure Production API URL:**
   - In `extension/background.js` and `extension/popup.js`, set `DEFAULT_API_BASE` to your deployed domain (e.g. `https://coursefinder.onrender.com`).
   - *Note: Users can also click the ⚙ (Settings) icon in the extension popup anytime to point to any deployed URL.*

2. **Package the Extension:**
   A pre-built zip archive `coursefinder-extension.zip` is created in your root directory. You can regenerate it anytime with:
   ```powershell
   powershell -Command "Compress-Archive -Path 'extension\*' -DestinationPath 'coursefinder-extension.zip' -Force"
   ```

3. **Distribution Options:**
   - **Option A (Chrome Web Store):** Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole), upload `coursefinder-extension.zip`, add screenshots/description, and submit for publishing.
   - **Option B (Direct Distribution to Students):** Share the `coursefinder-extension.zip` file or folder with students to load via `chrome://extensions` (Load Unpacked).
