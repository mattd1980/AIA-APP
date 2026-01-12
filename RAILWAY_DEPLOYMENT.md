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

### 2. Add PostgreSQL Database

1. In your Railway project, click "New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create the database and set `DATABASE_URL` environment variable

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
3. Copy the generated URL (e.g., `https://aia-backend-production.up.railway.app`)

### 6. Update Frontend Environment

After getting your Railway backend URL:

1. Deploy frontend to Vercel/Netlify
2. Set environment variable: `VITE_API_URL=https://your-backend.railway.app`
3. Redeploy frontend

### 7. Update CORS in Backend

Update `FRONTEND_URL` in Railway variables with your actual frontend URL.

## Verification

1. Check health endpoint: `https://your-backend.railway.app/health`
2. Check database health: `https://your-backend.railway.app/health/db`
3. View logs in Railway dashboard

## Troubleshooting

### Build Fails

- Check Railway logs for errors
- Ensure `package.json` has correct scripts
- Verify TypeScript compiles: `npm run build`

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
