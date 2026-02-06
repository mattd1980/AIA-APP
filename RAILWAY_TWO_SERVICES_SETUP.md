# Railway Two-Service Setup Guide

## Why does the "backend" URL show the full app (login, etc.)?

If you have **one** Railway service (e.g. `your-service`) and the repo is deployed from the **root** (no Root Directory, or root directory = repo root), then that service is not “backend-only” — it runs the **combined app**:

1. **Start command** (from root `railway.toml`) is `cd backend && npm run railway`.
2. **`railway-start.js`** (backend startup script) builds the frontend from `../frontend`, copies it into `backend/public`, runs migrations, then starts the Express server.
3. **Express** (in `backend/src/server.ts`) serves:
   - **API**: `/api/*` and `/health`
   - **Static frontend**: files from `backend/public` (the built React app)
   - **SPA fallback**: any other path (e.g. `/login`) → `index.html`

So **https://ia.heliacode.com** is the URL of your **entire app**. The name “back” is just the service name; that one service serves both API and UI. Login, database, and all features work from that URL because the frontend and API are same-origin (no CORS, cookies work). This is the **single-service (combined) deployment**.

If you add a **second** service for the frontend (Root Directory = `frontend`), you get two URLs; then you’d use the frontend URL for users and point its proxy at the backend URL. The rest of this guide describes that **two-service** setup.

---

This guide explains how to deploy the frontend and backend as **separate** services in the same Railway project.

## Overview

- **Backend Service**: Handles API routes (`/api/*`)
- **Frontend Service**: Serves the React app and routes everything else to the frontend

Both services will be in the same Railway project and share the same domain.

## Step 1: Create Frontend Service in Railway

1. Go to your Railway project dashboard
2. Click **"New"** → **"GitHub Repo"**
3. Select the same repository: `mattd1980/AIA-APP`
4. After it's added, go to the service settings:
   - Click on the new service
   - Go to **Settings** → **Source**
   - Set **Root Directory** to: `frontend`
   - Save

## Step 2: Configure Environment Variables

### Frontend Service Variables

In the frontend service, go to **Variables** and add:

```env
BACKEND_URL=https://<your-backend-domain>
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
```

**Important**: `BACKEND_URL` must be the **actual domain** of the backend service (`AIA-APP-BACK`) shown in Railway → Backend service → Settings → Domains.
This setup proxies `/api/*` from the frontend to the backend, which avoids CORS and cross-site cookie issues.

### Backend Service Variables

In the backend service, update the **FRONTEND_URL** variable:

```env
FRONTEND_URL=https://your-frontend-domain.com
```

Or if Railway routes both services to the same domain, you can use:
```env
FRONTEND_URL=*
```

## Step 3: Configure Railway Routing (Optional)

Railway can automatically route requests:
- `/api/*` → Backend service
- Everything else → Frontend service

To set this up:
1. Go to your Railway project settings
2. Look for **Networking** or **Routes** section
3. Configure routing rules (if available in your Railway plan)

Alternatively, Railway may handle this automatically when both services are in the same project.

## Step 4: Deploy

1. **Backend Service**: Should already be configured and deploying
2. **Frontend Service**: Will automatically deploy when you push to GitHub

Both services will build and deploy independently.

## Step 5: Verify

1. Check backend service logs - should show API running
2. Check frontend service logs - should show "Frontend server running"
3. Visit your Railway domain - should show the frontend
4. Test API calls - should work from the frontend

## Troubleshooting

### Red database LED / "Cannot connect to API" / Proxy "split" error
- **Frontend service** must have **`BACKEND_URL`** set to the **full backend URL** (e.g. `https://your-backend-domain.com`).
- Use `https://` (or `http://`); do not omit the protocol or the proxy will crash with `Cannot read properties of null (reading 'split')`.
- No trailing slash: use `https://your-domain.com` not `https://your-domain.com/`.
- In Railway: Frontend service → Variables → add or edit `BACKEND_URL` with the backend’s public URL (from Backend service → Settings → Domains).

### Frontend shows "Cannot connect to API"
- Check `BACKEND_URL` (production proxy) and/or `VITE_API_URL` (dev) in frontend service variables.
- Make sure the URL points to your backend service and includes `https://`.
- Check CORS settings in backend if you are not using the proxy.

### Both services on same domain but routing doesn't work
- Railway may need explicit routing configuration
- Check Railway documentation for routing setup
- You might need to use Railway's proxy/routing features

### Frontend service fails to build
- Check that Root Directory is set to `frontend`
- Verify `nixpacks.toml` exists in `frontend/` directory
- Check build logs for errors

## Benefits of This Setup

✅ **Reliability**: Each service builds and deploys independently  
✅ **Scalability**: Can scale frontend and backend separately  
✅ **Simplicity**: No complex file copying between build phases  
✅ **Debugging**: Easier to see which service has issues  
✅ **Flexibility**: Can update frontend or backend independently
