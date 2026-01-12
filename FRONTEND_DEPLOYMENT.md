# Frontend Deployment Guide

Your backend is now running on Railway! 🎉 Now let's deploy the frontend.

## Quick Deploy to Vercel (Recommended)

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your repository: `mattd1980/AIA-APP`
4. **Configure the project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (should auto-detect)
   - **Output Directory:** `dist` (should auto-detect)

### Step 2: Set Environment Variable

Before deploying, add the environment variable:

1. In Vercel project settings, go to "Environment Variables"
2. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** Your Railway backend URL (e.g., `https://your-backend.up.railway.app`)
   - **Environment:** Production, Preview, Development (select all)

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Vercel will give you a URL like: `https://aia-app.vercel.app`

### Step 4: Update Backend CORS

1. Go back to Railway dashboard
2. Go to your backend service → "Variables"
3. Add/Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://aia-app.vercel.app
   ```
4. Redeploy the backend (or it will auto-redeploy)

## Alternative: Deploy to Netlify

### Step 1: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in with GitHub
2. Click "Add new site" → "Import an existing project"
3. Select your repository: `mattd1980/AIA-APP`
4. **Configure build settings:**
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`

### Step 2: Set Environment Variable

1. Go to "Site settings" → "Environment variables"
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** Your Railway backend URL
   - **Scopes:** All scopes

### Step 3: Deploy

1. Click "Deploy site"
2. Netlify will give you a URL like: `https://aia-app.netlify.app`

### Step 4: Update Backend CORS

Same as Vercel - update `FRONTEND_URL` in Railway with your Netlify URL.

## Verify Everything Works

1. **Test Backend:** Visit `https://your-backend.railway.app/health`
   - Should return: `{"status":"ok",...}`

2. **Test Frontend:** Visit your Vercel/Netlify URL
   - Should load the React app
   - Try uploading an image to test the API connection

3. **Check CORS:** Open browser console on frontend
   - Should not see CORS errors when making API calls

## Troubleshooting

### Frontend can't connect to backend

- Verify `VITE_API_URL` is set correctly in Vercel/Netlify
- Make sure there's no trailing slash: `https://backend.railway.app` (not `https://backend.railway.app/`)
- Check browser console for errors

### CORS errors

- Verify `FRONTEND_URL` in Railway matches your frontend URL exactly
- No trailing slashes
- Redeploy backend after updating `FRONTEND_URL`

### Build fails on Vercel/Netlify

- Make sure "Root Directory" is set to `frontend`
- Check build logs for specific errors
- Verify `package.json` has correct build script

## Summary

✅ **Backend:** Running on Railway  
✅ **Database:** PostgreSQL on Railway  
⏳ **Frontend:** Deploy to Vercel/Netlify (follow steps above)  
⏳ **CORS:** Update `FRONTEND_URL` in Railway after frontend deploys

Once both are deployed, you'll have a fully working application! 🚀
