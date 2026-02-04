import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDoorOpen, faVault, faImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../services/api';

interface LocationCardProps {
  location: Location;
  onDelete?: (id: string) => void;
}

export default function LocationCard({ location, onDelete }: LocationCardProps) {
  const roomCount = location.rooms?.length ?? 0;
  const safeCount = location.safes?.length ?? 0;
  const imageCount =
    (location.rooms?.reduce((s, r) => s + (r._count?.images ?? 0), 0) ?? 0) +
    (location.safes?.reduce((s, sf) => s + (sf._count?.images ?? 0), 0) ?? 0);

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
      <div className="card-body">
        <h2 className="card-title text-xl">
          <FontAwesomeIcon icon={faHome} className="text-primary mr-2" />
          {location.name}
        </h2>
        {location.address && (
          <p className="text-sm text-base-content/70 truncate" title={location.address}>
            {location.address}
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
          <span>
            <FontAwesomeIcon icon={faDoorOpen} className="mr-1" />
            {roomCount} pièce{roomCount !== 1 ? 's' : ''}
          </span>
          <span>
            <FontAwesomeIcon icon={faVault} className="mr-1" />
            {safeCount} coffre{safeCount !== 1 ? 's' : ''}
          </span>
          <span>
            <FontAwesomeIcon icon={faImage} className="mr-1" />
            {imageCount} photo{imageCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-actions justify-end mt-4">
          <a href={`/location/${location.id}`} className="btn btn-sm btn-primary">
            <FontAwesomeIcon icon={faDoorOpen} className="mr-2" />
            Voir
          </a>
          {onDelete && (
            <button
              type="button"
              className="btn btn-sm btn-error"
              onClick={() => onDelete(location.id)}
              title="Supprimer le lieu"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
