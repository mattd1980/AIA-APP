import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faTag, faFilePdf, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Inventory } from '../services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InventoryCardProps {
  inventory: Inventory;
  onDelete?: (id: string) => void;
}

export default function InventoryCard({ inventory, onDelete }: InventoryCardProps) {
  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      processing: 'bg-primary/20 text-foreground',
      draft: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      error: 'bg-destructive/20 text-destructive',
    };
    return badges[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'processing') {
      return <FontAwesomeIcon icon={faBox} className="animate-spin" />;
    }
    return <FontAwesomeIcon icon={faBox} />;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: 'Brouillon',
      processing: 'En cours',
      completed: 'Termine',
      error: 'Erreur',
    };
    return labels[status] ?? status;
  };

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center text-xl font-semibold">
            {getStatusIcon(inventory.status)}
            <span className="ml-2">{inventory.name || `Inventaire #${inventory.id.slice(0, 8)}`}</span>
          </h2>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(inventory.status)}`}>
            {getStatusLabel(inventory.status)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTag} className="text-secondary" />
            <span className="text-lg font-semibold">
              ${inventory.totalEstimatedValue.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <FontAwesomeIcon icon={faBox} />
            <span>{inventory.itemCount || 0} objet{(inventory.itemCount ?? 0) !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <a href={`/inventory/${inventory.id}`}>
            <Button size="sm">
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Voir
            </Button>
          </a>
          {inventory.status === 'completed' && (
            <a
              href={`/api/inventories/${inventory.id}/report`}
              download
            >
              <Button size="sm" variant="secondary">
                <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                PDF
              </Button>
            </a>
          )}
          {onDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(inventory.id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
