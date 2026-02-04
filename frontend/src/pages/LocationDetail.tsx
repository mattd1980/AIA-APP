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
import { locationsApi, roomsApi, safesApi } from '../services/api';
import type { Location } from '../services/api';
import { SUGGESTED_ROOMS, SUGGESTED_SAFES } from '../constants/suggestions';

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
          <span className="loading loading-spinner loading-lg" />
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">Lieu introuvable</div>
        <button type="button" className="btn btn-ghost mt-4" onClick={() => navigate('/')}>
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Retour
        </button>
      </div>
    );
  }

  const rooms = location.rooms ?? [];
  const safes = location.safes ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        type="button"
        className="btn btn-ghost mb-4"
        onClick={() => navigate('/')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Retour
      </button>

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <h1 className="text-3xl font-bold">{location.name}</h1>
          {location.address && (
            <p className="text-base-content/70">{location.address}</p>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="alert alert-success mb-4">
          <span>{successMessage}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Pièces */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">
            <FontAwesomeIcon icon={faDoorOpen} className="text-primary mr-2" />
            Pièces
          </h2>
          <div className="mb-4">
            <label className="label text-sm text-base-content/70">Suggestions de pièces (assurance)</label>
            <select
              className="select select-bordered w-full max-w-xs"
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
          <form onSubmit={handleAddRoom} className="flex gap-2 mb-4">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Ou saisir un nom personnalisé (ex : Salon, Cuisine)"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={addingRoom || !newRoomName.trim()}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter
            </button>
          </form>
          {rooms.length === 0 ? (
            <p className="text-base-content/60 text-sm">Aucune pièce. Ajoutez-en une ci-dessus.</p>
          ) : (
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  ref={room.id === lastAddedRoomId ? addedRoomRef : undefined}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    room.id === lastAddedRoomId
                      ? 'bg-success/25 ring-2 ring-success shadow-md'
                      : 'bg-base-200'
                  }`}
                >
                  {editingRoomId === room.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        value={editingRoomName}
                        onChange={(e) => setEditingRoomName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRoomName();
                          if (e.key === 'Escape') cancelEditRoom();
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={handleSaveRoomName}
                        disabled={savingRoom || !editingRoomName.trim()}
                        title="Enregistrer"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={cancelEditRoom}
                        disabled={savingRoom}
                        title="Annuler"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/room/${room.id}`}
                          className="font-medium hover:underline flex items-center gap-2"
                        >
                          {room.name}
                          <span className="text-sm text-base-content/60">
                            ({room._count?.images ?? 0} photo{(room._count?.images ?? 0) !== 1 ? 's' : ''})
                          </span>
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => startEditRoom(room)}
                          title="Modifier le nom"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <a href={`/room/${room.id}`} className="btn btn-sm btn-ghost" title="Voir et gérer les photos">
                          <FontAwesomeIcon icon={faImage} />
                        </a>
                        <button
                          type="button"
                          className="btn btn-sm btn-error btn-ghost"
                          onClick={() => handleDeleteRoom(room.id)}
                          title="Supprimer la pièce"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Coffres */}
      <div className="card bg-base-100 shadow-md mb-6">
        <div className="card-body">
          <h2 className="card-title text-xl mb-4">
            <FontAwesomeIcon icon={faVault} className="text-secondary mr-2" />
            Coffres
          </h2>
          <div className="mb-4">
            <label className="label text-sm text-base-content/70">Suggestions de coffres</label>
            <select
              className="select select-bordered w-full max-w-xs"
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
          <form onSubmit={handleAddSafe} className="flex gap-2 mb-4">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder="Ou saisir un nom personnalisé (ex : Coffre salon)"
              value={newSafeName}
              onChange={(e) => setNewSafeName(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary" disabled={addingSafe || !newSafeName.trim()}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Ajouter
            </button>
          </form>
          {safes.length === 0 ? (
            <p className="text-base-content/60 text-sm">Aucun coffre. Ajoutez-en un ci-dessus.</p>
          ) : (
            <ul className="space-y-2">
              {safes.map((safe) => (
                <li
                  key={safe.id}
                  ref={safe.id === lastAddedSafeId ? addedSafeRef : undefined}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                    safe.id === lastAddedSafeId
                      ? 'bg-success/25 ring-2 ring-success shadow-md'
                      : 'bg-base-200'
                  }`}
                >
                  {editingSafeId === safe.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <input
                        type="text"
                        className="input input-bordered input-sm flex-1"
                        value={editingSafeName}
                        onChange={(e) => setEditingSafeName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveSafeName();
                          if (e.key === 'Escape') cancelEditSafe();
                        }}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={handleSaveSafeName}
                        disabled={savingSafe || !editingSafeName.trim()}
                        title="Enregistrer"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={cancelEditSafe}
                        disabled={savingSafe}
                        title="Annuler"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/safe/${safe.id}`}
                          className="font-medium hover:underline flex items-center gap-2"
                        >
                          {safe.name}
                          <span className="text-sm text-base-content/60">
                            ({safe._count?.images ?? 0} photo{(safe._count?.images ?? 0) !== 1 ? 's' : ''})
                          </span>
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={() => startEditSafe(safe)}
                          title="Modifier le nom"
                        >
                          <FontAwesomeIcon icon={faPen} />
                        </button>
                        <a href={`/safe/${safe.id}`} className="btn btn-sm btn-ghost" title="Voir et gérer les photos">
                          <FontAwesomeIcon icon={faImage} />
                        </a>
                        <button
                          type="button"
                          className="btn btn-sm btn-error btn-ghost"
                          onClick={() => handleDeleteSafe(safe.id)}
                          title="Supprimer le coffre"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
