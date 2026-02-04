import { Router } from 'express';
import { locationService } from '../services/location.service';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const categoryLabels: Record<string, string> = {
  furniture: 'Meubles',
  electronics: 'Électronique',
  clothing: 'Vêtements',
  appliances: 'Électroménagers',
  decor: 'Décoration',
  jewelry: 'Bijoux',
  art: 'Art',
  collectibles: 'Collections',
  sports_equipment: 'Équipement sportif',
  other: 'Autre',
};
const conditionLabels: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent',
  good: 'Bon',
  fair: 'Passable',
  poor: 'Mauvais',
};

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

// GET /api/export/inventory-csv — CSV for insurer (addresses, rooms, tags)
router.get('/inventory-csv', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user!.id;
    const locations = await locationService.getExportData(userId);

    const headers = [
      'Lieu',
      'Adresse',
      'Type',
      'Nom pièce/coffre',
      'Catégorie',
      'Objet',
      'Marque',
      'Modèle',
      'État',
      'Valeur estimée (€)',
      'Valeur remplacement (€)',
      'Notes',
    ];
    const rows: string[][] = [headers.map(escapeCsvCell)];

    for (const loc of locations) {
      const lieu = loc.name;
      const adresse = loc.address ?? '';

      for (const room of loc.rooms) {
        const type = 'Pièce';
        const nom = room.name;
        if (room.items.length === 0) {
          rows.push([lieu, adresse, type, nom, '', '', '', '', '', '', '', ''].map(escapeCsvCell));
        } else {
          for (const item of room.items) {
            rows.push([
              lieu,
              adresse,
              type,
              nom,
              categoryLabels[item.category] ?? item.category,
              item.itemName,
              item.brand ?? '',
              item.model ?? '',
              conditionLabels[item.condition] ?? item.condition,
              Number(item.estimatedValue).toString(),
              Number(item.replacementValue).toString(),
              item.notes ?? '',
            ].map(escapeCsvCell));
          }
        }
      }

      for (const safe of loc.safes) {
        const type = 'Coffre';
        const nom = safe.name;
        if (safe.items.length === 0) {
          rows.push([lieu, adresse, type, nom, '', '', '', '', '', '', '', ''].map(escapeCsvCell));
        } else {
          for (const item of safe.items) {
            rows.push([
              lieu,
              adresse,
              type,
              nom,
              categoryLabels[item.category] ?? item.category,
              item.itemName,
              item.brand ?? '',
              item.model ?? '',
              conditionLabels[item.condition] ?? item.condition,
              Number(item.estimatedValue).toString(),
              Number(item.replacementValue).toString(),
              item.notes ?? '',
            ].map(escapeCsvCell));
          }
        }
      }
    }

    const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
    const filename = `inventaire-assurance-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de l\'export' });
  }
});

export default router;
