import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faUpload,
  faImage,
  faCamera,
  faTrash,
  faMagic,
  faBox,
  faPen,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import ImageWithBoundingBoxes from '@/components/ImageWithBoundingBoxes';
import ImageWithBoundingBox from '@/components/ImageWithBoundingBox';
import { roomsApi, visionModelsApi } from '@/services/api';
import type { Room, RoomDetectedItem, VisionModel } from '@/services/api';
import { SUGGESTED_OBJECTS } from '@/constants/suggestions';
import { CATEGORY_LABELS as categoryLabels } from '@/constants/categories';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
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
  const [visionModels, setVisionModels] = useState<VisionModel[]>([]);
  const [selectedVisionModel, setSelectedVisionModel] = useState<string>('gpt-5.2');
  const [selectedRunId, setSelectedRunId] = useState<string | 'manual' | 'all' | null>(null);

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
    visionModelsApi.getList().then((list) => {
      setVisionModels(list);
      if (list.length > 0 && !list.some((m) => m.id === selectedVisionModel)) {
        setSelectedVisionModel(list[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!room || room.analysisStatus !== 'processing') return;
    const t = setInterval(() => loadRoom(true), 2500);
    return () => clearInterval(t);
  }, [room?.analysisStatus, id]);

  // Default selected tab when room/analysisRuns load
  useEffect(() => {
    if (!room) return;
    const runs = room.analysisRuns ?? [];
    const manualItems = (room.items ?? []).filter((i: RoomDetectedItem) => !i.roomAnalysisRunId);
    if (selectedRunId === null && runs.length > 0) {
      setSelectedRunId(runs[0].id);
    } else if (selectedRunId === null && manualItems.length > 0 && runs.length === 0) {
      setSelectedRunId('manual');
    } else if (selectedRunId === null && (room.items?.length ?? 0) > 0) {
      setSelectedRunId('all');
    }
  }, [room?.id, room?.analysisRuns?.length, room?.items?.length]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Tabs: one per analysis run (model) + optional "Manual" tab for comparing results
  const analysisRuns = room?.analysisRuns ?? [];
  const manualItems = (room?.items ?? []).filter((i: RoomDetectedItem) => !i.roomAnalysisRunId);
  const modelLabel = (modelId: string) => visionModels.find((m) => m.id === modelId)?.label ?? modelId;
  const formatRunDate = (createdAt: string) =>
    new Date(createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  const tabs: { id: string; label: string; count: number }[] = [];
  analysisRuns.forEach((run) => {
    tabs.push({
      id: run.id,
      label: `${modelLabel(run.modelId)} – ${formatRunDate(run.createdAt)}`,
      count: run.items?.length ?? 0,
    });
  });
  if (manualItems.length > 0) {
    tabs.push({ id: 'manual', label: 'Ajoutés manuellement', count: manualItems.length });
  }
  if (tabs.length === 0 && (room?.items?.length ?? 0) > 0) {
    tabs.push({ id: 'all', label: 'Tous les objets', count: room!.items!.length });
  }
  const displayedItems: RoomDetectedItem[] =
    selectedRunId === 'manual'
      ? manualItems
      : selectedRunId === 'all' || !selectedRunId
        ? room?.items ?? []
        : analysisRuns.find((r) => r.id === selectedRunId)?.items ?? [];

  const uploadRoomImages = async (files: File[]) => {
    if (!id || files.length === 0) return;
    const maxSize = 10 * 1024 * 1024;
    const accepted = files.filter(
      (f) => f.size <= maxSize && (f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(f.name))
    );
    if (accepted.length === 0) {
      alert('Fichiers non valides ou trop volumineux (max 10 Mo).');
      return;
    }
    try {
      setUploading(true);
      await roomsApi.addImages(id, accepted);
      loadRoom();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors de l\'ajout des photos');
    } finally {
      setUploading(false);
    }
  };

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

  const handleCameraFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      uploadRoomImages(Array.from(files));
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      uploadRoomImages(Array.from(files));
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

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
      await roomsApi.analyze(id, selectedVisionModel);
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
          <Spinner className="size-8" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Pièce introuvable</AlertDescription>
        </Alert>
        <Button type="button" variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const locationId = room.location?.id ?? (room as any).locationId;
  const images = room.images ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        type="button"
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(locationId ? `/location/${locationId}` : '/')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Retour
      </Button>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 flex-wrap">
            {editingRoomName ? (
              <>
                <Input
                  type="text"
                  className="min-w-[200px] flex-1"
                  value={roomNameInput}
                  onChange={(e) => setRoomNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRoomName();
                    if (e.key === 'Escape') cancelEditRoomName();
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={handleSaveRoomName}
                  disabled={savingRoomName || !roomNameInput.trim()}
                  title="Enregistrer"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditRoomName}
                  disabled={savingRoomName}
                  title="Annuler"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{room.name}</h1>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={startEditRoomName}
                  title="Modifier le nom de la pièce"
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              </>
            )}
          </div>
          <p className="text-muted-foreground">
            {room.location?.name && `Lieu : ${room.location.name}`}
          </p>
          {images.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Modèle IA :</span>
                <select
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-2 ring-transparent focus:ring-2 focus:ring-ring"
                  value={selectedVisionModel}
                  onChange={(e) => setSelectedVisionModel(e.target.value)}
                  disabled={analyzing || room.analysisStatus === 'processing'}
                >
                  {visionModels.length === 0 ? (
                    <option value={selectedVisionModel}>—</option>
                  ) : (
                    visionModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.label}</option>
                    ))
                  )}
                </select>
              </label>
              <Button
                type="button"
                variant="default"
                onClick={handleAnalyze}
                disabled={analyzing || room.analysisStatus === 'processing'}
              >
                {room.analysisStatus === 'processing' ? (
                  <>
                    <Spinner className="mr-2 size-4" data-icon="inline-start" />
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
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {room.analysisStatus === 'error' && (
        <Alert className="mb-4 border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950 dark:text-amber-100">
          <AlertDescription>
            {room.analysisMetadata?.errors?.length
              ? `Analyse terminée avec des erreurs : ${room.analysisMetadata.errors.join(' ; ')}`
              : (room.analysisMetadata as any)?.error ?? 'L\'analyse a échoué.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile : Prendre une photo / Galerie (iOS & Android) */}
      {isMobile && (
        <div className="mb-4 flex gap-4">
          <Button
            type="button"
            variant="default"
            className="flex-1"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
          >
            <FontAwesomeIcon icon={faCamera} className="mr-2" />
            Prendre une photo
          </Button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraFileSelect}
            className="hidden"
            aria-hidden
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFileSelect}
            className="hidden"
            aria-hidden
          />
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => galleryInputRef.current?.click()}
            disabled={uploading}
          >
            <FontAwesomeIcon icon={faImage} className="mr-2" />
            Galerie
          </Button>
        </div>
      )}

      {/* Ajouter des photos */}
      <div
        {...getRootProps()}
        className="mb-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-muted/50 transition-colors hover:border-primary/50"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center p-6">
          <FontAwesomeIcon icon={faUpload} className="mb-2 text-4xl text-primary" />
          <p className="text-center text-muted-foreground">
            {isDragActive ? 'Déposez les images ici' : isMobile ? 'Ou glissez des photos ici' : 'Glissez des photos ici ou cliquez pour sélectionner'}
          </p>
          {uploading && <Spinner className="mt-2 size-6" />}
        </div>
      </div>

      {/* Liste des photos (avec rectangles de détection si analyse faite) */}
      {images.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="mb-4 flex items-center">
              <FontAwesomeIcon icon={faImage} className="mr-2" />
              Photos ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {images.map((img) => {
                const itemsInImage = displayedItems.filter(
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
                        className="h-32 w-full rounded-lg border border-border object-cover"
                      />
                    )}
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute right-2 top-2 size-8 shadow-md"
                      onClick={() => handleDeleteImage(img.id)}
                      disabled={deletingId === img.id}
                      title="Supprimer la photo"
                    >
                      {deletingId === img.id ? (
                        <Spinner className="size-4" />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </Button>
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
          </CardContent>
        </Card>
      )}

      {/* Objets à considérer pour l'assurance (suggestions) */}
      <Card className="mt-6 shadow-md">
        <CardContent className="p-6">
          <label className="mb-2 block text-sm text-muted-foreground">
            Objets à considérer pour l'assurance (suggestions)
          </label>
          <select
            className="max-w-md"
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
        </CardContent>
      </Card>

      {/* Objets détectés / inventaire – onglets par modèle pour comparer */}
      {(room?.items?.length ?? 0) > 0 && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <CardTitle className="flex items-center">
                <FontAwesomeIcon icon={faBox} className="mr-2" />
                Objets / inventaire
              </CardTitle>
              {tabs.length > 1 && (
                <div className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedRunId(tab.id)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedRunId === tab.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedItems.map((item: RoomDetectedItem) => {
                const sourceImageId = item.roomImageId ?? (item.aiAnalysis as any)?.sourceImageId;
                const hasBox = item.aiAnalysis?.boundingBox;
                const isEditing = editingItemId === item.id;
                return (
                  <Card key={item.id} className="relative border border-border bg-muted/50">
                    <div className="absolute right-2 top-2 z-10 flex gap-1">
                      {!isEditing ? (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => startEditItem(item)}
                            disabled={savingItemId !== null}
                            title="Modifier"
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingItemId === item.id}
                            title="Supprimer"
                          >
                            {deletingItemId === item.id ? (
                              <Spinner className="size-4" />
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </Button>
                        </>
                      ) : null}
                    </div>
                    <CardContent className="p-4">
                      {isEditing ? (
                        <div className="space-y-2 pr-12">
                          <Input
                            className="h-8 w-full"
                            placeholder="Nom de l'objet"
                            value={itemEditForm.itemName ?? ''}
                            onChange={(e) => setItemEditForm((f) => ({ ...f, itemName: e.target.value }))}
                          />
                          <div className="flex flex-wrap gap-2">
                            <select
                              className="h-8 min-w-0 flex-1"
                              value={itemEditForm.category ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, category: e.target.value }))}
                            >
                              {Object.entries(categoryLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                            <select
                              className="h-8 min-w-0 flex-1"
                              value={itemEditForm.condition ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, condition: e.target.value }))}
                            >
                              {Object.entries(conditionLabels).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              className="h-8 w-24"
                              placeholder="Valeur"
                              value={itemEditForm.estimatedValue ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, estimatedValue: e.target.value ? Number(e.target.value) : undefined }))}
                            />
                            <Input
                              type="number"
                              className="h-8 w-24"
                              placeholder="Remplacement"
                              value={itemEditForm.replacementValue ?? ''}
                              onChange={(e) => setItemEditForm((f) => ({ ...f, replacementValue: e.target.value ? Number(e.target.value) : undefined }))}
                            />
                          </div>
                          <Textarea
                            className="min-h-[60px] w-full resize-y text-sm"
                            placeholder="Notes"
                            value={itemEditForm.notes ?? ''}
                            onChange={(e) => setItemEditForm((f) => ({ ...f, notes: e.target.value }))}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={handleSaveItem}
                              disabled={savingItemId === item.id || !(itemEditForm.itemName?.trim() && itemEditForm.category && itemEditForm.condition)}
                            >
                              <FontAwesomeIcon icon={faCheck} className="mr-1" /> Enregistrer
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={cancelEditItem}
                              disabled={savingItemId !== null}
                            >
                              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          {sourceImageId && (
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border">
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
                            <p className="text-xs text-muted-foreground">
                              {categoryLabels[item.category] ?? item.category} · {conditionLabels[item.condition] ?? item.condition}
                            </p>
                            {item.aiAnalysis?.description && (
                              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.aiAnalysis.description}</p>
                            )}
                            <div className="mt-2 flex gap-2 text-sm">
                              <span className="font-semibold text-primary">{Number(item.estimatedValue).toFixed(2)} $</span>
                              <span className="text-muted-foreground">remplacement : {Number(item.replacementValue).toFixed(2)} $</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
