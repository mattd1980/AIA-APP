import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag, faDollarSign, faEdit, faSave, faTimes, faImage, faTrash } from '@fortawesome/free-solid-svg-icons';
import { inventoryApi } from '../services/api';
import type { InventoryItem } from '../services/api';
import ImageWithBoundingBox from './ImageWithBoundingBox';

interface EditableItemProps {
  item: InventoryItem;
  inventoryId: string;
  onUpdate: () => void;
}

const categories = [
  { value: 'furniture', label: 'Meubles' },
  { value: 'electronics', label: 'Électronique' },
  { value: 'clothing', label: 'Vêtements' },
  { value: 'appliances', label: 'Électroménagers' },
  { value: 'decor', label: 'Décoration' },
  { value: 'other', label: 'Autre' },
];

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
    } catch (error) {
      console.error('Error updating item:', error);
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
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Erreur lors de la suppression de l\'item');
      setDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="card bg-base-100 border-2 border-primary">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Modifier l'item</h3>
            <div className="flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faSave} className="mr-1" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={handleCancel}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">
                <span className="label-text">Nom de l'item</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">
                  <span className="label-text">Catégorie</span>
                </label>
                <select
                  className="select select-bordered w-full"
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

              <div>
                <label className="label">
                  <span className="label-text">État</span>
                </label>
                <select
                  className="select select-bordered w-full"
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

            <div>
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ajoutez des notes sur cet item (optionnel)"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">
                  <span className="label-text">Valeur estimée (CAD)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="label">
                  <span className="label-text">Valeur de remplacement (CAD)</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.replacementValue}
                  onChange={(e) => setFormData({ ...formData, replacementValue: e.target.value })}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 border border-base-300 hover:border-primary transition-colors">
      <div className="card-body p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="card-title text-lg mb-1">{item.itemName}</h3>
          </div>
          <div className="flex gap-2 items-center">
            <span
              className={`badge ${
                item.condition === 'excellent'
                  ? 'badge-success'
                  : item.condition === 'good'
                  ? 'badge-primary'
                  : item.condition === 'fair'
                  ? 'badge-warning'
                  : 'badge-error'
              }`}
            >
              {conditions.find((c) => c.value === item.condition)?.label || item.condition}
            </span>
          </div>
        </div>

        {/* Action buttons - always visible */}
        <div className="flex gap-2 mb-3">
          <button
            className="btn btn-sm btn-primary flex-1"
            onClick={() => setIsEditing(true)}
            disabled={deleting}
          >
            <FontAwesomeIcon icon={faEdit} className="mr-2" />
            Modifier
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={handleDelete}
            disabled={deleting}
            title="Supprimer"
          >
            {deleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </button>
        </div>

        {/* Display images associated with this item */}
        {item.images && item.images.length > 0 && (
          <div className="mt-3 mb-3">
            <p className="text-xs text-base-content/60 mb-2">
              <FontAwesomeIcon icon={faImage} className="mr-1" />
              Image(s) source:
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
                        className="w-20 h-20 object-cover rounded-lg border border-base-300 hover:border-primary transition-colors"
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
            <div className="max-w-4xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
              <button
                className="btn btn-sm btn-circle btn-ghost absolute top-4 right-4 text-white z-10"
                onClick={() => setSelectedImage(null)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
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
                  alt="Full size"
                  className="max-w-full max-h-[90vh] w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {item.aiAnalysis?.description && (
          <div className="mt-3 mb-2">
            <p className="text-xs text-base-content/50 italic break-words">
              {item.aiAnalysis.description}
            </p>
          </div>
        )}

        <div className="divider my-2"></div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-base-content/60">Valeur estimée</p>
            <p className="text-lg font-bold text-primary">
              <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
              {item.estimatedValue.toFixed(2)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-base-content/60">Remplacement</p>
            <p className="text-lg font-semibold text-secondary">
              <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
              {item.replacementValue.toFixed(2)}
            </p>
          </div>
        </div>

        {item.notes && (
          <div className="mt-2">
            <p className="text-xs text-base-content/60 font-semibold mb-1">Notes:</p>
            <p className="text-sm text-base-content/70 break-words whitespace-pre-wrap">
              {item.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
