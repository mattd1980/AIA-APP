# Schéma de Base de Données - Vision Conceptuelle

## Vue d'Ensemble

La base de données est conçue pour supporter un flux de travail d'inventaire IA où :
1. Un utilisateur upload des images de ses biens
2. L'IA analyse chaque image et identifie les objets
3. Le système recherche les prix de remplacement
4. Un rapport final est généré avec la valeur totale

---

## Structure des Tables

### Diagramme de Relations

```
┌─────────────────┐
│   inventories   │ (1)
└────────┬────────┘
         │
         │ 1:N
         ├──────────────────┬──────────────────┐
         │                  │                  │
         │                  │                  │
    ┌────▼─────┐      ┌─────▼──────┐      ┌────▼────┐
    │inventory │      │inventory  │      │ reports │
    │  items   │      │  images   │      │         │
    └──────────┘      └───────────┘      └─────────┘
         │                  │
         │ N:1              │ N:1
         │                  │
    ┌────▼─────┐      ┌─────▼──────┐
    │(optional)│      │(optional)  │
    │  link    │      │   link     │
    └──────────┘      └────────────┘
```

---

## Table 1: `inventories`

**Rôle** : Représente un inventaire complet d'un locataire.

### Champs Principaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique (généré automatiquement) |
| `status` | ENUM | État du traitement : `draft`, `processing`, `completed`, `error` |
| `total_estimated_value` | DECIMAL(10,2) | Valeur totale estimée de tous les items (CAD) |
| `recommended_insurance_amount` | DECIMAL(10,2) | Montant d'assurance recommandé (CAD) |
| `metadata` | JSONB | Données additionnelles (notes, localisation, stats) |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Dernière mise à jour (auto) |

### Logique Métier

- **Status Flow** : `draft` → `processing` → `completed` (ou `error`)
- **Valeurs calculées** : `total_estimated_value` et `recommended_insurance_amount` sont la somme des `replacement_value` de tous les items
- **Metadata** : Stocke des infos comme le nombre d'images, temps de traitement, notes utilisateur

### Exemple de Données

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "total_estimated_value": 15234.50,
  "recommended_insurance_amount": 15234.50,
  "metadata": {
    "userNotes": "Inventaire salon et cuisine",
    "location": "Appartement 3B",
    "processingTime": 45.2,
    "imageCount": 8,
    "itemCount": 15
  }
}
```

---

## Table 2: `inventory_items`

**Rôle** : Chaque objet identifié par l'IA dans les images.

### Champs Principaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `inventory_id` | UUID | Référence à l'inventaire parent (FK) |
| `category` | ENUM | Catégorie : `furniture`, `electronics`, `clothing`, `appliances`, `decor`, `other` |
| `item_name` | VARCHAR(255) | Nom de l'objet (ex: "Canapé en cuir") |
| `brand` | VARCHAR(100) | Marque détectée (nullable) |
| `model` | VARCHAR(100) | Modèle détecté (nullable) |
| `condition` | ENUM | État : `new`, `excellent`, `good`, `fair`, `poor` |
| `estimated_age` | INTEGER | Âge estimé en années (nullable) |
| `estimated_value` | DECIMAL(10,2) | Valeur estimée actuelle |
| `replacement_value` | DECIMAL(10,2) | Valeur de remplacement (utilisée pour assurance) |
| `ai_analysis` | JSONB | Réponse complète de l'IA (description, confiance, etc.) |
| `price_data` | JSONB | Données de prix de DataForSEO/SERP |
| `created_at` | TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | Dernière mise à jour (auto) |

### Logique Métier

- **Relation** : Un inventaire peut avoir plusieurs items (1:N)
- **Valeurs** : 
  - `estimated_value` = valeur actuelle de l'objet
  - `replacement_value` = prix de remplacement neuf avec dépréciation appliquée
- **AI Analysis** : Stocke toute la réponse de OpenAI pour référence future
- **Price Data** : Stocke les résultats de recherche de prix pour traçabilité

### Exemple de Données

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
  "category": "furniture",
  "item_name": "Canapé en cuir",
  "brand": "La-Z-Boy",
  "model": null,
  "condition": "good",
  "estimated_age": 5,
  "estimated_value": 1200.00,
  "replacement_value": 900.00,
  "ai_analysis": {
    "description": "Canapé trois places en cuir marron",
    "confidence": 0.85,
    "detectedFeatures": ["leather", "three-seater", "brown"]
  },
  "price_data": {
    "source": "DataForSEO",
    "averagePrice": 1500.00,
    "currency": "CAD"
  }
}
```

---

## Table 3: `inventory_images`

**Rôle** : Stocke les images uploadées par l'utilisateur.

### Champs Principaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `inventory_id` | UUID | Référence à l'inventaire (FK) |
| `item_id` | UUID | Référence optionnelle à un item spécifique (FK, nullable) |
| `image_data` | BYTEA | Données binaires de l'image |
| `image_type` | VARCHAR(50) | MIME type : `image/jpeg`, `image/png`, `image/webp` |
| `file_name` | VARCHAR(255) | Nom original du fichier |
| `file_size` | INTEGER | Taille en bytes |
| `upload_order` | INTEGER | Ordre d'upload (pour affichage) |
| `created_at` | TIMESTAMP | Date d'upload |

### Logique Métier

- **Relation** : 
  - Une image appartient toujours à un inventaire (1:N)
  - Une image peut être liée à un item spécifique (optionnel, N:1)
- **Stockage** : Images stockées directement en base (BYTEA) - temporaire, migration S3 prévue
- **Limite** : Max 10MB par image (validation côté application)
- **Usage** : 
  - Si `item_id` est NULL → image globale de la pièce
  - Si `item_id` est défini → image spécifique d'un item

### Exemple de Données

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
  "item_id": "660e8400-e29b-41d4-a716-446655440001",
  "image_type": "image/jpeg",
  "file_name": "living-room-sofa.jpg",
  "file_size": 2456789,
  "upload_order": 1
}
```

---

## Table 4: `reports`

**Rôle** : Stocke les rapports PDF générés pour chaque inventaire.

### Champs Principaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `inventory_id` | UUID | Référence à l'inventaire (FK) |
| `report_type` | ENUM | Type : `pdf`, `json`, `csv` |
| `report_data` | BYTEA | Fichier binaire du rapport |
| `generated_at` | TIMESTAMP | Date de génération |

### Logique Métier

- **Relation** : Un inventaire peut avoir plusieurs rapports (1:N) - permet historique
- **Stockage** : Rapport stocké en binaire (BYTEA)
- **Génération** : Généré à la demande ou automatiquement quand status = `completed`
- **Format principal** : PDF pour l'utilisateur final

### Exemple de Données

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "inventory_id": "550e8400-e29b-41d4-a716-446655440000",
  "report_type": "pdf",
  "generated_at": "2024-01-15T10:30:00.000Z"
}
```

---

## Relations et Contraintes

### Relations Principales

1. **inventories → inventory_items** : 1:N (CASCADE DELETE)
   - Si un inventaire est supprimé, tous ses items sont supprimés

2. **inventories → inventory_images** : 1:N (CASCADE DELETE)
   - Si un inventaire est supprimé, toutes ses images sont supprimées

3. **inventories → reports** : 1:N (CASCADE DELETE)
   - Si un inventaire est supprimé, tous ses rapports sont supprimés

4. **inventory_items → inventory_images** : 1:N (SET NULL)
   - Si un item est supprimé, les images liées gardent `item_id = NULL` mais restent liées à l'inventaire

### Contraintes d'Intégrité

- **Foreign Keys** : Toutes les relations sont protégées par des clés étrangères
- **Check Constraints** : 
  - `status` doit être dans la liste autorisée
  - `condition` doit être dans la liste autorisée
  - `category` doit être dans la liste autorisée
  - `image_type` doit être un type MIME valide
- **Indexes** : 
  - Index sur `inventory_id` dans toutes les tables enfants
  - Index sur `status` dans `inventories` pour filtrage rapide
  - Index sur `category` dans `inventory_items` pour statistiques

---

## Flux de Données Typique

### 1. Création d'Inventaire

```
1. INSERT INTO inventories (status = 'draft')
2. INSERT INTO inventory_images (pour chaque image uploadée)
3. UPDATE inventories SET status = 'processing'
```

### 2. Traitement IA

```
Pour chaque image:
  1. Appel OpenAI Vision API
  2. Pour chaque objet identifié:
     - INSERT INTO inventory_items
     - Recherche prix via DataForSEO
     - UPDATE inventory_items avec price_data et replacement_value
     - Optionnel: UPDATE inventory_images SET item_id
```

### 3. Finalisation

```
1. Calcul total: SUM(replacement_value) de tous les items
2. UPDATE inventories SET 
     total_estimated_value = total,
     recommended_insurance_amount = total,
     status = 'completed'
```

### 4. Génération Rapport

```
1. SELECT inventaire complet avec items et images
2. Génération PDF
3. INSERT INTO reports
```

---

## Champs JSONB Détailés

### `inventories.metadata`

Structure flexible pour stocker des informations additionnelles :

```json
{
  "userNotes": "Inventaire du salon et cuisine",
  "location": "Appartement 3B, 123 rue Main",
  "processingTime": 45.2,
  "imageCount": 8,
  "itemCount": 15,
  "categories": {
    "furniture": 5,
    "electronics": 3,
    "appliances": 2,
    "decor": 5
  }
}
```

### `inventory_items.ai_analysis`

Stocke la réponse complète de l'IA pour référence et debugging :

```json
{
  "description": "Canapé trois places en cuir marron, légèrement usé aux accoudoirs",
  "confidence": 0.85,
  "detectedFeatures": ["leather", "three-seater", "brown", "worn-arms"],
  "openaiResponse": {
    "model": "gpt-4-vision-preview",
    "usage": {
      "promptTokens": 500,
      "completionTokens": 200,
      "totalTokens": 700
    },
    "timestamp": "2024-01-15T10:02:00.000Z"
  }
}
```

### `inventory_items.price_data`

Stocke les résultats de recherche de prix pour traçabilité :

```json
{
  "source": "DataForSEO",
  "searchQuery": "La-Z-Boy canapé cuir prix Canada",
  "prices": [
    {
      "retailer": "Best Buy",
      "price": 1299.99,
      "currency": "CAD",
      "url": "https://www.bestbuy.ca/...",
      "inStock": true
    },
    {
      "retailer": "Amazon.ca",
      "price": 1249.99,
      "currency": "CAD",
      "url": "https://www.amazon.ca/...",
      "inStock": true
    }
  ],
  "averagePrice": 1274.99,
  "medianPrice": 1274.99,
  "currency": "CAD",
  "retrievedAt": "2024-01-15T10:02:00.000Z",
  "depreciationApplied": {
    "condition": "good",
    "age": 5,
    "depreciationRate": 0.05,
    "finalValue": 900.00
  }
}
```

---

## Index et Performance

### Index Créés

1. **inventories**
   - `idx_inventories_status` : Pour filtrer par statut
   - `idx_inventories_created_at` : Pour trier par date (DESC)

2. **inventory_items**
   - `idx_inventory_items_inventory_id` : Pour joindre avec inventories
   - `idx_inventory_items_category` : Pour statistiques par catégorie

3. **inventory_images**
   - `idx_inventory_images_inventory_id` : Pour joindre avec inventories
   - `idx_inventory_images_item_id` : Pour joindre avec items

4. **reports**
   - `idx_reports_inventory_id` : Pour joindre avec inventories

### Optimisations Futures

- **Partitioning** : Si volume important, partitionner `inventory_images` par date
- **Archiving** : Table séparée pour inventaires anciens (>1 an)
- **Full-text search** : Index GIN sur `item_name` et `brand` pour recherche textuelle

---

## Évolutions Futures

### Phase 2: Authentification

```sql
-- Ajouter table users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP
);

-- Lier inventories à users
ALTER TABLE inventories 
ADD COLUMN user_id UUID REFERENCES users(id);
```

### Phase 3: Migration Images S3

```sql
-- Ajouter colonnes S3
ALTER TABLE inventory_images
ADD COLUMN s3_url VARCHAR(500),
ADD COLUMN s3_key VARCHAR(255);

-- Migration progressive
-- 1. Uploader images existantes vers S3
-- 2. Mettre à jour s3_url et s3_key
-- 3. Optionnel: Supprimer image_data après migration
```

### Phase 4: Historique des Modifications

```sql
-- Table d'audit
CREATE TABLE inventory_items_history (
    id UUID PRIMARY KEY,
    item_id UUID REFERENCES inventory_items(id),
    changed_field VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    changed_at TIMESTAMP,
    changed_by UUID REFERENCES users(id)
);
```

---

## Considérations de Design

### Pourquoi PostgreSQL ?

- **JSONB** : Parfait pour stocker les réponses IA et données de prix flexibles
- **BYTEA** : Support natif pour stocker images (temporaire)
- **UUID** : Identifiants uniques distribuables
- **Performance** : Excellent pour requêtes complexes avec JOINs

### Pourquoi Stocker Images en Base (Temporaire) ?

- **Simplicité MVP** : Pas besoin de configurer S3 immédiatement
- **Transactions** : Cohérence garantie (image supprimée = inventaire supprimé)
- **Backup** : Tout dans un seul endroit

**Limitation** : PostgreSQL n'est pas optimal pour grandes quantités d'images. Migration S3 prévue en Phase 3.

### Pourquoi JSONB ?

- **Flexibilité** : Structure peut évoluer sans migrations
- **Requêtes** : PostgreSQL permet de requêter dans JSONB
- **Performance** : Index GIN possible sur JSONB
- **Traçabilité** : Garde toute la réponse IA pour debugging

---

## Requêtes Types

### Récupérer Inventaire Complet

```sql
SELECT 
  i.*,
  COALESCE(json_agg(DISTINCT it.*) FILTER (WHERE it.id IS NOT NULL), '[]') as items,
  COALESCE(json_agg(DISTINCT img.*) FILTER (WHERE img.id IS NOT NULL), '[]') as images
FROM inventories i
LEFT JOIN inventory_items it ON it.inventory_id = i.id
LEFT JOIN inventory_images img ON img.inventory_id = i.id
WHERE i.id = $1
GROUP BY i.id;
```

### Statistiques par Catégorie

```sql
SELECT 
  category,
  COUNT(*) as count,
  SUM(replacement_value) as total_value,
  AVG(replacement_value) as avg_value
FROM inventory_items
WHERE inventory_id = $1
GROUP BY category
ORDER BY total_value DESC;
```

### Inventaires en Cours

```sql
SELECT id, status, created_at
FROM inventories
WHERE status IN ('draft', 'processing')
ORDER BY created_at ASC;
```

---

## Résumé

Cette base de données est conçue pour être :
- **Simple** : 4 tables principales, relations claires
- **Flexible** : JSONB pour données variables
- **Performante** : Index sur toutes les clés étrangères
- **Évolutive** : Prête pour authentification et S3
- **Traçable** : Garde toutes les données IA et prix pour référence
