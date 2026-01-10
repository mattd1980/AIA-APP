# Documentation API - Application d'Inventaire IA

## Base URL
```
Production: https://your-app.railway.app
Development: http://localhost:3000
```

## Authentification
Pour l'instant: Aucune authentification requise (tous les endpoints sont admin).

---

## Endpoints

### Inventaires

#### Créer un nouvel inventaire avec images
```http
POST /api/inventories
Content-Type: multipart/form-data
```

**Body (FormData)**:
- `images`: File[] (un ou plusieurs fichiers image)

**Response 201**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "message": "Inventaire créé, traitement en cours"
}
```

**Response 400**:
```json
{
  "error": "Aucune image fournie"
}
```

**Response 413**:
```json
{
  "error": "Fichier trop volumineux. Maximum 10MB par image"
}
```

---

#### Récupérer un inventaire
```http
GET /api/inventories/:id
```

**Response 200**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "totalEstimatedValue": 15234.50,
  "recommendedInsuranceAmount": 15234.50,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:05:23.000Z",
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "category": "furniture",
      "itemName": "Canapé en cuir",
      "brand": "La-Z-Boy",
      "model": null,
      "condition": "good",
      "estimatedAge": 5,
      "estimatedValue": 1200.00,
      "replacementValue": 900.00,
      "aiAnalysis": {
        "description": "Canapé trois places en cuir marron",
        "confidence": 0.85
      },
      "priceData": {
        "source": "DataForSEO",
        "averagePrice": 1500.00,
        "currency": "CAD",
        "retrievedAt": "2024-01-15T10:02:00.000Z"
      }
    }
  ],
  "images": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "fileName": "living-room.jpg",
      "fileSize": 2456789,
      "uploadOrder": 1
    }
  ]
}
```

**Response 404**:
```json
{
  "error": "Inventaire non trouvé"
}
```

---

#### Lister tous les inventaires
```http
GET /api/inventories?page=1&limit=20
```

**Query Parameters**:
- `page` (optional, default: 1): Numéro de page
- `limit` (optional, default: 20): Nombre d'items par page
- `status` (optional): Filtrer par status (`draft`, `processing`, `completed`, `error`)

**Response 200**:
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "status": "completed",
      "totalEstimatedValue": 15234.50,
      "itemCount": 12,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

#### Supprimer un inventaire
```http
DELETE /api/inventories/:id
```

**Response 200**:
```json
{
  "message": "Inventaire supprimé avec succès"
}
```

**Response 404**:
```json
{
  "error": "Inventaire non trouvé"
}
```

---

### Items

#### Récupérer tous les items d'un inventaire
```http
GET /api/inventories/:id/items
```

**Response 200**:
```json
{
  "items": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "category": "furniture",
      "itemName": "Canapé en cuir",
      "brand": "La-Z-Boy",
      "model": null,
      "condition": "good",
      "estimatedAge": 5,
      "estimatedValue": 1200.00,
      "replacementValue": 900.00
    }
  ]
}
```

---

#### Modifier un item manuellement
```http
PATCH /api/inventories/:id/items/:itemId
Content-Type: application/json
```

**Body**:
```json
{
  "itemName": "Canapé en cuir La-Z-Boy",
  "brand": "La-Z-Boy",
  "model": "ReclinaRock",
  "condition": "excellent",
  "estimatedAge": 3,
  "estimatedValue": 1500.00
}
```

**Response 200**:
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "itemName": "Canapé en cuir La-Z-Boy",
  "brand": "La-Z-Boy",
  "model": "ReclinaRock",
  "condition": "excellent",
  "estimatedAge": 3,
  "estimatedValue": 1500.00,
  "replacementValue": 1350.00,
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

---

### Images

#### Récupérer une image
```http
GET /api/inventories/:id/images/:imageId
```

**Response 200**:
- Content-Type: `image/jpeg` ou `image/png`
- Body: Image binaire

**Response 404**:
```json
{
  "error": "Image non trouvée"
}
```

---

### Rapports

#### Générer un rapport PDF
```http
POST /api/inventories/:id/report?format=pdf
```

**Response 200**:
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="inventory-report-{id}.pdf"`
- Body: PDF binaire

**Response 404**:
```json
{
  "error": "Inventaire non trouvé"
}
```

**Response 400**:
```json
{
  "error": "L'inventaire doit être complété avant de générer un rapport"
}
```

---

#### Récupérer un rapport généré précédemment
```http
GET /api/inventories/:id/report/:reportId
```

**Response 200**:
- Content-Type: `application/pdf`
- Body: PDF binaire

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 404 | Ressource non trouvée |
| 413 | Fichier trop volumineux |
| 500 | Erreur serveur interne |
| 503 | Service temporairement indisponible |

---

## Rate Limiting

Pour l'instant: Aucune limite (à implémenter en Phase 2).

Recommandation future:
- 100 requêtes par minute par IP
- 10 uploads d'inventaire par heure par IP

---

## Formats de Données

### Catégories d'Items
- `furniture` - Meubles
- `electronics` - Électronique
- `clothing` - Vêtements
- `appliances` - Électroménagers
- `decor` - Décoration
- `other` - Autre

### Conditions
- `new` - Neuf
- `excellent` - Excellent
- `good` - Bon
- `fair` - Passable
- `poor` - Usé

### Status d'Inventaire
- `draft` - Brouillon
- `processing` - En traitement
- `completed` - Complété
- `error` - Erreur

---

## Exemples d'Utilisation

### JavaScript/TypeScript (Frontend)

```typescript
// Créer un inventaire
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/inventories', {
  method: 'POST',
  body: formData
});

const inventory = await response.json();
console.log('Inventaire créé:', inventory.id);

// Récupérer un inventaire
const inventoryResponse = await fetch(`/api/inventories/${inventory.id}`);
const inventoryData = await inventoryResponse.json();

// Générer un rapport
const reportResponse = await fetch(
  `/api/inventories/${inventory.id}/report?format=pdf`,
  { method: 'POST' }
);

const blob = await reportResponse.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `inventory-report-${inventory.id}.pdf`;
a.click();
```

### cURL

```bash
# Créer un inventaire
curl -X POST http://localhost:3000/api/inventories \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"

# Récupérer un inventaire
curl http://localhost:3000/api/inventories/{id}

# Générer un rapport
curl -X POST http://localhost:3000/api/inventories/{id}/report?format=pdf \
  --output report.pdf
```
