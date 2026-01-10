# Stratégie de Tests - Application d'Inventaire IA

## Capacités de Test Disponibles

### ✅ Ce que je peux faire

1. **Tests Navigateur (E2E)**
   - ✅ Démarrer l'application via shell
   - ✅ Ouvrir un navigateur et naviguer vers l'app
   - ✅ Prendre des captures d'écran
   - ✅ Interagir avec les éléments (clics, saisie, upload)
   - ✅ Vérifier le rendu visuel
   - ✅ Tester les flux utilisateur complets
   - ✅ Vérifier les erreurs dans la console
   - ✅ Vérifier les requêtes réseau

2. **Tests Backend via Shell**
   - ✅ Démarrer/arrêter le serveur
   - ✅ Exécuter des commandes curl pour tester les API
   - ✅ Vérifier les logs du serveur
   - ✅ Tester les endpoints individuellement

3. **Tests Base de Données**
   - ✅ Se connecter à PostgreSQL
   - ✅ Exécuter des requêtes SQL
   - ✅ Vérifier l'intégrité des données
   - ✅ Tester les migrations
   - ✅ Vérifier les contraintes
   - ✅ Tester les relations entre tables

4. **Tests Automatisés**
   - ✅ Créer et exécuter des scripts de test
   - ✅ Utiliser des frameworks de test (Jest, Vitest, etc.)
   - ✅ Tests unitaires pour fonctions/services
   - ✅ Tests d'intégration pour API
   - ✅ Tests de santé (health checks)

### ⚠️ Limitations

- ❌ Je ne peux pas exécuter des tests en continu (watch mode)
- ❌ Je ne peux pas interagir avec des modals de confirmation système
- ❌ Tests de performance avancés nécessitent outils spécialisés
- ❌ Tests de charge nécessitent outils externes

### ⚠️ Limitations MCP (Model Context Protocol)

**Note importante** : Les outils de navigateur MCP peuvent ne pas être disponibles dans certains cas :

**Causes communes** :
- **Version Node.js** : Nécessite Node.js 22.12.0+ (utiliser `nvm install lts/iron` ou `nvm install 22`)
- **Problèmes de chemin** : Espaces dans le chemin utilisateur ou problèmes de cache npx
- **Configuration MCP** : Serveur MCP mal configuré dans les paramètres Cursor
- **Désactivation temporaire** : Outils parfois désactivés pour stabilité

**Solutions** :
1. Vérifier la version Node.js : `node --version` (doit être 22+)
2. Vérifier MCP dans le terminal : `npx @playwright/mcp@latest`
3. Vérifier les logs MCP dans Cursor : `Ctrl+Shift+U > "MCP Logs"`
4. Redémarrer Cursor et le PC
5. Nettoyer le cache npx si nécessaire

**Alternatives si MCP ne fonctionne pas** :
- ✅ Tests automatisés avec Playwright/Cypress (scripts exécutables)
- ✅ Tests via shell avec curl et vérification des réponses
- ✅ Tests de base de données directement via psql
- ✅ Tests unitaires et d'intégration (toujours fonctionnels)

---

## Types de Tests à Implémenter

### 1. Tests Unitaires

**Objectif** : Tester les fonctions individuelles isolément

**Framework** : Jest ou Vitest

**À tester** :
- ✅ Fonctions de calcul de dépréciation
- ✅ Parsing des réponses OpenAI
- ✅ Validation des données
- ✅ Formatage des prix
- ✅ Utilitaires de transformation de données
- ✅ Fonctions de génération PDF

**Exemple** :
```typescript
// tests/unit/calculations.test.ts
describe('calculateReplacementValue', () => {
  it('should calculate replacement value with depreciation', () => {
    const result = calculateReplacementValue(1000, 'good', 5);
    expect(result).toBeCloseTo(750, 2);
  });
});
```

---

### 2. Tests d'Intégration API

**Objectif** : Tester les endpoints API avec la base de données réelle

**Framework** : Jest + Supertest

**À tester** :
- ✅ POST /api/inventories (création)
- ✅ GET /api/inventories/:id (récupération)
- ✅ POST /api/inventories/:id/report (génération PDF)
- ✅ Validation des données d'entrée
- ✅ Gestion des erreurs
- ✅ Codes de statut HTTP

**Exemple** :
```typescript
// tests/integration/inventories.test.ts
describe('POST /api/inventories', () => {
  it('should create inventory with images', async () => {
    const response = await request(app)
      .post('/api/inventories')
      .attach('images', 'test-image.jpg')
      .expect(201);
    
    expect(response.body.id).toBeDefined();
    expect(response.body.status).toBe('processing');
  });
});
```

---

### 3. Tests Base de Données

**Objectif** : Vérifier l'intégrité, les migrations, et la santé de la DB

**Types de tests** :

#### A. Tests de Schéma
- ✅ Vérifier que toutes les tables existent
- ✅ Vérifier les contraintes (foreign keys, checks)
- ✅ Vérifier les index
- ✅ Vérifier les triggers

#### B. Tests de Migrations
- ✅ Tester que les migrations s'appliquent correctement
- ✅ Tester le rollback des migrations
- ✅ Vérifier l'intégrité après migration

#### C. Tests de Santé (Health Checks)
- ✅ Connexion à la base de données
- ✅ Temps de réponse des requêtes
- ✅ Espace disque disponible
- ✅ Nombre de connexions actives
- ✅ Taille des tables

**Exemple** :
```typescript
// tests/database/health.test.ts
describe('Database Health', () => {
  it('should connect to database', async () => {
    const result = await db.query('SELECT NOW()');
    expect(result).toBeDefined();
  });
  
  it('should have all required tables', async () => {
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableNames = tables.rows.map(r => r.table_name);
    expect(tableNames).toContain('inventories');
    expect(tableNames).toContain('inventory_items');
    expect(tableNames).toContain('inventory_images');
    expect(tableNames).toContain('reports');
  });
});
```

---

### 4. Tests E2E (End-to-End)

**Objectif** : Tester les flux utilisateur complets dans le navigateur

**Framework** : Playwright ou Cypress (recommandé: Playwright)

**Flux à tester** :
1. **Création d'inventaire**
   - Upload d'images multiples
   - Affichage du statut "processing"
   - Attente de la complétion
   - Affichage des items identifiés

2. **Visualisation d'inventaire**
   - Liste des inventaires
   - Détails d'un inventaire
   - Affichage des items avec images
   - Affichage des valeurs

3. **Génération de rapport**
   - Clic sur "Générer rapport"
   - Téléchargement du PDF
   - Vérification du contenu du PDF

4. **Gestion d'erreurs**
   - Upload de fichier invalide
   - Erreur API OpenAI
   - Erreur de connexion DB

**Exemple** :
```typescript
// tests/e2e/inventory-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete inventory flow', async ({ page }) => {
  // 1. Naviguer vers l'app
  await page.goto('http://localhost:5173');
  
  // 2. Upload d'images
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(['test-images/sofa.jpg', 'test-images/tv.jpg']);
  
  // 3. Vérifier le statut "processing"
  await expect(page.locator('text=En traitement')).toBeVisible();
  
  // 4. Attendre la complétion (avec timeout)
  await page.waitForSelector('text=Complété', { timeout: 60000 });
  
  // 5. Vérifier les items identifiés
  const items = page.locator('.item-card');
  await expect(items).toHaveCount(2);
  
  // 6. Générer le rapport
  await page.click('button:has-text("Générer rapport")');
  
  // 7. Vérifier le téléchargement
  const downloadPromise = page.waitForEvent('download');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

---

### 5. Tests de Santé (Health Checks)

**Objectif** : Vérifier que tous les services sont opérationnels

**Endpoints à créer** :

#### GET /health
```typescript
// Vérifie la santé générale
{
  "status": "ok",
  "timestamp": "2024-01-15T10:00:00Z",
  "services": {
    "database": "ok",
    "openai": "ok"
  }
}
```

#### GET /health/db
```typescript
// Vérifie la santé de la base de données
{
  "status": "ok",
  "responseTime": 12,
  "connections": {
    "active": 2,
    "idle": 8,
    "max": 20
  },
  "database": {
    "size": "125 MB",
    "tables": {
      "inventories": 45,
      "inventory_items": 234,
      "inventory_images": 567
    }
  }
}
```

**Tests** :
```typescript
// tests/health/health.test.ts
describe('Health Checks', () => {
  it('should return healthy status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  
  it('should check database health', async () => {
    const response = await request(app).get('/health/db');
    expect(response.status).toBe(200);
    expect(response.body.services.database).toBe('ok');
    expect(response.body.responseTime).toBeLessThan(100);
  });
});
```

---

### 6. Tests de Performance

**Objectif** : Vérifier que l'app répond dans des temps acceptables

**Métriques à tester** :
- ✅ Temps de réponse API (< 200ms pour GET, < 2s pour POST)
- ✅ Temps de traitement d'image (< 30s par image)
- ✅ Temps de génération PDF (< 5s)
- ✅ Taille des réponses API (< 1MB)

**Exemple** :
```typescript
// tests/performance/api-performance.test.ts
describe('API Performance', () => {
  it('should respond to GET /api/inventories in < 200ms', async () => {
    const start = Date.now();
    await request(app).get('/api/inventories');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200);
  });
});
```

---

### 7. Tests de Sécurité

**Objectif** : Vérifier que l'app est sécurisée

**À tester** :
- ✅ Validation des types de fichiers (images uniquement)
- ✅ Limite de taille de fichier (10MB)
- ✅ Protection contre les injections SQL
- ✅ Validation des entrées utilisateur
- ✅ CORS configuré correctement
- ✅ Headers de sécurité

**Exemple** :
```typescript
// tests/security/validation.test.ts
describe('Security', () => {
  it('should reject non-image files', async () => {
    const response = await request(app)
      .post('/api/inventories')
      .attach('images', 'malicious.exe')
      .expect(400);
    
    expect(response.body.error).toContain('image');
  });
  
  it('should limit file size to 10MB', async () => {
    const largeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB
    const response = await request(app)
      .post('/api/inventories')
      .attach('images', largeFile, 'large.jpg')
      .expect(413);
  });
});
```

---

## Structure des Tests

```
project-root/
├── frontend/
│   ├── src/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── backend/
│   ├── src/
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   ├── utils/
│       │   └── calculations.test.ts
│       ├── integration/
│       │   ├── api/
│       │   │   ├── inventories.test.ts
│       │   │   ├── items.test.ts
│       │   │   └── reports.test.ts
│       │   └── database/
│       │       ├── schema.test.ts
│       │       ├── migrations.test.ts
│       │       └── health.test.ts
│       ├── e2e/
│       │   └── inventory-flow.spec.ts
│       └── fixtures/
│           ├── test-images/
│           └── mock-data.ts
└── test.md
```

---

## Configuration des Tests

### Backend (Jest/Vitest)

```json
// backend/package.json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest tests/integration",
    "test:db": "vitest tests/integration/database"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "supertest": "^6.3.0",
    "@types/supertest": "^2.0.0"
  }
}
```

```typescript
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

### Frontend (Vitest + Playwright)

```json
// frontend/package.json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0"
  }
}
```

---

## Tests de Base de Données - Détails

### Script de Santé DB

```typescript
// backend/src/utils/db-health.ts
export async function checkDatabaseHealth() {
  const checks = {
    connection: false,
    responseTime: 0,
    tables: [] as string[],
    constraints: false,
    indexes: false
  };
  
  const start = Date.now();
  
  try {
    // Test connexion
    await db.query('SELECT 1');
    checks.connection = true;
    
    // Vérifier tables
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    checks.tables = tables.rows.map(r => r.table_name);
    
    // Vérifier contraintes
    const constraints = await db.query(`
      SELECT COUNT(*) as count
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
    `);
    checks.constraints = parseInt(constraints.rows[0].count) > 0;
    
    // Vérifier index
    const indexes = await db.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes
      WHERE schemaname = 'public'
    `);
    checks.indexes = parseInt(indexes.rows[0].count) > 0;
    
    checks.responseTime = Date.now() - start;
    
    return {
      status: checks.connection && checks.constraints && checks.indexes ? 'ok' : 'error',
      ...checks
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      ...checks
    };
  }
}
```

### Tests de Migration

```typescript
// tests/integration/database/migrations.test.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('Database Migrations', () => {
  it('should apply all migrations successfully', async () => {
    const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
    expect(stderr).toBe('');
    expect(stdout).toContain('Applied');
  });
  
  it('should have correct schema after migration', async () => {
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    expect(tableNames).toEqual([
      'inventories',
      'inventory_images',
      'inventory_items',
      'reports'
    ]);
  });
});
```

---

## Tests E2E avec Navigateur

### Workflow de Test Manuel (via Browser Tools MCP)

**Note** : Si les outils MCP de navigateur ne sont pas disponibles, voir section "Alternatives" ci-dessous.

Quand les outils MCP fonctionnent, je peux tester l'app manuellement :

1. **Démarrer l'application**
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend (dans un autre terminal)
   cd frontend && npm run dev
   ```

2. **Ouvrir le navigateur**
   - Naviguer vers `http://localhost:5173`
   - Prendre une capture d'écran de la page d'accueil
   - Vérifier que l'interface se charge correctement

3. **Tester l'upload d'images**
   - Cliquer sur le bouton "Upload"
   - Sélectionner des images de test
   - Vérifier l'affichage du statut "processing"
   - Attendre la complétion
   - Vérifier l'affichage des items

4. **Vérifier les erreurs**
   - Console du navigateur
   - Requêtes réseau (succès/échec)
   - Messages d'erreur affichés

5. **Tester la génération de rapport**
   - Cliquer sur "Générer rapport"
   - Vérifier le téléchargement du PDF

### Alternatives si MCP Navigateur ne fonctionne pas

Si les outils MCP de navigateur ne sont pas disponibles, nous utiliserons :

1. **Playwright Headless** (recommandé)
   ```bash
   # Installer Playwright
   npm install -D @playwright/test
   npx playwright install
   
   # Exécuter les tests
   npx playwright test
   ```

2. **Tests via curl + vérification**
   ```bash
   # Tester les endpoints API
   curl http://localhost:3000/api/inventories
   curl -X POST http://localhost:3000/api/inventories -F "images=@test.jpg"
   ```

3. **Scripts de vérification manuels**
   - Ouvrir manuellement le navigateur
   - Suivre un checklist de tests
   - Documenter les résultats

### Script de Test Automatisé

```typescript
// tests/e2e/manual-browser-test.ts
// Ce script peut être exécuté pour guider les tests manuels

export const testScenarios = [
  {
    name: 'Homepage Load',
    steps: [
      'Navigate to http://localhost:5173',
      'Take screenshot',
      'Verify header is visible',
      'Verify "Nouvel Inventaire" button exists'
    ]
  },
  {
    name: 'Image Upload',
    steps: [
      'Click "Nouvel Inventaire"',
      'Upload test images',
      'Verify processing status',
      'Wait for completion',
      'Verify items are displayed'
    ]
  },
  // ...
];
```

---

## Commandes de Test

### Exécuter tous les tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# E2E
npm run test:e2e
```

### Tests spécifiques
```bash
# Tests unitaires seulement
npm test -- tests/unit

# Tests d'intégration
npm test -- tests/integration

# Tests de base de données
npm test -- tests/integration/database

# Tests E2E
npm run test:e2e -- tests/e2e/inventory-flow.spec.ts
```

### Coverage
```bash
npm run test:coverage
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: 123
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run database migrations
        run: |
          cd backend
          npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:123@localhost:5432/test_db
      
      - name: Run backend tests
        run: |
          cd backend && npm test
        env:
          DATABASE_URL: postgresql://postgres:123@localhost:5432/test_db
      
      - name: Run frontend tests
        run: |
          cd frontend && npm test
      
      - name: Run E2E tests
        run: |
          npm run test:e2e
```

---

## Checklist de Tests

### Avant chaque commit
- [ ] Tests unitaires passent
- [ ] Tests d'intégration API passent
- [ ] Tests de base de données passent
- [ ] Aucune erreur de linting

### Avant chaque déploiement
- [ ] Tous les tests passent
- [ ] Tests E2E complets passent
- [ ] Health checks passent
- [ ] Coverage > 80%
- [ ] Tests de performance dans les limites

### Tests manuels (via navigateur)
- [ ] Page d'accueil se charge
- [ ] Upload d'images fonctionne
- [ ] Traitement IA fonctionne
- [ ] Affichage des items correct
- [ ] Génération PDF fonctionne
- [ ] Gestion d'erreurs appropriée

---

## Métriques de Succès

- **Coverage** : > 80% de couverture de code
- **Performance** : 
  - API GET < 200ms
  - API POST < 2s
  - Traitement image < 30s
- **Fiabilité** : 100% des tests passent avant déploiement
- **Santé DB** : Response time < 100ms, toutes les tables présentes

---

## Ressources

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Jest Documentation](https://jestjs.io)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
