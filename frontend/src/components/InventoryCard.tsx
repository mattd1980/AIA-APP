import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox, faTag, faFilePdf, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { Inventory } from '../services/api';

interface InventoryCardProps {
  inventory: Inventory;
  onDelete?: (id: string) => void;
}

export default function InventoryCard({ inventory, onDelete }: InventoryCardProps) {
  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'badge-success',
      processing: 'badge-primary',
      draft: 'badge-warning',
      error: 'badge-error',
    };
    return badges[status as keyof typeof badges] || 'badge-ghost';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'processing') {
      return <FontAwesomeIcon icon={faBox} className="animate-spin" />;
    }
    return <FontAwesomeIcon icon={faBox} />;
  };

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-xl">
            {getStatusIcon(inventory.status)}
            <span className="ml-2">Inventaire #{inventory.id.slice(0, 8)}</span>
          </h2>
          <span className={`badge ${getStatusBadge(inventory.status)}`}>
            {inventory.status}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faTag} className="text-secondary" />
            <span className="font-semibold text-lg">
              ${inventory.totalEstimatedValue.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faBox} className="text-accent" />
            <span>{inventory.itemCount || 0} items</span>
          </div>
        </div>
        <div className="card-actions justify-end mt-4">
          <a
            href={`/inventory/${inventory.id}`}
            className="btn btn-sm btn-primary"
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Voir
          </a>
          {inventory.status === 'completed' && (
            <a
              href={`/api/inventories/${inventory.id}/report`}
              className="btn btn-sm btn-secondary"
              download
            >
              <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
              PDF
            </a>
          )}
          {onDelete && (
            <button
              className="btn btn-sm btn-error"
              onClick={() => onDelete(inventory.id)}
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
