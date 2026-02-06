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
# Database (généré automatiquement par Railway quand vous ajoutez PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# Authentication
SESSION_SECRET=your-super-secret-session-key-change-in-production
ADMIN_PASSWORD=your-secure-admin-password
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://ia.heliacode.com/api/auth/google/callback

# DataForSEO (optionnel)
DATAFORSEO_API_KEY=...
DATAFORSEO_LOGIN=...

# Server
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# CORS (URL du frontend)
FRONTEND_URL=https://your-frontend.vercel.app
```

**Note importante :** Les migrations de base de données sont appliquées automatiquement lors du déploiement. Aucune action manuelle n'est requise.

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
   VITE_API_URL=https://ia.heliacode.com
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
   VITE_API_URL=https://ia.heliacode.com
   ```

---

## Configuration Base de Données

### Migrations Automatiques sur Railway

**Les migrations de base de données sont exécutées automatiquement lors du déploiement.**

Le script `railway-start.js` s'exécute automatiquement et :
1. Génère le client Prisma (`prisma generate`)
2. **Applique automatiquement toutes les migrations** (`prisma migrate deploy`)
3. Démarre le serveur

**Aucune action manuelle n'est requise** - Railway gère tout automatiquement à chaque déploiement.

### Comment ça fonctionne

1. Lorsque vous poussez du code sur GitHub, Railway détecte les changements
2. Railway exécute `npm install` (qui déclenche `postinstall` → `prisma generate`)
3. Railway exécute `npm run build` pour compiler TypeScript
4. Railway exécute `npm run railway` qui :
   - Génère le client Prisma
   - **Applique les migrations** (`prisma migrate deploy`)
   - Démarre le serveur

### Créer de nouvelles migrations (développement local)

```bash
# Dans le dossier backend
npx prisma migrate dev --name nom_de_la_migration
```

Cette commande :
- Crée un nouveau fichier de migration
- Applique la migration à votre base de données locale
- Génère le client Prisma

**Important :** Après avoir créé une migration et l'avoir poussée sur GitHub, Railway l'appliquera automatiquement au prochain déploiement.

### Seed (Optionnel)

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
1. `npm install` (déclenche `postinstall` → génère Prisma Client)
2. `npm run build` (compile TypeScript et build le frontend)
3. `npm run railway` (applique les migrations et démarre le serveur)

Le script `railway-start.js` gère automatiquement :
- Génération du client Prisma
- **Application des migrations de base de données** (`prisma migrate deploy`)
- Démarrage du serveur

**Configuration actuelle dans `package.json`:**

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "railway": "node scripts/railway-start.js"
  }
}
```

**Aucune action manuelle requise** - tout est automatisé !

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
- [ ] Variables d'environnement configurées dans Railway
- [ ] Migrations Prisma créées et commitées sur GitHub
- [ ] Tests locaux passés
- [ ] Build fonctionne localement (`npm run build`)
- [ ] Secrets API configurés (OpenAI, Google OAuth, ADMIN_PASSWORD, SESSION_SECRET)

### Déploiement
- [ ] Backend déployé sur Railway (migrations appliquées automatiquement)
- [ ] Frontend déployé sur Vercel/Netlify
- [ ] Base de données PostgreSQL créée et accessible
- [ ] Health check répond (`/health`)
- [ ] CORS configuré correctement (`FRONTEND_URL` dans Railway)
- [ ] Vérifier les logs Railway pour confirmer que les migrations ont réussi

### Post-déploiement
- [ ] Test upload d'image
- [ ] Test génération de rapport
- [ ] Vérification des logs
- [ ] Monitoring configuré
- [ ] Documentation à jour

---

## Troubleshooting

### Erreur: "Database connection failed"
- Vérifier `DATABASE_URL` dans Railway (généré automatiquement quand vous ajoutez PostgreSQL)
- Vérifier que PostgreSQL est actif dans le dashboard Railway
- Les migrations s'exécutent automatiquement - vérifier les logs Railway pour voir si elles ont réussi
- Si besoin de forcer les migrations manuellement: `railway run npx prisma migrate deploy`

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
