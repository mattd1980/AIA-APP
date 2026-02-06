import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faDoorOpen,
  faVault,
  faPlus,
  faTrash,
  faImage,
  faPen,
  faCheck,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { locationsApi, roomsApi, safesApi } from '@/services/api';
import type { Location } from '@/services/api';
import { SUGGESTED_ROOMS, SUGGESTED_SAFES } from '@/constants/suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState('');
  const [newSafeName, setNewSafeName] = useState('');
  const [addingRoom, setAddingRoom] = useState(false);
  const [addingSafe, setAddingSafe] = useState(false);
  const [error, setError] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingRoomName, setEditingRoomName] = useState('');
  const [editingSafeId, setEditingSafeId] = useState<string | null>(null);
  const [editingSafeName, setEditingSafeName] = useState('');
  const [savingRoom, setSavingRoom] = useState(false);
  const [savingSafe, setSavingSafe] = useState(false);
  const [lastAddedRoomId, setLastAddedRoomId] = useState<string | null>(null);
  const [lastAddedSafeId, setLastAddedSafeId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const addedRoomRef = useRef<HTMLLIElement>(null);
  const addedSafeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (id) loadLocation();
  }, [id]);

  // Clear "just added" highlight after a few seconds
  useEffect(() => {
    if (!lastAddedRoomId && !lastAddedSafeId) return;
    const t = setTimeout(() => {
      setLastAddedRoomId(null);
      setLastAddedSafeId(null);
    }, 2500);
    return () => clearTimeout(t);
  }, [lastAddedRoomId, lastAddedSafeId]);

  // Scroll newly added room/safe into view
  useEffect(() => {
    if (lastAddedRoomId && addedRoomRef.current) {
      addedRoomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (lastAddedSafeId && addedSafeRef.current) {
      addedSafeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [lastAddedRoomId, lastAddedSafeId, location?.rooms, location?.safes]);

  const loadLocation = async (silent = false) => {
    if (!id) return;
    try {
      if (!silent) setLoading(true);
      const data = await locationsApi.getById(id);
      setLocation(data);
    } catch (err) {
      if (!silent) setLocation(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newRoomName.trim()) return;
    setError('');
    try {
      setAddingRoom(true);
      const room = await locationsApi.addRoom(id, newRoomName.trim());
      const name = newRoomName.trim();
      setNewRoomName('');
      setLastAddedRoomId(room.id);
      setSuccessMessage('Pièce ajoutée et enregistrée.');
      setLocation((prev) =>
        prev
          ? {
              ...prev,
              rooms: [...(prev.rooms ?? []), { id: room.id, name, _count: { images: 0 } }],
            }
          : prev
      );
      await loadLocation(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleAddSafe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newSafeName.trim()) return;
    setError('');
    try {
      setAddingSafe(true);
      const safe = await locationsApi.addSafe(id, newSafeName.trim());
      const name = newSafeName.trim();
      setNewSafeName('');
      setLastAddedSafeId(safe.id);
      setSuccessMessage('Coffre ajouté et enregistré.');
      setLocation((prev) =>
        prev
          ? {
              ...prev,
              safes: [...(prev.safes ?? []), { id: safe.id, name, _count: { images: 0 } }],
            }
          : prev
      );
      await loadLocation(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setAddingSafe(false);
    }
  };

  const handleAddRoomFromSuggestion = async (roomName: string) => {
    if (!id || !roomName) return;
    setError('');
    try {
      setAddingRoom(true);
      const room = await locationsApi.addRoom(id, roomName);
      setLastAddedRoomId(room.id);
      setSuccessMessage('Pièce ajoutée et enregistrée.');
      setLocation((prev) =>
        prev
          ? {
              ...prev,
              rooms: [...(prev.rooms ?? []), { id: room.id, name: roomName, _count: { images: 0 } }],
            }
          : prev
      );
      await loadLocation(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleAddSafeFromSuggestion = async (safeName: string) => {
    if (!id || !safeName) return;
    setError('');
    try {
      setAddingSafe(true);
      const safe = await locationsApi.addSafe(id, safeName);
      setLastAddedSafeId(safe.id);
      setSuccessMessage('Coffre ajouté et enregistré.');
      setLocation((prev) =>
        prev
          ? {
              ...prev,
              safes: [...(prev.safes ?? []), { id: safe.id, name: safeName, _count: { images: 0 } }],
            }
          : prev
      );
      await loadLocation(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setAddingSafe(false);
    }
  };

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Supprimer cette pièce et toutes ses photos ?')) return;
    try {
      await roomsApi.delete(roomId);
      loadLocation();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleDeleteSafe = async (safeId: string) => {
    if (!confirm('Supprimer ce coffre et toutes ses photos ?')) return;
    try {
      await safesApi.delete(safeId);
      loadLocation();
    } catch (err) {
      alert('Erreur lors de la suppression');
    }
  };

  const startEditRoom = (room: { id: string; name: string }) => {
    setEditingRoomId(room.id);
    setEditingRoomName(room.name);
  };
  const cancelEditRoom = () => {
    setEditingRoomId(null);
    setEditingRoomName('');
  };
  const handleSaveRoomName = async () => {
    if (!editingRoomId || !editingRoomName.trim()) return;
    setError('');
    try {
      setSavingRoom(true);
      await roomsApi.update(editingRoomId, editingRoomName.trim());
      cancelEditRoom();
      await loadLocation();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setSavingRoom(false);
    }
  };

  const startEditSafe = (safe: { id: string; name: string }) => {
    setEditingSafeId(safe.id);
    setEditingSafeName(safe.name);
  };
  const cancelEditSafe = () => {
    setEditingSafeId(null);
    setEditingSafeName('');
  };
  const handleSaveSafeName = async () => {
    if (!editingSafeId || !editingSafeName.trim()) return;
    setError('');
    try {
      setSavingSafe(true);
      await safesApi.update(editingSafeId, editingSafeName.trim());
      cancelEditSafe();
      await loadLocation();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur');
    } finally {
      setSavingSafe(false);
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

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>Lieu introuvable</AlertDescription>
        </Alert>
        <Button type="button" variant="ghost" className="mt-4" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </Button>
      </div>
    );
  }

  const rooms = location.rooms ?? [];
  const safes = location.safes ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <Button type="button" variant="ghost" className="mb-4" onClick={() => navigate('/')}>
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Retour
      </Button>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold">{location.name}</h1>
          {location.address && (
            <p className="text-muted-foreground">{location.address}</p>
          )}
        </CardContent>
      </Card>

      {successMessage && (
        <Alert className="mb-4 border-green-500/50 bg-green-50 text-green-900 dark:border-green-500/50 dark:bg-green-950 dark:text-green-100">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Pièces */}
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="mb-4 flex items-center text-xl">
            <FontAwesomeIcon icon={faDoorOpen} className="mr-2 text-primary" />
            Pièces
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label className="text-sm text-muted-foreground">Suggestions de pièces (assurance)</Label>
            <select
              className="max-w-xs"
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) handleAddRoomFromSuggestion(v);
                e.target.value = '';
              }}
              disabled={addingRoom}
            >
              <option value="">Choisir une pièce à ajouter…</option>
              {SUGGESTED_ROOMS.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={handleAddRoom} className="mb-4 flex gap-2">
            <Input
              type="text"
              className="flex-1"
              placeholder="Ou saisir un nom personnalisé (ex : Salon, Cuisine)"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <Button type="submit" disabled={addingRoom || !newRoomName.trim()}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter
            </Button>
          </form>
          {rooms.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune pièce. Ajoutez-en une ci-dessus.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  ref={room.id === lastAddedRoomId ? addedRoomRef : undefined}
                  className={`flex items-center justify-between rounded-lg p-3 transition-all duration-300 ${
                    room.id === lastAddedRoomId
                      ? 'ring-2 ring-green-500 bg-green-500/15 shadow-md dark:bg-green-500/20'
                      : 'bg-muted/50'
                  }`}
                >
                  {editingRoomId === room.id ? (
                    <div className="mr-2 flex flex-1 items-center gap-2">
                      <Input
                        type="text"
                        className="h-9 flex-1"
                        value={editingRoomName}
                        onChange={(e) => setEditingRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRoomName();
                          if (e.key === 'Escape') cancelEditRoom();
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveRoomName}
                        disabled={savingRoom || !editingRoomName.trim()}
                        title="Enregistrer"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditRoom}
                        disabled={savingRoom}
                        title="Annuler"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/room/${room.id}`}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          {room.name}
                          <span className="text-sm text-muted-foreground">
                            ({room._count?.images ?? 0} photo{(room._count?.images ?? 0) !== 1 ? 's' : ''})
                          </span>
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditRoom(room)}
                          title="Modifier le nom"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/room/${room.id}`} title="Voir et gérer les photos">
                            <FontAwesomeIcon icon={faImage} />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteRoom(room.id)}
                          title="Supprimer la pièce"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Coffres */}
      <Card className="mb-6 shadow-md">
        <CardHeader>
          <CardTitle className="mb-4 flex items-center text-xl">
            <FontAwesomeIcon icon={faVault} className="mr-2 text-secondary" />
            Coffres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            <Label className="text-sm text-muted-foreground">Suggestions de coffres</Label>
            <select
              className="max-w-xs"
              value=""
              onChange={(e) => {
                const v = e.target.value;
                if (v) handleAddSafeFromSuggestion(v);
                e.target.value = '';
              }}
              disabled={addingSafe}
            >
              <option value="">Choisir un coffre à ajouter…</option>
              {SUGGESTED_SAFES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={handleAddSafe} className="mb-4 flex gap-2">
            <Input
              type="text"
              className="flex-1"
              placeholder="Ou saisir un nom personnalisé (ex : Coffre salon)"
              value={newSafeName}
              onChange={(e) => setNewSafeName(e.target.value)}
            />
            <Button type="submit" variant="secondary" disabled={addingSafe || !newSafeName.trim()}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter
            </Button>
          </form>
          {safes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun coffre. Ajoutez-en un ci-dessus.</p>
          ) : (
            <ul className="space-y-2">
              {safes.map((safe) => (
                <li
                  key={safe.id}
                  ref={safe.id === lastAddedSafeId ? addedSafeRef : undefined}
                  className={`flex items-center justify-between rounded-lg p-3 transition-all duration-300 ${
                    safe.id === lastAddedSafeId
                      ? 'ring-2 ring-green-500 bg-green-500/15 shadow-md dark:bg-green-500/20'
                      : 'bg-muted/50'
                  }`}
                >
                  {editingSafeId === safe.id ? (
                    <div className="mr-2 flex flex-1 items-center gap-2">
                      <Input
                        type="text"
                        className="h-9 flex-1"
                        value={editingSafeName}
                        onChange={(e) => setEditingSafeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSafeName();
                          if (e.key === 'Escape') cancelEditSafe();
                        }}
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleSaveSafeName}
                        disabled={savingSafe || !editingSafeName.trim()}
                        title="Enregistrer"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={cancelEditSafe}
                        disabled={savingSafe}
                        title="Annuler"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/safe/${safe.id}`}
                          className="flex items-center gap-2 font-medium hover:underline"
                        >
                          {safe.name}
                          <span className="text-sm text-muted-foreground">
                            ({safe._count?.images ?? 0} photo{(safe._count?.images ?? 0) !== 1 ? 's' : ''})
                          </span>
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => startEditSafe(safe)}
                          title="Modifier le nom"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={`/safe/${safe.id}`} title="Voir et gérer les photos">
                            <FontAwesomeIcon icon={faImage} />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteSafe(safe.id)}
                          title="Supprimer le coffre"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
