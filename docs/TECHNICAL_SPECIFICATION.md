# Spécification Technique - Application d'Inventaire IA pour Assurance

## Vue d'ensemble

Application web React utilisant la vision par ordinateur (OpenAI) pour automatiser l'inventaire des biens meubles, déterminer leur valeur de remplacement et générer un rapport d'assurance.

---

## Architecture Technique

### Stack Technologique

#### Frontend
- **Framework**: React (TypeScript)
- **Build Tool**: Vite ou Create React App
- **State Management**: Context API ou Zustand (à déterminer)
- **UI Library**: Material-UI, Chakra UI, ou Tailwind CSS (à déterminer)
- **Image Upload**: React Dropzone ou similaire

#### Backend
- **Runtime**: Node.js avec TypeScript
- **Framework**: Express.js ou Fastify
- **ORM/Database**: Prisma ou TypeORM avec PostgreSQL
- **Image Processing**: Sharp (pour redimensionnement/optimisation)

#### Infrastructure
- **Hosting Backend**: Railway
- **Database**: PostgreSQL (Railway)
- **Storage**: Images stockées dans PostgreSQL (type BYTEA ou base64) - temporaire
- **API Vision**: OpenAI GPT-4 Vision API

#### Services Externes
- **Vision IA**: OpenAI GPT-4 Vision API
- **Recherche de Prix**: 
  - DataForSEO API
  - SERP API (alternative)
  - APIs directes de retailers (si disponibles)

---

## Structure de la Base de Données

### Tables Principales

#### `inventories`
```sql
- id: UUID (primary key)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- status: ENUM ('draft', 'processing', 'completed', 'error')
- total_estimated_value: DECIMAL
- recommended_insurance_amount: DECIMAL
- metadata: JSONB (informations additionnelles)
```

#### `inventory_items`
```sql
- id: UUID (primary key)
- inventory_id: UUID (foreign key -> inventories.id)
- category: VARCHAR (ex: 'furniture', 'electronics', 'clothing')
- item_name: VARCHAR (nom identifié par l'IA)
- brand: VARCHAR (marque détectée, nullable)
- model: VARCHAR (modèle détecté, nullable)
- condition: VARCHAR (ex: 'new', 'excellent', 'good', 'fair', 'poor')
- estimated_age: INTEGER (en années, nullable)
- estimated_value: DECIMAL
- replacement_value: DECIMAL
- ai_analysis: JSONB (réponse complète de l'API OpenAI)
- price_data: JSONB (données de prix de DataForSEO/SERP)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `inventory_images`
```sql
- id: UUID (primary key)
- inventory_id: UUID (foreign key -> inventories.id)
- item_id: UUID (foreign key -> inventory_items.id, nullable - si image globale)
- image_data: BYTEA (image binaire)
- image_type: VARCHAR (MIME type: 'image/jpeg', 'image/png')
- file_name: VARCHAR
- file_size: INTEGER (en bytes)
- upload_order: INTEGER (ordre de téléchargement)
- created_at: TIMESTAMP
```

#### `reports`
```sql
- id: UUID (primary key)
- inventory_id: UUID (foreign key -> inventories.id)
- report_type: VARCHAR (ex: 'pdf', 'json')
- report_data: BYTEA (fichier généré)
- generated_at: TIMESTAMP
```

---

## Flux de Données

### 1. Upload et Traitement des Images

```
Utilisateur → Frontend React
  ↓
Upload multiple images (drag & drop ou file picker)
  ↓
Frontend → Backend API: POST /api/inventories
  ↓
Backend:
  1. Créer enregistrement `inventories` (status: 'draft')
  2. Sauvegarder images dans `inventory_images`
  3. Changer status à 'processing'
  4. Pour chaque image:
     a. Convertir en base64 ou garder binaire
     b. Appeler OpenAI Vision API
     c. Parser la réponse JSON
     d. Créer enregistrement `inventory_items`
     e. Pour chaque item identifié:
        - Rechercher prix via DataForSEO/SERP
        - Calculer valeur de remplacement
        - Appliquer dépréciation selon condition/âge
  5. Calculer total et montant d'assurance recommandé
  6. Changer status à 'completed'
  ↓
Retour au Frontend: GET /api/inventories/:id
  ↓
Affichage de l'inventaire complet
```

### 2. Génération de Rapport

```
Utilisateur clique "Générer Rapport"
  ↓
Frontend → Backend API: POST /api/inventories/:id/report
  ↓
Backend:
  1. Récupérer inventaire complet avec items et images
  2. Générer PDF (avec bibliothèque comme PDFKit ou pdfmake)
  3. Sauvegarder dans table `reports`
  4. Retourner le PDF en base64 ou URL de téléchargement
  ↓
Frontend: Télécharger le rapport PDF
```

---

## Intégration OpenAI Vision API

### Format de Requête

```typescript
{
  model: "gpt-4-vision-preview" ou "gpt-4o",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyse cette image de biens meubles. Identifie tous les objets visibles, leur catégorie (meuble, électronique, vêtement, etc.), leur marque et modèle si visible, et estime leur état (neuf, excellent, bon, usé, très usé) et âge approximatif. Retourne un JSON avec cette structure: {items: [{name, category, brand, model, condition, estimatedAge, description}]}"
        },
        {
          type: "image_url",
          image_url: {
            url: "data:image/jpeg;base64,..." // ou URL si hébergé
          }
        }
      ]
    }
  ],
  max_tokens: 1000
}
```

### Format de Réponse Attendu

```json
{
  "items": [
    {
      "name": "Canapé en cuir",
      "category": "furniture",
      "brand": "La-Z-Boy",
      "model": null,
      "condition": "good",
      "estimatedAge": 5,
      "description": "Canapé trois places en cuir marron, légèrement usé aux accoudoirs"
    },
    {
      "name": "Téléviseur LED",
      "category": "electronics",
      "brand": "Samsung",
      "model": "55\" QLED",
      "condition": "excellent",
      "estimatedAge": 2,
      "description": "Téléviseur Samsung 55 pouces, modèle récent"
    }
  ]
}
```

### Gestion des Erreurs
- Rate limiting OpenAI
- Retry logic avec exponential backoff
- Fallback si API indisponible
- Logging des erreurs

---

## Intégration DataForSEO / Recherche de Prix

### Workflow de Recherche de Prix

```
Pour chaque item identifié:
  1. Construire requête de recherche:
     - Format: "{brand} {model} {name} prix"
     - Exemple: "Samsung 55 QLED téléviseur prix"
  
  2. Appel DataForSEO SERP API:
     - Endpoint: POST /v3/serp/google/organic/live/advanced
     - Paramètres: keyword, location (Canada/Québec), language (fr)
  
  3. Parser les résultats:
     - Extraire prix des résultats organiques
     - Identifier retailers (Best Buy, Amazon.ca, etc.)
     - Prendre prix moyen ou médian
  
  4. Alternative SERP API:
     - Si DataForSEO échoue, utiliser alternative SERP
     - Même logique de parsing
  
  5. Stocker dans `inventory_items.price_data`:
     {
       "source": "DataForSEO",
       "searchQuery": "...",
       "prices": [
         {"retailer": "Best Buy", "price": 1299.99, "currency": "CAD"},
         {"retailer": "Amazon", "price": 1249.99, "currency": "CAD"}
       ],
       "averagePrice": 1274.99,
       "retrievedAt": "2024-01-15T10:30:00Z"
     }
```

### Calcul de Valeur de Remplacement

```typescript
function calculateReplacementValue(
  averagePrice: number,
  condition: string,
  estimatedAge: number
): number {
  // Facteurs de dépréciation selon condition
  const conditionFactors = {
    'new': 1.0,
    'excellent': 0.9,
    'good': 0.75,
    'fair': 0.6,
    'poor': 0.4
  };
  
  // Dépréciation annuelle (varie par catégorie)
  const annualDepreciation = 0.05; // 5% par année
  
  let value = averagePrice * conditionFactors[condition];
  
  // Appliquer dépréciation selon l'âge
  if (estimatedAge > 0) {
    value = value * Math.pow(1 - annualDepreciation, estimatedAge);
  }
  
  return Math.round(value * 100) / 100; // Arrondir à 2 décimales
}
```

---

## API Endpoints

### Inventaires

#### `POST /api/inventories`
Créer un nouvel inventaire et uploader des images
- **Body**: FormData avec fichiers images
- **Response**: `{ id: string, status: string }`

#### `GET /api/inventories/:id`
Récupérer un inventaire complet
- **Response**: 
```json
{
  "id": "uuid",
  "status": "completed",
  "items": [...],
  "totalEstimatedValue": 15000.00,
  "recommendedInsuranceAmount": 15000.00,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### `GET /api/inventories`
Liste tous les inventaires
- **Query params**: `?page=1&limit=20`
- **Response**: Array d'inventaires

#### `DELETE /api/inventories/:id`
Supprimer un inventaire

### Items

#### `GET /api/inventories/:id/items`
Récupérer tous les items d'un inventaire

#### `PATCH /api/inventories/:id/items/:itemId`
Modifier manuellement un item (correction utilisateur)

### Images

#### `GET /api/inventories/:id/images/:imageId`
Récupérer une image (retourne image binaire)

### Rapports

#### `POST /api/inventories/:id/report`
Générer un rapport PDF
- **Query params**: `?format=pdf`
- **Response**: PDF file download ou base64

#### `GET /api/inventories/:id/report/:reportId`
Récupérer un rapport généré précédemment

---

## Structure des Fichiers du Projet

```
project-root/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload/
│   │   │   ├── InventoryList/
│   │   │   ├── ItemCard/
│   │   │   ├── ReportGenerator/
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── InventoryDetail.tsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── ...
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── App.tsx
│   ├── package.json
│   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── inventories.ts
│   │   │   ├── items.ts
│   │   │   ├── images.ts
│   │   │   └── reports.ts
│   │   ├── services/
│   │   │   ├── openai.service.ts
│   │   │   ├── pricing.service.ts
│   │   │   ├── image.service.ts
│   │   │   └── report.service.ts
│   │   ├── models/
│   │   │   ├── Inventory.ts
│   │   │   ├── InventoryItem.ts
│   │   │   └── ...
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   ├── utils/
│   │   │   ├── validation.ts
│   │   │   └── ...
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/
│   ├── TECHNICAL_SPECIFICATION.md
│   ├── API_DOCUMENTATION.md
│   └── DEPLOYMENT.md
└── README.md
```

---

## Variables d'Environnement

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# OpenAI
OPENAI_API_KEY=sk-...

# DataForSEO
DATAFORSEO_API_KEY=...
DATAFORSEO_LOGIN=...

# SERP Alternative (si utilisé)
SERP_API_KEY=...

# Server
PORT=3000
NODE_ENV=production

# Railway
RAILWAY_ENVIRONMENT=production
```

### Frontend (.env)
```env
VITE_API_URL=https://ia.heliacode.com
```

---

## Sécurité et Conformité

### Loi 25 (Québec)
- **Consentement**: Formulaire explicite avant upload d'images
- **Hébergement**: Railway (vérifier localisation des serveurs)
- **Rétention**: Politique de suppression automatique après X jours
- **Accès**: Logs d'accès aux données personnelles
- **Droit à l'oubli**: Endpoint pour suppression complète

### Mesures de Sécurité
- Validation stricte des types de fichiers (images uniquement)
- Limite de taille de fichier (ex: 10MB par image)
- Rate limiting sur les endpoints
- CORS configuré correctement
- Chiffrement des données sensibles en base

---

## Limitations et Considérations

### Stockage d'Images en Base de Données
- **Limitation actuelle**: PostgreSQL n'est pas optimal pour grandes quantités d'images
- **Recommandation future**: Migrer vers S3/Cloud Storage quand le volume augmente
- **Taille max recommandée**: 5-10MB par image
- **Compression**: Utiliser Sharp pour redimensionner avant stockage

### Coûts OpenAI
- GPT-4 Vision: ~$0.01-0.03 par image selon résolution
- Budget estimé MVP: ~$50-100 pour 1000 images
- Optimisation: Réduire résolution des images avant envoi

### Performance
- Traitement asynchrone recommandé (queue jobs)
- Pour MVP: Traitement synchrone acceptable
- Future: Redis + Bull pour queue processing

---

## Roadmap Technique

### Phase 1 (MVP) - Semaines 1-8
- [ ] Setup projet React + Express + PostgreSQL
- [ ] Upload d'images multiples
- [ ] Intégration OpenAI Vision API
- [ ] Parsing et stockage des résultats
- [ ] Intégration DataForSEO pour prix
- [ ] Calcul de valeurs
- [ ] Génération PDF basique
- [ ] Interface utilisateur complète

### Phase 2 - Semaines 9-16
- [ ] Reconnaissance améliorée marques/modèles
- [ ] Base de données de produits courants
- [ ] Interface pour corrections manuelles
- [ ] Amélioration algorithmes dépréciation
- [ ] Export formats multiples (JSON, CSV)

### Phase 3 - Semaines 17-24
- [ ] Authentification (Google OAuth)
- [ ] Multi-utilisateurs
- [ ] Migration images vers S3
- [ ] Queue processing (Redis + Bull)
- [ ] Intégration Applied Epic (si applicable)

---

## Métriques de Succès MVP

- **Précision identification**: >80% des objets majeurs identifiés
- **Temps de traitement**: <30 secondes par image
- **Taux d'erreur API**: <5%
- **Satisfaction utilisateur**: Interface intuitive, <3 clics pour générer rapport

---

## Ressources et Documentation

- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [DataForSEO API Docs](https://dataforseo.com/apis)
- [Railway Documentation](https://docs.railway.app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Documentation](https://react.dev)
