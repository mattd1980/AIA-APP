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
import { safesApi } from '@/services/api';
import type { Safe, SafeDetectedItem } from '@/services/api';
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

export default function SafeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [safe, setSafe] = useState<Safe | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [editingSafeName, setEditingSafeName] = useState(false);
  const [safeNameInput, setSafeNameInput] = useState('');
  const [savingSafeName, setSavingSafeName] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemEditForm, setItemEditForm] = useState<Partial<SafeDetectedItem>>({});
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  const loadSafe = async (silent = false) => {
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      const data = await safesApi.getById(id);
      setSafe(data);
    } catch (err) {
      setSafe(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadSafe();
  }, [id]);

  useEffect(() => {
    if (!safe || safe.analysisStatus !== 'processing') return;
    const t = setInterval(() => loadSafe(true), 2500);
    return () => clearInterval(t);
  }, [safe?.analysisStatus, id]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const uploadSafeImages = async (files: File[]) => {
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
      await safesApi.addImages(id, accepted);
      loadSafe();
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
        await safesApi.addImages(id, acceptedFiles);
        loadSafe();
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
      uploadSafeImages(Array.from(files));
    }
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };
  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      uploadSafeImages(Array.from(files));
    }
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!id || !confirm('Supprimer cette photo ?')) return;
    try {
      setDeletingId(imageId);
      await safesApi.deleteImage(id, imageId);
      loadSafe();
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnalyze = async () => {
    if (!id || safe?.images.length === 0) return;
    try {
      setAnalyzing(true);
      await safesApi.analyze(id);
      await loadSafe(true);
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
      await safesApi.addItem(id, {
        itemName: obj.name,
        category: obj.category,
        condition: 'good',
      });
      await loadSafe(true);
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
      await safesApi.deleteItem(id, itemId);
      await loadSafe(true);
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingItemId(null);
    }
  };

  const startEditSafeName = () => {
    setSafeNameInput(safe?.name ?? '');
    setEditingSafeName(true);
  };
  const cancelEditSafeName = () => {
    setEditingSafeName(false);
    setSafeNameInput('');
  };
  const handleSaveSafeName = async () => {
    if (!id || !safeNameInput.trim()) return;
    try {
      setSavingSafeName(true);
      await safesApi.update(id, safeNameInput.trim());
      setSafe((s) => (s ? { ...s, name: safeNameInput.trim() } : s));
      cancelEditSafeName();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setSavingSafeName(false);
    }
  };

  const startEditItem = (item: SafeDetectedItem) => {
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
      await safesApi.updateItem(id, editingItemId, {
        itemName: itemEditForm.itemName.trim(),
        category: itemEditForm.category,
        condition: itemEditForm.condition,
        estimatedValue: itemEditForm.estimatedValue,
        replacementValue: itemEditForm.replacementValue,
        notes: itemEditForm.notes ?? undefined,
      });
      await loadSafe(true);
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

  if (!safe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Coffre introuvable</AlertDescription>
        </Alert>
        <Button type="button" variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const locationId = safe.location?.id ?? (safe as any).locationId;
  const images = safe.images ?? [];

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
          <div className="flex flex-wrap items-center gap-2">
            {editingSafeName ? (
              <>
                <Input
                  type="text"
                  className="min-w-[200px] flex-1"
                  value={safeNameInput}
                  onChange={(e) => setSafeNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveSafeName();
                    if (e.key === 'Escape') cancelEditSafeName();
                  }}
                  autoFocus
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleSaveSafeName}
                  disabled={savingSafeName || !safeNameInput.trim()}
                  title="Enregistrer"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={cancelEditSafeName}
                  disabled={savingSafeName}
                  title="Annuler"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">{safe.name}</h1>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={startEditSafeName}
                  title="Modifier le nom du coffre"
                >
                  <FontAwesomeIcon icon={faPen} />
                </Button>
              </>
            )}
          </div>
          <p className="text-muted-foreground">
            {safe.location?.name && `Lieu : ${safe.location.name}`}
          </p>
          {images.length > 0 && (
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleAnalyze}
                disabled={analyzing || safe.analysisStatus === 'processing'}
              >
                {safe.analysisStatus === 'processing' ? (
                  <>
                    <Spinner className="mr-2 size-4" data-icon="inline-start" />
                    Analyse en cours…
                    {safe.analysisMetadata?.totalImages != null && (
                      <span className="ml-2 opacity-80">
                        ({safe.analysisMetadata.processedImages ?? 0}/{safe.analysisMetadata.totalImages} photo(s))
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

      {safe.analysisStatus === 'error' && (
        <Alert className="mb-4 border-amber-500/50 bg-amber-50 text-amber-900 dark:border-amber-500/50 dark:bg-amber-950 dark:text-amber-100">
          <AlertDescription>
            {safe.analysisMetadata?.errors?.length
              ? `Analyse terminée avec des erreurs : ${safe.analysisMetadata.errors.join(' ; ')}`
              : (safe.analysisMetadata as any)?.error ?? 'L\'analyse a échoué.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Mobile : Prendre une photo / Galerie (iOS & Android) */}
      {isMobile && (
        <div className="mb-4 flex gap-4">
          <Button
            type="button"
            variant="secondary"
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
            variant="outline"
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
        className="mb-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-secondary/30 bg-muted/50 transition-colors hover:border-secondary/50"
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center p-6">
          <FontAwesomeIcon icon={faUpload} className="mb-2 text-4xl text-secondary" />
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
                const itemsInImage = (safe.items ?? []).filter(
                  (item: SafeDetectedItem) =>
                    (item.safeImageId ?? (item.aiAnalysis as any)?.sourceImageId) === img.id && item.aiAnalysis?.boundingBox
                );
                const boxes = itemsInImage.map((item: SafeDetectedItem) => ({
                  boundingBox: item.aiAnalysis!.boundingBox!,
                  itemName: item.itemName,
                }));
                return (
                  <div key={img.id} className="group relative">
                    {boxes.length > 0 ? (
                      <ImageWithBoundingBoxes
                        imageUrl={safesApi.getImageUrl(id!, img.id)}
                        boxes={boxes}
                        className="h-32 w-full"
                      />
                    ) : (
                      <img
                        src={safesApi.getImageUrl(id!, img.id)}
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

      {/* Objets détectés / inventaire */}
      {safe.items && safe.items.length > 0 && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle className="mb-4 flex items-center">
              <FontAwesomeIcon icon={faBox} className="mr-2" />
              Objets / inventaire ({safe.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {safe.items.map((item: SafeDetectedItem) => {
                const sourceImageId = item.safeImageId ?? (item.aiAnalysis as any)?.sourceImageId;
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
                              variant="secondary"
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
                                  imageUrl={safesApi.getImageUrl(id!, sourceImageId)}
                                  boundingBox={item.aiAnalysis!.boundingBox!}
                                  itemName={item.itemName}
                                  className="w-full h-full"
                                />
                              ) : (
                                <img
                                  src={safesApi.getImageUrl(id!, sourceImageId)}
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
