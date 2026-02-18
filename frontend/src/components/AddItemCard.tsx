import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddItemCardProps {
  label: string;
  suggestions: readonly string[];
  getIcon?: (name: string) => IconDefinition;
  defaultIcon?: IconDefinition;
  adding: boolean;
  onAddFromSuggestion: (name: string) => Promise<void>;
  onAddCustom: (name: string) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddItemCard({
  label,
  suggestions,
  getIcon,
  defaultIcon,
  adding,
  onAddFromSuggestion,
  onAddCustom,
  open,
  onOpenChange,
}: AddItemCardProps) {
  const [customName, setCustomName] = useState('');

  const handleSuggestionClick = async (name: string) => {
    await onAddFromSuggestion(name);
    onOpenChange(false);
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    await onAddCustom(customName.trim());
    setCustomName('');
    onOpenChange(false);
  };

  if (!open) {
    return (
      <Card
        className="cursor-pointer border-2 border-dashed border-muted-foreground/30 transition-all hover:border-primary hover:shadow-md"
        onClick={() => onOpenChange(true)}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 p-5">
          <FontAwesomeIcon icon={faPlus} className="text-2xl text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full border-2 border-dashed border-primary/40">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">{label}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {suggestions.map((name) => (
            <Button
              key={name}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              disabled={adding}
              onClick={() => handleSuggestionClick(name)}
            >
              {getIcon && (
                <FontAwesomeIcon icon={getIcon(name)} className="text-xs" />
              )}
              {defaultIcon && !getIcon && (
                <FontAwesomeIcon icon={defaultIcon} className="text-xs" />
              )}
              {name}
            </Button>
          ))}
        </div>

        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <Input
            type="text"
            className="h-8 flex-1 text-sm"
            placeholder="Nom personnalise..."
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            className="h-8"
            disabled={adding || !customName.trim()}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-1" />
            Ajouter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
