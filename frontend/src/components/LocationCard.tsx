import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faDoorOpen, faVault, faImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card className="overflow-hidden transition-shadow hover:shadow-xl">
      <CardContent className="p-6">
        <h2 className="mb-2 flex items-center text-xl font-semibold leading-none tracking-tight">
          <FontAwesomeIcon icon={faHome} className="mr-2 text-primary" />
          {location.name}
        </h2>
        {location.address && (
          <p className="truncate text-sm text-muted-foreground" title={location.address}>
            {location.address}
          </p>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
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
        <div className="mt-4 flex justify-end gap-2">
          <a href={`/location/${location.id}`}>
            <Button size="sm">
              <FontAwesomeIcon icon={faDoorOpen} className="mr-2" />
              Voir
            </Button>
          </a>
          {onDelete && (
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onDelete(location.id)}
              title="Supprimer le lieu"
            >
              Supprimer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
