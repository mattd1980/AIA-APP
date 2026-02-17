import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faEdit, faSave, faTimes, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
import { inventoryApi } from '@/services/api';
import type { InventoryItem } from '@/services/api';
import ImageWithBoundingBox from '@/components/ImageWithBoundingBox';
import { CATEGORY_OPTIONS as categories } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';

interface EditableItemProps {
  item: InventoryItem;
  inventoryId: string;
  onUpdate: () => void;
}

const conditions = [
  { value: 'new', label: 'Neuf' },
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Bon' },
  { value: 'fair', label: 'Passable' },
  { value: 'poor', label: 'Mauvais' },
];

export default function EditableItem({ item, inventoryId, onUpdate }: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    itemName: item.itemName,
    category: item.category,
    condition: item.condition,
    notes: item.notes || '',
    estimatedValue: item.estimatedValue.toString(),
    replacementValue: item.replacementValue.toString(),
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      await inventoryApi.updateItem(inventoryId, item.id, {
        itemName: formData.itemName,
        category: formData.category,
        condition: formData.condition,
        notes: formData.notes || undefined,
        estimatedValue: parseFloat(formData.estimatedValue),
        replacementValue: parseFloat(formData.replacementValue),
      });
      setIsEditing(false);
      onUpdate();
    } catch {
      alert('Erreur lors de la mise à jour de l\'item');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      itemName: item.itemName,
      category: item.category,
      condition: item.condition,
      notes: item.notes || '',
      estimatedValue: item.estimatedValue.toString(),
      replacementValue: item.replacementValue.toString(),
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${item.itemName}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setDeleting(true);
      await inventoryApi.deleteItem(inventoryId, item.id);
      onUpdate();
    } catch {
      alert('Erreur lors de la suppression de l\'item');
      setDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <Card className="overflow-hidden border-2 border-primary">
        <CardContent className="overflow-hidden p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="min-w-0 flex-1 break-words font-bold">Modifier l'item</h3>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
                <FontAwesomeIcon icon={faTimes} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <Label title="Nom de l'item">Nom</Label>
              <Input
                type="text"
                className="w-full"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <select
                  className="w-full"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>État</Label>
                <select
                  className="w-full"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label title="Notes optionnelles sur cet item">Notes</Label>
              <Textarea
                className="min-h-[80px] w-full"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ajoutez des notes sur cet item (optionnel)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label title="Valeur estimée en dollars canadiens (CAD)">Valeur estimée</Label>
                <Input
                  type="number"
                  className="w-full"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  step="0.01"
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label title="Valeur de remplacement en dollars canadiens (CAD) - montant pour remplacer l'item">
                  Remplacement
                </Label>
                <Input
                  type="number"
                  className="w-full"
                  value={formData.replacementValue}
                  onChange={(e) => setFormData({ ...formData, replacementValue: e.target.value })}
                  step="0.01"
                  min={0}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-border transition-colors hover:border-primary">
      <CardContent className="overflow-hidden p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 break-words text-lg font-semibold">{item.itemName}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                item.condition === 'excellent'
                  ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                  : item.condition === 'good'
                  ? 'bg-primary/20 text-foreground'
                  : item.condition === 'fair'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'bg-destructive/20 text-destructive'
              }`}
            >
              {conditions.find((c) => c.value === item.condition)?.label || item.condition}
            </span>
          </div>
        </div>

        {/* Action buttons - always visible */}
        <div className="mb-3 flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => setIsEditing(true)} disabled={deleting}>
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Modifier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            title="Supprimer"
          >
            {deleting ? <Spinner className="size-4" /> : <FontAwesomeIcon icon={faTrash} />}
          </Button>
        </div>

        {/* Display images associated with this item */}
        {item.images && item.images.length > 0 && (
          <div className="mt-3 mb-3">
            <p className="mb-2 text-xs text-muted-foreground">
              <FontAwesomeIcon icon={faImage} className="mr-1" />
              Image(s) d'origine :
            </p>
            <div className="flex gap-2 flex-wrap">
              {item.images.map((image) => {
                const boundingBox = item.aiAnalysis?.boundingBox;
                return (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer flex-shrink-0"
                    onClick={() => setSelectedImage(image.id)}
                  >
                    {boundingBox ? (
                      <ImageWithBoundingBox
                        imageUrl={inventoryApi.getImageUrl(inventoryId, image.id)}
                        boundingBox={boundingBox}
                        itemName={item.itemName}
                        className="w-20 h-20"
                      />
                    ) : (
                      <img
                        src={inventoryApi.getImageUrl(inventoryId, image.id)}
                        alt={image.fileName}
                        className="h-20 w-20 rounded-lg border border-border object-cover transition-colors hover:border-primary"
                        title={image.fileName}
                      />
                    )}
                    {!boundingBox && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-h-[90vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
                onClick={() => setSelectedImage(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </Button>
              {item.aiAnalysis?.boundingBox ? (
                <ImageWithBoundingBox
                  imageUrl={inventoryApi.getImageUrl(inventoryId, selectedImage)}
                  boundingBox={item.aiAnalysis.boundingBox}
                  itemName={item.itemName}
                  className="max-w-full max-h-[90vh] w-full"
                />
              ) : (
                <img
                  src={inventoryApi.getImageUrl(inventoryId, selectedImage)}
                  alt="Pleine grandeur"
                  className="max-w-full max-h-[90vh] w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {item.aiAnalysis?.description && (
          <div className="mb-2 mt-3">
            <p className="break-words text-xs italic text-muted-foreground">
              {item.aiAnalysis.description}
            </p>
          </div>
        )}

        <div className="my-2 h-px bg-border" />

        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground" title="Valeur estimée en dollars canadiens (CAD)">
              Valeur estimée
            </p>
            <p className="text-lg font-bold text-primary break-words">
              <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
              {item.estimatedValue.toFixed(2)}
            </p>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs text-muted-foreground" title="Valeur de remplacement en dollars canadiens (CAD) - montant pour remplacer l'item">
              Remplacement
            </p>
            <p className="text-lg font-semibold text-secondary break-words">
              <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
              {item.replacementValue.toFixed(2)}
            </p>
          </div>
        </div>

        {item.notes && (
          <div className="mt-2">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Notes:</p>
            <p className="break-words whitespace-pre-wrap text-sm text-muted-foreground">
              {item.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
