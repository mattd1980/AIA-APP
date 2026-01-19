# Railway Two-Service Setup Guide

This guide explains how to deploy the frontend and backend as separate services in the same Railway project.

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
FRONTEND_URL=https://your-frontend-service-name.up.railway.app
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

### Frontend shows "Cannot connect to API"
- Check `VITE_API_URL` in frontend service variables
- Make sure it points to your backend service URL
- Check CORS settings in backend

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
