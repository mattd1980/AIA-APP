# Schéma de Base de Données - Application d'Inventaire IA

## Vue d'Ensemble

Base de données PostgreSQL avec 4 tables principales:
- `inventories` - Inventaires
- `inventory_items` - Items identifiés dans chaque inventaire
- `inventory_images` - Images uploadées
- `reports` - Rapports PDF générés

---

## Schéma SQL Complet

```sql
-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: inventories
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    total_estimated_value DECIMAL(10, 2) DEFAULT 0.00,
    recommended_insurance_amount DECIMAL(10, 2) DEFAULT 0.00,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT status_check CHECK (status IN ('draft', 'processing', 'completed', 'error'))
);

-- Index pour recherche par status
CREATE INDEX idx_inventories_status ON inventories(status);
CREATE INDEX idx_inventories_created_at ON inventories(created_at DESC);

-- Table: inventory_items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    condition VARCHAR(20) NOT NULL,
    estimated_age INTEGER,
    estimated_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    replacement_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ai_analysis JSONB DEFAULT '{}'::jsonb,
    price_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT condition_check CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
    CONSTRAINT category_check CHECK (category IN ('furniture', 'electronics', 'clothing', 'appliances', 'decor', 'other'))
);

-- Index pour recherche par inventaire
CREATE INDEX idx_inventory_items_inventory_id ON inventory_items(inventory_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);

-- Table: inventory_images
CREATE TABLE inventory_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
    item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
    image_data BYTEA NOT NULL,
    image_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    upload_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT image_type_check CHECK (image_type IN ('image/jpeg', 'image/png', 'image/webp'))
);

-- Index pour recherche par inventaire
CREATE INDEX idx_inventory_images_inventory_id ON inventory_images(inventory_id);
CREATE INDEX idx_inventory_images_item_id ON inventory_images(item_id);

-- Table: reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
    report_type VARCHAR(20) NOT NULL DEFAULT 'pdf',
    report_data BYTEA NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT report_type_check CHECK (report_type IN ('pdf', 'json', 'csv'))
);

-- Index pour recherche par inventaire
CREATE INDEX idx_reports_inventory_id ON reports(inventory_id);

-- Trigger pour updated_at automatique
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventories_updated_at BEFORE UPDATE ON inventories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Schéma Prisma (Alternative)

Si vous utilisez Prisma ORM, voici le schéma équivalent:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum InventoryStatus {
  draft
  processing
  completed
  error
}

enum ItemCategory {
  furniture
  electronics
  clothing
  appliances
  decor
  other
}

enum ItemCondition {
  new
  excellent
  good
  fair
  poor
}

enum ReportType {
  pdf
  json
  csv
}

model Inventory {
  id                          String    @id @default(uuid())
  status                      InventoryStatus @default(draft)
  totalEstimatedValue         Decimal   @default(0) @db.Decimal(10, 2)
  recommendedInsuranceAmount  Decimal   @default(0) @db.Decimal(10, 2)
  metadata                    Json      @default("{}")
  createdAt                   DateTime  @default(now())
  updatedAt                   DateTime  @updatedAt
  
  items                       InventoryItem[]
  images                      InventoryImage[]
  reports                     Report[]
  
  @@index([status])
  @@index([createdAt(sort: Desc)])
}

model InventoryItem {
  id                String        @id @default(uuid())
  inventoryId       String
  category          ItemCategory
  itemName          String        @db.VarChar(255)
  brand             String?       @db.VarChar(100)
  model             String?       @db.VarChar(100)
  condition         ItemCondition
  estimatedAge      Int?
  estimatedValue    Decimal       @default(0) @db.Decimal(10, 2)
  replacementValue  Decimal       @default(0) @db.Decimal(10, 2)
  aiAnalysis        Json          @default("{}")
  priceData         Json          @default("{}")
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  
  inventory         Inventory     @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  images            InventoryImage[]
  
  @@index([inventoryId])
  @@index([category])
}

model InventoryImage {
  id          String    @id @default(uuid())
  inventoryId String
  itemId      String?
  imageData   Bytes
  imageType   String    @db.VarChar(50)
  fileName    String    @db.VarChar(255)
  fileSize    Int
  uploadOrder Int       @default(0)
  createdAt   DateTime  @default(now())
  
  inventory   Inventory     @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  item        InventoryItem? @relation(fields: [itemId], references: [id], onDelete: SetNull)
  
  @@index([inventoryId])
  @@index([itemId])
}

model Report {
  id          String     @id @default(uuid())
  inventoryId String
  reportType  ReportType @default(pdf)
  reportData  Bytes
  generatedAt DateTime   @default(now())
  
  inventory   Inventory  @relation(fields: [inventoryId], references: [id], onDelete: Cascade)
  
  @@index([inventoryId])
}
```

---

## Structure des Champs JSONB

### `inventories.metadata`
```json
{
  "userNotes": "Inventaire du salon et cuisine",
  "location": "Appartement 3B",
  "processingTime": 45.2,
  "imageCount": 8,
  "itemCount": 15
}
```

### `inventory_items.ai_analysis`
```json
{
  "description": "Canapé trois places en cuir marron, légèrement usé aux accoudoirs",
  "confidence": 0.85,
  "detectedFeatures": ["leather", "three-seater", "brown"],
  "openaiResponse": {
    "model": "gpt-4-vision-preview",
    "usage": {
      "promptTokens": 500,
      "completionTokens": 200
    }
  }
}
```

### `inventory_items.price_data`
```json
{
  "source": "DataForSEO",
  "searchQuery": "La-Z-Boy canapé cuir prix",
  "prices": [
    {
      "retailer": "Best Buy",
      "price": 1299.99,
      "currency": "CAD",
      "url": "https://..."
    },
    {
      "retailer": "Amazon",
      "price": 1249.99,
      "currency": "CAD",
      "url": "https://..."
    }
  ],
  "averagePrice": 1274.99,
  "medianPrice": 1274.99,
  "currency": "CAD",
  "retrievedAt": "2024-01-15T10:02:00.000Z"
}
```

---

## Requêtes Utiles

### Récupérer un inventaire complet avec items et images
```sql
SELECT 
  i.*,
  json_agg(DISTINCT jsonb_build_object(
    'id', it.id,
    'category', it.category,
    'itemName', it.item_name,
    'brand', it.brand,
    'model', it.model,
    'condition', it.condition,
    'estimatedValue', it.estimated_value,
    'replacementValue', it.replacement_value
  )) FILTER (WHERE it.id IS NOT NULL) as items,
  json_agg(DISTINCT jsonb_build_object(
    'id', img.id,
    'fileName', img.file_name,
    'fileSize', img.file_size,
    'uploadOrder', img.upload_order
  )) FILTER (WHERE img.id IS NOT NULL) as images
FROM inventories i
LEFT JOIN inventory_items it ON it.inventory_id = i.id
LEFT JOIN inventory_images img ON img.inventory_id = i.id
WHERE i.id = $1
GROUP BY i.id;
```

### Calculer le total d'un inventaire
```sql
UPDATE inventories
SET 
  total_estimated_value = (
    SELECT COALESCE(SUM(replacement_value), 0)
    FROM inventory_items
    WHERE inventory_id = inventories.id
  ),
  recommended_insurance_amount = (
    SELECT COALESCE(SUM(replacement_value), 0)
    FROM inventory_items
    WHERE inventory_id = inventories.id
  )
WHERE id = $1;
```

### Statistiques par catégorie
```sql
SELECT 
  category,
  COUNT(*) as item_count,
  SUM(replacement_value) as total_value,
  AVG(replacement_value) as average_value
FROM inventory_items
WHERE inventory_id = $1
GROUP BY category
ORDER BY total_value DESC;
```

### Inventaires en cours de traitement
```sql
SELECT id, status, created_at
FROM inventories
WHERE status = 'processing'
ORDER BY created_at ASC;
```

---

## Migrations Futures

### Phase 2: Ajout d'utilisateurs
```sql
-- Table users (quand auth sera implémenté)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ajouter user_id à inventories
ALTER TABLE inventories 
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_inventories_user_id ON inventories(user_id);
```

### Phase 3: Migration images vers S3
```sql
-- Ajouter colonnes pour URLs S3
ALTER TABLE inventory_images
ADD COLUMN s3_url VARCHAR(500),
ADD COLUMN s3_key VARCHAR(255);

-- Migration progressive: garder image_data pour compatibilité
-- Une fois migration complète, supprimer image_data
```

---

## Maintenance

### Nettoyage des inventaires anciens
```sql
-- Supprimer inventaires de plus de 1 an (selon politique de rétention)
DELETE FROM inventories
WHERE created_at < NOW() - INTERVAL '1 year'
AND status = 'completed';
```

### Optimisation des images
```sql
-- Identifier images trop volumineuses (>5MB)
SELECT 
  id,
  file_name,
  file_size,
  pg_size_pretty(file_size::bigint) as size_pretty
FROM inventory_images
WHERE file_size > 5 * 1024 * 1024
ORDER BY file_size DESC;
```

### Statistiques de base de données
```sql
-- Taille totale de la base
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Taille par table
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
