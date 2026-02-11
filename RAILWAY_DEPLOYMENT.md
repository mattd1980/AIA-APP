# Railway Deployment Quick Start

This guide will help you deploy the AIA-APP backend to Railway.

## Prerequisites

- GitHub account with the repository pushed
- Railway account ([railway.app](https://railway.app))
- OpenAI API key

## Step-by-Step Deployment

### 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository: `mattd1980/AIA-APP`
5. **IMPORTANT**: After connecting the repo, go to your service settings
6. In "Settings" → "Source", set the **Root Directory** to: `backend`
7. This tells Railway to use the `backend` folder as the project root

### 2. Add PostgreSQL Database ⚠️ REQUIRED

**IMPORTANT:** You MUST add a PostgreSQL database before the app can start!

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create the database and set `DATABASE_URL` environment variable
4. **Link the database to your backend service:**
   - Click on your backend service
   - Go to "Variables" tab
   - You should see `DATABASE_URL` automatically added (it references the PostgreSQL service)
   - If you don't see it, click "New Variable" and reference the PostgreSQL service's `DATABASE_URL`

**If you see "DATABASE_URL not found" errors:**
- Make sure you've added a PostgreSQL database service
- Make sure the database service is in the same Railway project
- The `DATABASE_URL` should appear automatically in your backend service's variables

### 3. Configure Environment Variables

In Railway dashboard, go to your service → "Variables" and add:

```env
# Database (automatically set by Railway when you add PostgreSQL)
# DATABASE_URL is set automatically - no need to add manually

# OpenAI API (REQUIRED)
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend URL (update after deploying frontend)
# For now, you can use a wildcard or your frontend URL
FRONTEND_URL=https://your-frontend.vercel.app
# Or for development: FRONTEND_URL=*
```

### 4. Deploy

Railway will automatically:
1. Detect the Node.js project
2. Run `npm install`
3. Run `npm run build` (compiles TypeScript)
4. Run `npm run postinstall` (generates Prisma client)
5. Run `npm run railway` (runs migrations + starts server)

### 5. Get Your Backend URL

1. In Railway dashboard, go to your service
2. Click on "Settings" → "Generate Domain"
3. Copy the generated URL (e.g., `https://ia.heliacode.com`)

### 6. Update Frontend Environment

After getting your Railway backend URL:

1. Deploy frontend to Vercel/Netlify
2. Set environment variable: `VITE_API_URL=https://ia.heliacode.com`
3. Redeploy frontend

### 7. Update CORS in Backend

Update `FRONTEND_URL` in Railway variables with your actual frontend URL.

## Verification

1. Check health endpoint: `https://ia.heliacode.com/health`
2. Check database health: `https://ia.heliacode.com/health/db`
3. View logs in Railway dashboard

## Troubleshooting

### "Can't reach database server" or "Attempting to connect to the database..." hangs

The app uses `postgres.railway.internal` (private network). If that fails or hangs:

1. **Use the public database URL**
   - Open your **PostgreSQL** service in Railway → **Variables** or **Connect**.
   - Copy the **public** connection URL (host like `xxx.railway.app` or `yamanote.proxy.rlwy.net`, **not** `postgres.railway.internal`).
   - In your **backend** service → **Variables**, set `DATABASE_URL` to that public URL (replace the existing one), then redeploy.
   - The startup script automatically adds **`sslmode=require`** for public URLs (Railway’s public Postgres requires SSL).

2. **Connection timeout**
   - The startup script adds `connect_timeout=10` to `DATABASE_URL` so the app fails after 10s instead of hanging. If you override `DATABASE_URL` manually, you can append `?connect_timeout=10` (or `&connect_timeout=10` if the URL already has `?`).

3. **Health check**
   - Set **Settings → Health Check → Path** to `/health`. The app returns 503 until the DB is reachable and times out after 10s so Railway doesn’t hang.

### Error: "Error creating build plan with Railpack"

This error means Railway can't detect your project structure. Fix it by:

1. **Verify Root Directory is Set:**
   - Go to your service → Settings → Source
   - Ensure **Root Directory** is set to: `backend`
   - If it's empty or set to `/`, change it to `backend`
   - Save and redeploy

2. **Check nixpacks.toml exists:**
   - The file should be at: `backend/nixpacks.toml`
   - Verify it's committed to GitHub

3. **Alternative: Remove nixpacks.toml and let Railway auto-detect:**
   - If the above doesn't work, delete `backend/nixpacks.toml`
   - Railway should auto-detect Node.js from `package.json`
   - Make sure Root Directory is still set to `backend`

### Build Fails

- Check Railway logs for errors
- Ensure `package.json` has correct scripts
- Verify TypeScript compiles: `npm run build`
- Check that `package.json` has `engines` field with Node version

### Database Connection Fails

- Verify `DATABASE_URL` is set (should be automatic)
- Check PostgreSQL service is running in Railway
- Run migrations manually: `railway run npx prisma migrate deploy`

### Server Won't Start

- Check `PORT` environment variable (Railway sets this automatically)
- Verify `npm run railway` script works
- Check logs for Prisma client generation errors

### CORS Errors

- Update `FRONTEND_URL` in Railway variables
- Ensure frontend URL matches exactly (no trailing slash)

## Railway CLI (Optional)

If you prefer using CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
cd backend
railway link

# Set variables
railway variables set OPENAI_API_KEY=sk-...
railway variables set FRONTEND_URL=https://your-frontend.vercel.app

# Deploy
railway up
```

## Next Steps

- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update `FRONTEND_URL` in Railway
- [ ] Test full workflow (upload → process → report)
- [ ] Set up monitoring/alerts
- [ ] Configure custom domain (optional)

## Support

- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- Check `docs/DEPLOYMENT.md` for detailed deployment guide
