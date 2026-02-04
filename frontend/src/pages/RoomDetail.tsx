import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUpload,
  faImage,
  faTrash,
  faMagic,
  faBox,
  faPen,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import ImageWithBoundingBoxes from '../components/ImageWithBoundingBoxes';
import ImageWithBoundingBox from '../components/ImageWithBoundingBox';
import { roomsApi } from '../services/api';
import type { Room, RoomDetectedItem } from '../services/api';
import { SUGGESTED_OBJECTS } from '../constants/suggestions';

import { CATEGORY_LABELS as categoryLabels } from '../constants/categories';
const conditionLabels: Record<string, string> = {
  new: 'Neuf',
  excellent: 'Excellent',
  good: 'Bon',
  fair: 'Passable',
  poor: 'Mauvais',
};

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState(false);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [savingRoomName, setSavingRoomName] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemEditForm, setItemEditForm] = useState<Partial<RoomDetectedItem>>({});
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  const loadRoom = async (silent = false) => {
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      const data = await roomsApi.getById(id);
      setRoom(data);
    } catch (err) {
      setRoom(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadRoom();
  }, [id]);

  useEffect(() => {
    if (!room || room.analysisStatus !== 'processing') return;
    const t = setInterval(() => loadRoom(true), 2500);
    return () => clearInterval(t);
  }, [room?.analysisStatus, id]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024,
    onDrop: async (acceptedFiles) => {
      if (!id || acceptedFiles.length === 0) return;
      try {
        setUploading(true);
        await roomsApi.addImages(id, acceptedFiles);
        loadRoom();
      } catch (err: any) {
        alert(err.response?.data?.error || 'Erreur lors de l\'ajout des photos');
      } finally {
        setUploading(false);
      }
    },
    noClick: false,
  });

  const handleDeleteImage = async (imageId: string) => {
    if (!id || !confirm('Supprimer cette photo ?')) return;
    try {
      setDeletingId(imageId);
      await roomsApi.deleteImage(id, imageId);
      loadRoom();
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!id || room?.images.length === 0) return;
    try {
      setAnalyzing(true);
      await roomsApi.analyze(id);
      await loadRoom(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors du lancement de l\'analyse');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddSuggestedObject = async (obj: { name: string; category: string }) => {
    if (!id) return;
    try {
      setAddingItem(true);
      await roomsApi.addItem(id, {
        itemName: obj.name,
        category: obj.category,
        condition: 'good',
      });
      await loadRoom(true);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout');
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!id || !confirm('Supprimer cet objet de la liste ?')) return;
    try {
      setDeletingItemId(itemId);
      await roomsApi.deleteItem(id, itemId);
      await loadRoom(true);
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingItemId(null);
    }
  };

  const startEditRoomName = () => {
    setRoomNameInput(room?.name ?? '');
    setEditingRoomName(true);
  };
  const cancelEditRoomName = () => {
    setEditingRoomName(false);
    setRoomNameInput('');
  };
  const handleSaveRoomName = async () => {
    if (!id || !roomNameInput.trim()) return;
    try {
      setSavingRoomName(true);
      await roomsApi.update(id, roomNameInput.trim());
      setRoom((r) => (r ? { ...r, name: roomNameInput.trim() } : r));
      cancelEditRoomName();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setSavingRoomName(false);
    }
  };

  const startEditItem = (item: RoomDetectedItem) => {
    setEditingItemId(item.id);
    setItemEditForm({
      itemName: item.itemName,
      category: item.category,
      condition: item.condition,
      estimatedValue: item.estimatedValue,
      replacementValue: item.replacementValue,
      notes: item.notes ?? '',
    });
  };
  const cancelEditItem = () => {
    setEditingItemId(null);
    setItemEditForm({});
  };
  const handleSaveItem = async () => {
    if (!id || !editingItemId || !itemEditForm.itemName?.trim() || !itemEditForm.category || !itemEditForm.condition) return;
    try {
      setSavingItemId(editingItemId);
      await roomsApi.updateItem(id, editingItemId, {
        itemName: itemEditForm.itemName.trim(),
        category: itemEditForm.category,
        condition: itemEditForm.condition,
        estimatedValue: itemEditForm.estimatedValue,
        replacementValue: itemEditForm.replacementValue,
        notes: itemEditForm.notes ?? undefined,
      });
      await loadRoom(true);
      cancelEditItem();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setSavingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">Pièce introuvable</div>
        <button type="button" className="btn btn-ghost mt-4" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </button>
      </div>
    );
  }

  const locationId = room.location?.id ?? (room as any).locationId;
  const images = room.images ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        type="button"
        className="btn btn-ghost mb-4"
        onClick={() => navigate(locationId ? `/location/${locationId}` : '/')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Retour
      </button>

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-center gap-2 flex-wrap">
            {editingRoomName ? (
              <>
                <input
                  type="text"
                  className="input input-bordered flex-1 min-w-[200px]"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRoomName();
                    if (e.key === 'Escape') cancelEditRoomName();
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveRoomName}
                  disabled={savingRoomName || !roomNameInput.trim()}
                  title="Enregistrer"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={cancelEditRoomName}
                  disabled={savingRoomName}
                  title="Annuler"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{room.name}</h1>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={startEditRoomName}
                  title="Modifier le nom de la pièce"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              </>
            )}
          </div>
          <p className="text-base-content/70">
            {room.location?.name && `Lieu : ${room.location.name}`}
          </p>
          {images.length > 0 && (
            <div className="mt-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={analyzing || room.analysisStatus === 'processing'}
              >
                {room.analysisStatus === 'processing' ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2" />
                    Analyse en cours…
                    {room.analysisMetadata?.totalImages != null && (
                      <span className="ml-2 opacity-80">
                        ({room.analysisMetadata.processedImages ?? 0}/{room.analysisMetadata.totalImages} photo(s))
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faMagic} className="mr-2" />
                    {analyzing ? 'Lancement…' : 'Lancer l\'analyse des objets'}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {room.analysisStatus === 'error' && (
        <div className="alert alert-warning mb-4">
          <span>
            {room.analysisMetadata?.errors?.length
              ? `Analyse terminée avec des erreurs : ${room.analysisMetadata.errors.join(' ; ')}`
              : (room.analysisMetadata as any)?.error ?? 'L\'analyse a échoué.'}
          </span>
        </div>
      )}

      {/* Ajouter des photos */}
      <div
        {...getRootProps()}
        className="card bg-base-200 border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors mb-6 cursor-pointer"
      >
        <input {...getInputProps()} />
        <div className="card-body items-center justify-center min-h-[180px]">
          <FontAwesomeIcon icon={faUpload} className="text-4xl text-primary mb-2" />
          <p className="text-center text-base-content/70">
            {isDragActive ? 'Déposez les images ici' : 'Glissez des photos ici ou cliquez pour sélectionner'}
          </p>
          {uploading && (
            <span className="loading loading-spinner loading-md mt-2" />
          )}
        </div>
      </div>

      {/* Liste des photos (avec rectangles de détection si analyse faite) */}
      {images.length > 0 && (
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Photos ({images.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => {
                const itemsInImage = (room.items ?? []).filter(
                  (item: RoomDetectedItem) =>
                    (item.roomImageId ?? (item.aiAnalysis as any)?.sourceImageId) === img.id && item.aiAnalysis?.boundingBox
                );
                const boxes = itemsInImage.map((item: RoomDetectedItem) => ({
                  boundingBox: item.aiAnalysis!.boundingBox!,
                  itemName: item.itemName,
                }));
                return (
                  <div key={img.id} className="relative group">
                    {boxes.length > 0 ? (
                      <ImageWithBoundingBoxes
                        imageUrl={roomsApi.getImageUrl(id!, img.id)}
                        boxes={boxes}
                        className="w-full h-32"
                      />
                    ) : (
                      <img
                        src={roomsApi.getImageUrl(id!, img.id)}
                        alt={img.fileName}
                        className="w-full h-32 object-cover rounded-lg border border-base-300"
                      />
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 btn btn-sm btn-error btn-circle shadow-md"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingId === img.id}
                      title="Supprimer la photo"
                    >
                      {deletingId === img.id ? (
                        <span className="loading loading-spinner loading-xs" />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                    <p className="text-xs text-center mt-1 truncate" title={img.fileName}>
                      {img.fileName}
                      {boxes.length > 0 && (
                        <span className="block text-primary">({boxes.length} objet{boxes.length !== 1 ? 's' : ''})</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Objets à considérer pour l'assurance (suggestions) */}
      <div className="card bg-base-100 shadow-md mt-6">
        <div className="card-body">
          <label className="label text-sm text-base-content/70">
            Objets à considérer pour l'assurance (suggestions)
          </label>
          <select
            className="select select-bordered w-full max-w-md"
            value=""
            onChange={(e) => {
              const v = e.target.value;
              if (v) {
                const idx = parseInt(v, 10);
                const obj = SUGGESTED_OBJECTS[idx];
                if (obj) handleAddSuggestedObject(obj);
                e.target.value = '';
              }
            }}
            disabled={addingItem}
          >
            <option value="">Choisir un objet à ajouter à l'inventaire…</option>
            {SUGGESTED_OBJECTS.map((obj, idx) => (
              <option key={`${obj.name}-${idx}`} value={idx}>
                {obj.name} ({categoryLabels[obj.category] ?? obj.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Objets détectés / inventaire */}
      {room.items && room.items.length > 0 && (
        <div className="card bg-base-100 shadow-md mt-6">
          <div className="card-body">
            <h2 className="card-title mb-4">
              <FontAwesomeIcon icon={faBox} className="mr-2" />
              Objets / inventaire ({room.items.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.items.map((item: RoomDetectedItem) => {
                const sourceImageId = item.roomImageId ?? (item.aiAnalysis as any)?.sourceImageId;
                const hasBox = item.aiAnalysis?.boundingBox;
                const isEditing = editingItemId === item.id;
                return (
                  <div key={item.id} className="card bg-base-200 border border-base-300 relative">
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-sm"
                            onClick={() => startEditItem(item)}
                            disabled={savingItemId !== null}
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-circle btn-sm text-error"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingItemId === item.id}
                            title="Supprimer"
                          >
                            {deletingItemId === item.id ? (
                              <span className="loading loading-spinner loading-xs" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </button>
                        </>
                      ) : null}
                    </div>
                    <div className="card-body p-4">
                      {isEditing ? (
                        <div className="space-y-2 pr-12">
                          <input
                            type="text"
                            className="input input-bordered input-sm w-full"
                            placeholder="Nom de l'objet"
                            value={itemEditForm.itemName ?? ''}
                            onChange={(e) => setItemEditForm((f) => ({ ...f, itemName: e.target.value }))}
                          />
                          <div className="flex gap-2 flex-wrap">
                            <select
                              className="select select-bordered select-sm"
                              value={itemEditForm.category ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, category: e.target.value }))}
                            >
                              {Object.entries(categoryLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                            <select
                              className="select select-bordered select-sm"
                              value={itemEditForm.condition ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, condition: e.target.value }))}
                            >
                              {Object.entries(conditionLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              className="input input-bordered input-sm w-24"
                              placeholder="Valeur"
                              value={itemEditForm.estimatedValue ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, estimatedValue: e.target.value ? Number(e.target.value) : undefined }))}
                            />
                            <input
                              type="number"
                              className="input input-bordered input-sm w-24"
                              placeholder="Remplacement"
                              value={itemEditForm.replacementValue ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, replacementValue: e.target.value ? Number(e.target.value) : undefined }))}
                            />
                          </div>
                          <textarea
                            className="textarea textarea-bordered textarea-sm w-full"
                            placeholder="Notes"
                            value={itemEditForm.notes ?? ''}
                            onChange={(e) => setItemEditForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={handleSaveItem}
                              disabled={savingItemId === item.id || !(itemEditForm.itemName?.trim() && itemEditForm.category && itemEditForm.condition)}
                            >
                              <FontAwesomeIcon icon={faCheck} className="mr-1" /> Enregistrer
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={cancelEditItem}
                              disabled={savingItemId !== null}
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          {sourceImageId && (
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-base-300">
                              {hasBox ? (
                                <ImageWithBoundingBox
                                  imageUrl={roomsApi.getImageUrl(id!, sourceImageId)}
                                  boundingBox={item.aiAnalysis!.boundingBox!}
                                  itemName={item.itemName}
                                  className="w-full h-full"
                                />
                              ) : (
                                <img
                                  src={roomsApi.getImageUrl(id!, sourceImageId)}
                                  alt={item.itemName}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          )}
                          <div className="min-w-0 flex-1 pr-12">
                            <h3 className="font-bold break-words">{item.itemName}</h3>
                            <p className="text-xs text-base-content/70">
                              {categoryLabels[item.category] ?? item.category} · {conditionLabels[item.condition] ?? item.condition}
                            </p>
                            {item.aiAnalysis?.description && (
                              <p className="text-sm text-base-content/80 mt-1 line-clamp-3">{item.aiAnalysis.description}</p>
                            )}
                            <div className="flex gap-2 mt-2 text-sm">
                              <span className="text-primary font-semibold">{Number(item.estimatedValue).toFixed(2)} $</span>
                              <span className="text-base-content/60">remplacement : {Number(item.replacementValue).toFixed(2)} $</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
