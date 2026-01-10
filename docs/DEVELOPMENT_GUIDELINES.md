# Guidelines de Développement - AIA-APP

**Document de référence pour les futures sessions de développement**

Ce document capture toutes les décisions, préférences et conventions établies pour le projet. **LIRE CE DOCUMENT EN PREMIER** avant de commencer à coder.

---

## 📋 Principes Fondamentaux

### 1. **Pas de "God Files"**
- ❌ **NE PAS** créer de fichiers monolithiques qui font tout
- ✅ **SÉPARER** les responsabilités en modules/services distincts
- ✅ **UTILISER** une architecture modulaire et maintenable
- ✅ **CRÉER** des fichiers focalisés sur une seule responsabilité

**Exemples à éviter** :
```typescript
// ❌ MAUVAIS - Un fichier qui fait tout
// server.ts (5000+ lignes avec routes, services, DB, etc.)

// ✅ BON - Séparation claire
// routes/inventories.ts
// services/openai.service.ts
// services/pricing.service.ts
// database/client.ts
```

### 2. **Documentation dans `docs/`**
- ✅ **TOUS** les fichiers de documentation doivent être dans `docs/`
- ❌ **NE PAS** mettre de documentation à la racine (sauf README.md)
- ✅ **ORGANISER** la documentation par sujet dans `docs/`

**Structure** :
```
docs/
├── TECHNICAL_SPECIFICATION.md
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── DEPLOYMENT.md
├── UI.md
├── DEVELOPMENT_GUIDELINES.md (ce fichier)
└── ...
```

### 3. **Structure de Projet Modulaire**
```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React réutilisables
│   │   ├── pages/          # Pages/views
│   │   ├── services/       # Services API
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilitaires
│   │   ├── types/          # Types TypeScript
│   │   └── App.tsx
│   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/         # Routes API (un fichier par ressource)
│   │   ├── services/       # Services métier (un service par domaine)
│   │   ├── models/         # Modèles de données
│   │   ├── database/       # Configuration DB
│   │   ├── utils/          # Utilitaires
│   │   ├── middleware/     # Middleware Express
│   │   └── server.ts       # Point d'entrée (minimal)
│   └── ...
├── docs/                   # TOUTE la documentation ici
└── scripts/                # Scripts utilitaires
```

---

## 🎨 Stack Technologique (Décisions Finales)

### Frontend
- **Framework** : React avec TypeScript
- **Build Tool** : Vite (pas Create React App)
- **UI Library** : DaisyUI + Tailwind CSS
- **Icons** : Font Awesome (FA) - **PAS d'emojis dans le code**
- **State Management** : Context API (pour MVP), Zustand si nécessaire plus tard
- **Image Upload** : React Dropzone

### Backend
- **Runtime** : Node.js avec TypeScript
- **Framework** : Express.js
- **ORM** : Prisma (pas TypeORM)
- **Database** : PostgreSQL (Railway)
- **Image Processing** : Sharp

### Infrastructure
- **Hosting** : Railway (backend + PostgreSQL)
- **Frontend Hosting** : Vercel ou Netlify
- **Storage** : PostgreSQL BYTEA (temporaire), migration S3 en Phase 3

### Services Externes
- **Vision IA** : OpenAI GPT-4 Vision API
- **Prix** : DataForSEO + SERP API (alternative)

---

## 🎨 Design & UI

### Palette de Couleurs
```css
Primary:   #FFD41D (Jaune vif)
Secondary: #FFA240 (Orange chaud)
Accent:    #D73535 (Rouge profond)
Danger:    #FF4646 (Rouge vif)
```

### Composants UI
- **Cards** : Élément central de l'UI (DaisyUI cards)
- **Icons** : Font Awesome uniquement (pas d'emojis)
- **Style** : Moderne, léger, beaucoup d'espace blanc
- **Responsive** : Mobile-first

Voir `docs/UI.md` pour les détails complets.

---

## 🗄️ Base de Données

### Configuration
- **PostgreSQL** sur Railway
- **Mot de passe** : `123` (pour développement local)
- **ORM** : Prisma
- **Migrations** : Via Prisma

### Structure
- 4 tables principales : `inventories`, `inventory_items`, `inventory_images`, `reports`
- UUID pour toutes les clés primaires
- JSONB pour données flexibles (ai_analysis, price_data, metadata)
- Images stockées en BYTEA (temporaire)

Voir `docs/DATABASE_SCHEMA.md` et `dbschema.md` pour les détails.

---

## 📝 Conventions de Code

### TypeScript
- ✅ **Toujours** utiliser TypeScript (pas de `.js`)
- ✅ **Strict mode** activé
- ✅ **Interfaces** pour tous les types de données
- ✅ **Types** dans `types/` ou `@types/`

### Nommage
- **Fichiers** : `kebab-case` (ex: `inventory-service.ts`)
- **Composants React** : `PascalCase` (ex: `InventoryCard.tsx`)
- **Variables/Fonctions** : `camelCase` (ex: `calculateValue`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `MAX_FILE_SIZE`)
- **Types/Interfaces** : `PascalCase` (ex: `InventoryItem`)

### Structure des Fichiers
```typescript
// 1. Imports (groupés)
import { ... } from 'external-libs';
import { ... } from '@/components';
import { ... } from './local-imports';

// 2. Types/Interfaces
interface MyType { ... }

// 3. Constantes
const CONSTANT = 'value';

// 4. Fonction principale / Composant
export function MyComponent() { ... }

// 5. Utilitaires / Helpers (si nécessaire)
function helper() { ... }
```

### Services
- **Un service par domaine** (ex: `openai.service.ts`, `pricing.service.ts`)
- **Pas de logique métier dans les routes**
- **Routes** : Validation + Appel service + Réponse

```typescript
// ✅ BON - Route mince
router.post('/inventories', async (req, res) => {
  const data = validateRequest(req);
  const result = await inventoryService.create(data);
  res.json(result);
});

// ❌ MAUVAIS - Logique dans la route
router.post('/inventories', async (req, res) => {
  // 200 lignes de logique ici...
});
```

---

## 🧪 Tests

### Structure
- **Tests unitaires** : `tests/unit/`
- **Tests d'intégration** : `tests/integration/`
- **Tests E2E** : `tests/e2e/`
- **Fixtures** : `tests/fixtures/`

### Frameworks
- **Backend** : Vitest
- **Frontend** : Vitest + React Testing Library
- **E2E** : Playwright

### Health Checks
- Endpoint `/health` pour santé générale
- Endpoint `/health/db` pour santé base de données

Voir `test.md` pour les détails complets.

---

## 🔒 Sécurité & Conformité

### Loi 25 (Québec)
- ✅ Consentement explicite avant upload
- ✅ Hébergement canadien (Railway)
- ✅ Droit à l'oubli (endpoint DELETE)
- ✅ Logs d'accès

### Validation
- ✅ Validation stricte des types de fichiers (images uniquement)
- ✅ Limite de taille : 10MB par image
- ✅ Validation des entrées utilisateur
- ✅ Protection contre injections SQL (Prisma)

---

## 🚀 Déploiement

### Environnements
- **Development** : Local avec PostgreSQL local
- **Production** : Railway (backend) + Vercel/Netlify (frontend)

### Variables d'Environnement
- **Backend** : `.env` (ne pas commiter)
- **Frontend** : `.env` avec préfixe `VITE_`

Voir `docs/DEPLOYMENT.md` pour les détails.

---

## 📚 Documentation

### Où mettre la documentation
- ✅ **TOUT** dans `docs/` (sauf README.md à la racine)
- ✅ **Un fichier par sujet** (pas de fichiers énormes)
- ✅ **Markdown** pour toute la documentation

### Types de Documentation
- **Technique** : `docs/TECHNICAL_SPECIFICATION.md`
- **API** : `docs/API_DOCUMENTATION.md`
- **Base de données** : `docs/DATABASE_SCHEMA.md` + `dbschema.md`
- **UI/UX** : `docs/UI.md`
- **Déploiement** : `docs/DEPLOYMENT.md`
- **Tests** : `test.md` (à déplacer dans `docs/`)

---

## 🛠️ Outils & Scripts

### Scripts Disponibles
- `scripts/diagnose-mcp.js` - Diagnostic MCP
- `scripts/setup-github.ps1` - Setup GitHub repo
- `scripts/connect-github.ps1` - Connecter repo local à GitHub

### Commandes Utiles
```bash
# Base de données
psql -U postgres -d aia_app -p 5432  # Password: 123

# Migrations Prisma
npx prisma migrate dev
npx prisma generate
npx prisma studio

# Tests
npm test
npm run test:coverage
npm run test:e2e
```

---

## ⚠️ Anti-Patterns à Éviter

### ❌ À NE PAS FAIRE

1. **God Files**
   ```typescript
   // ❌ Un fichier de 2000+ lignes
   // server.ts avec routes, services, DB, etc.
   ```

2. **Documentation à la racine**
   ```
   ❌ project-root/
      ├── api-docs.md
      ├── database.md
      └── ...
   ```

3. **Logique métier dans les routes**
   ```typescript
   // ❌ Route avec toute la logique
   router.post('/inventories', async (req, res) => {
     // 500 lignes de code ici
   });
   ```

4. **Emojis dans le code**
   ```typescript
   // ❌
   const message = "✅ Success! 🎉";
   
   // ✅ Utiliser Font Awesome icons
   <FontAwesomeIcon icon={faCheckCircle} />
   ```

5. **Types `any` partout**
   ```typescript
   // ❌
   function process(data: any) { ... }
   
   // ✅
   interface ProcessData { ... }
   function process(data: ProcessData) { ... }
   ```

6. **Services monolithiques**
   ```typescript
   // ❌ Un service qui fait tout
   class EverythingService {
     processImages() { ... }
     callOpenAI() { ... }
     searchPrices() { ... }
     generatePDF() { ... }
   }
   
   // ✅ Services séparés
   class ImageService { ... }
   class OpenAIService { ... }
   class PricingService { ... }
   class ReportService { ... }
   ```

---

## ✅ Patterns à Suivre

### 1. **Architecture en Couches**
```
Routes → Services → Database
         ↓
      External APIs
```

### 2. **Services Focalisés**
```typescript
// Un service = un domaine
class InventoryService {
  async create(data: CreateInventoryDto) { ... }
  async findById(id: string) { ... }
  async update(id: string, data: UpdateInventoryDto) { ... }
}
```

### 3. **Composants Réutilisables**
```typescript
// Composants dans components/
// Pages dans pages/
// Hooks dans hooks/
```

### 4. **Error Handling Centralisé**
```typescript
// middleware/error-handler.ts
export function errorHandler(err, req, res, next) {
  // Gestion centralisée des erreurs
}
```

### 5. **Validation Centralisée**
```typescript
// utils/validation.ts
export function validateInventory(data) {
  // Validation réutilisable
}
```

---

## 📦 Dépendances Principales

### Backend
- `express` - Framework web
- `prisma` - ORM
- `@prisma/client` - Client Prisma
- `openai` - OpenAI API
- `sharp` - Image processing
- `multer` - File upload
- `pdfkit` ou `pdfmake` - PDF generation

### Frontend
- `react` + `react-dom`
- `vite` - Build tool
- `@tanstack/react-query` - Data fetching (optionnel)
- `daisyui` - UI components
- `tailwindcss` - CSS framework
- `@fortawesome/react-fontawesome` - Icons
- `react-dropzone` - File upload

---

## 🔄 Workflow de Développement

### 1. Créer une nouvelle fonctionnalité
```
1. Créer la route dans routes/
2. Créer le service dans services/
3. Ajouter les types dans types/
4. Écrire les tests
5. Mettre à jour la documentation
```

### 2. Modifier la base de données
```
1. Modifier schema.prisma
2. Créer migration: npx prisma migrate dev --name description
3. Générer client: npx prisma generate
4. Tester la migration
```

### 3. Ajouter un composant UI
```
1. Créer dans components/
2. Utiliser DaisyUI + Font Awesome
3. Suivre les guidelines dans docs/UI.md
4. Ajouter les tests si nécessaire
```

---

## 🎯 Priorités MVP

### Phase 1 (MVP) - Focus
1. ✅ Upload d'images multiples
2. ✅ Appel OpenAI Vision API
3. ✅ Parsing des résultats
4. ✅ Recherche de prix (DataForSEO)
5. ✅ Calcul de valeurs
6. ✅ Génération PDF basique
7. ✅ Interface admin simple

### À Reporter en Phase 2+
- Authentification (Phase 3)
- Multi-utilisateurs (Phase 3)
- Migration S3 (Phase 3)
- Interface corrections manuelles (Phase 2)
- Export formats multiples (Phase 2)

---

## 📞 Informations Importantes

### Base de Données Locale
- **Host** : localhost
- **Port** : 5432
- **User** : postgres
- **Password** : `123`
- **Database** : À créer (voir scripts)

### Accès Shell
- ✅ J'ai accès au shell
- ✅ Je peux créer la base de données
- ✅ Je peux exécuter les migrations

### Tests
- ✅ Je peux tester via navigateur (MCP)
- ✅ Je peux tester via scripts automatisés
- ✅ Tests DB via psql

---

## 🔍 Checklist Avant de Commencer

Avant de coder, vérifier :

- [ ] J'ai lu ce document (DEVELOPMENT_GUIDELINES.md)
- [ ] J'ai lu la spécification technique (`docs/TECHNICAL_SPECIFICATION.md`)
- [ ] J'ai vérifié la structure de la DB (`docs/DATABASE_SCHEMA.md`)
- [ ] J'ai consulté les guidelines UI (`docs/UI.md`)
- [ ] Je comprends les conventions de nommage
- [ ] Je sais où mettre la documentation (dans `docs/`)
- [ ] Je vais créer des fichiers modulaires (pas de god files)

---

## 📝 Notes Finales

- **Ce document est vivant** : Mettre à jour quand de nouvelles décisions sont prises
- **En cas de doute** : Consulter ce document d'abord
- **Nouvelle fonctionnalité** : Vérifier qu'elle respecte ces guidelines
- **Refactoring** : Utiliser ces guidelines pour améliorer le code existant

---

**Dernière mise à jour** : 2026-01-15
**Version** : 1.0
