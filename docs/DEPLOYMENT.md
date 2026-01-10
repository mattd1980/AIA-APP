# Guide de Déploiement - Application d'Inventaire IA

## Prérequis

- Compte Railway
- Compte OpenAI (avec crédits API)
- Compte DataForSEO (optionnel pour MVP)
- Node.js 18+ installé localement
- Git

---

## Configuration Railway

### 1. Créer un Projet Railway

1. Aller sur [railway.app](https://railway.app)
2. Créer un nouveau projet
3. Nommer le projet (ex: `inventory-ai-app`)

### 2. Ajouter PostgreSQL

1. Dans le projet Railway, cliquer sur "New"
2. Sélectionner "Database" → "Add PostgreSQL"
3. Railway créera automatiquement une base de données
4. Noter la `DATABASE_URL` dans les variables d'environnement

### 3. Déployer le Backend

#### Option A: Via GitHub (Recommandé)

1. Pousser le code backend sur GitHub
2. Dans Railway, cliquer sur "New" → "GitHub Repo"
3. Sélectionner le repository
4. Railway détectera automatiquement le projet Node.js
5. Configurer les variables d'environnement (voir section suivante)

#### Option B: Via Railway CLI

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Se connecter
railway login

# Initialiser le projet
railway init

# Lier au projet existant
railway link

# Déployer
railway up
```

### 4. Variables d'Environnement Railway

Dans le dashboard Railway, aller dans "Variables" et ajouter:

```env
# Database (généré automatiquement par Railway)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# DataForSEO (optionnel)
DATAFORSEO_API_KEY=...
DATAFORSEO_LOGIN=...

# Server
PORT=3000
NODE_ENV=production

# CORS (URL du frontend)
FRONTEND_URL=https://your-frontend.vercel.app
```

### 5. Configuration du Build

Railway détectera automatiquement un projet Node.js. Si besoin, créer un `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## Configuration Frontend (Vercel/Netlify)

### Option A: Vercel (Recommandé)

1. Aller sur [vercel.com](https://vercel.com)
2. Importer le projet frontend depuis GitHub
3. Configurer les variables d'environnement:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```
4. Déployer

### Option B: Netlify

1. Aller sur [netlify.com](https://netlify.com)
2. Importer le projet depuis GitHub
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Variables d'environnement:
   ```env
   VITE_API_URL=https://your-backend.railway.app
   ```

---

## Configuration Base de Données

### 1. Migrations Prisma

```bash
# Dans le dossier backend
npx prisma migrate dev --name init
```

### 2. Générer le Client Prisma

```bash
npx prisma generate
```

### 3. Seed (Optionnel)

Créer un fichier `prisma/seed.ts` pour données de test:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Données de seed si nécessaire
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Exécuter:
```bash
npx prisma db seed
```

---

## Scripts de Déploiement

### package.json (Backend)

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "tsx watch src/server.ts",
    "migrate": "prisma migrate deploy",
    "generate": "prisma generate"
  }
}
```

### Railway Build Hooks

Railway exécutera automatiquement:
1. `npm install`
2. `npm run build` (si présent)
3. `npm start`

Pour les migrations, ajouter dans `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "railway": "prisma migrate deploy && npm start"
  }
}
```

---

## Monitoring et Logs

### Railway Logs

- Accéder aux logs en temps réel dans le dashboard Railway
- Ou via CLI: `railway logs`

### Health Check Endpoint

Créer un endpoint de santé:

```typescript
// src/routes/health.ts
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

Railway utilisera automatiquement ce endpoint pour vérifier la santé.

---

## Sécurité en Production

### 1. CORS Configuration

```typescript
// Backend
import cors from 'cors';

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### 2. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite de 100 requêtes
});

app.use('/api/', limiter);
```

### 3. Validation des Fichiers

```typescript
import multer from 'multer';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'));
    }
  }
});
```

---

## Rollback

### Railway

1. Aller dans "Deployments" dans le dashboard
2. Sélectionner un déploiement précédent
3. Cliquer sur "Redeploy"

### Via CLI

```bash
railway rollback
```

---

## Domaines Personnalisés

### Railway

1. Dans le dashboard, aller dans "Settings" → "Domains"
2. Ajouter un domaine personnalisé
3. Suivre les instructions DNS

### Frontend (Vercel)

1. Dans les paramètres du projet, aller dans "Domains"
2. Ajouter un domaine
3. Configurer les enregistrements DNS

---

## Checklist de Déploiement

### Pré-déploiement
- [ ] Variables d'environnement configurées
- [ ] Base de données migrée
- [ ] Tests locaux passés
- [ ] Build fonctionne localement
- [ ] Secrets API configurés (OpenAI, DataForSEO)

### Déploiement
- [ ] Backend déployé sur Railway
- [ ] Frontend déployé sur Vercel/Netlify
- [ ] Base de données accessible
- [ ] Health check répond
- [ ] CORS configuré correctement

### Post-déploiement
- [ ] Test upload d'image
- [ ] Test génération de rapport
- [ ] Vérification des logs
- [ ] Monitoring configuré
- [ ] Documentation à jour

---

## Troubleshooting

### Erreur: "Database connection failed"
- Vérifier `DATABASE_URL` dans Railway
- Vérifier que PostgreSQL est actif
- Vérifier les migrations: `railway run npx prisma migrate deploy`

### Erreur: "OpenAI API key invalid"
- Vérifier que la clé API est correcte
- Vérifier les crédits OpenAI
- Vérifier les permissions de la clé API

### Erreur: "CORS policy"
- Vérifier `FRONTEND_URL` dans les variables d'environnement
- Vérifier la configuration CORS dans le backend

### Images ne s'affichent pas
- Vérifier la taille des images (limite PostgreSQL)
- Vérifier les Content-Type headers
- Considérer migration vers S3 pour production

---

## Coûts Estimés

### Railway
- **Hobby Plan**: Gratuit (500 heures/mois)
- **Pro Plan**: $20/mois (plus de ressources)

### PostgreSQL (Railway)
- **Hobby**: Gratuit (1GB storage)
- **Pro**: $5/mois (10GB storage)

### OpenAI
- GPT-4 Vision: ~$0.01-0.03 par image
- Budget estimé: $50-100/mois pour 1000-3000 images

### DataForSEO
- Plans à partir de $99/mois
- Alternative: SERP API moins cher

### Total Estimé MVP
- **Minimum**: ~$50-100/mois (Railway gratuit + OpenAI)
- **Recommandé**: ~$150-200/mois (avec DataForSEO)

---

## Support

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [OpenAI Support](https://help.openai.com)
