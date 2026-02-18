import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash, faCheck, faTimes, faImage } from '@fortawesome/free-solid-svg-icons';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ContainerType } from '@/constants/container-config';
import { getContainerUIConfig } from '@/constants/container-config';

interface ContainerCardProps {
  containerType: ContainerType;
  container: { id: string; name: string; _count?: { images: number } };
  highlighted: boolean;
  editing: boolean;
  editName: string;
  saving: boolean;
  onEditNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ContainerCard({
  containerType,
  container,
  highlighted,
  editing,
  editName,
  saving,
  onEditNameChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  scrollRef,
}: ContainerCardProps) {
  const config = getContainerUIConfig(containerType);
  const navigate = useNavigate();
  const photoCount = container._count?.images ?? 0;
  const icon = config.getIcon(container.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <Card
      ref={scrollRef}
      className={`group relative cursor-pointer transition-all hover:shadow-lg ${
        highlighted
          ? 'animate-pulse ring-2 ring-green-500 shadow-md'
          : ''
      }`}
      onClick={() => {
        if (!editing) navigate(`${config.routePrefix}/${container.id}`);
      }}
    >
      {/* Action buttons — visible on hover */}
      {!editing && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
            title="Modifier le nom"
          >
            <FontAwesomeIcon icon={faPen} className="text-xs" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            title={config.cardDeleteTitle}
          >
            <FontAwesomeIcon icon={faTrash} className="text-xs" />
          </Button>
        </div>
      )}

      <CardContent className="flex flex-col items-center gap-2 p-5">
        <FontAwesomeIcon icon={icon} className={`text-3xl ${config.accentColor}`} />

        {editing ? (
          <div className="flex w-full items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={inputRef}
              type="text"
              className="h-8 flex-1 text-center text-sm"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
            />
            <Button
              type="button"
              size="sm"
              variant={config.buttonVariant}
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onSaveEdit(); }}
              disabled={saving || !editName.trim()}
              title="Enregistrer"
            >
              <FontAwesomeIcon icon={faCheck} className="text-xs" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={(e) => { e.stopPropagation(); onCancelEdit(); }}
              disabled={saving}
              title="Annuler"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </Button>
          </div>
        ) : (
          <>
            <span className="text-center text-sm font-semibold leading-tight">{container.name}</span>
            <span className="text-xs text-muted-foreground">
              <FontAwesomeIcon icon={faImage} className="mr-1" />
              {photoCount} photo{photoCount !== 1 ? 's' : ''}
            </span>
          </>
        )}
      </CardContent>
    </Card>
  );
}
