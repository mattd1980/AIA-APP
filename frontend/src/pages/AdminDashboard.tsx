import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faPencil,
  faTrash,
  faSignOutAlt,
  faHome,
} from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get<AdminUser[]>('/api/admin/users');
      setUsers(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Erreur chargement utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-base-200">
      <header className="bg-base-100 border-b border-base-300 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-bold">Tableau de bord admin</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <a href="/" className="btn btn-ghost btn-sm gap-2">
              <FontAwesomeIcon icon={faHome} />
              App
            </a>
            <span className="text-sm text-base-content/70">
              {user?.email}
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm gap-2"
              onClick={handleLogout}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Utilisateurs</h2>
          <button
            type="button"
            className="btn btn-primary gap-2"
            onClick={() => {
              setCreateOpen(true);
              setEditId(null);
              setDeleteId(null);
            }}
          >
            <FontAwesomeIcon icon={faUserPlus} />
            Créer un utilisateur
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : (
          <div className="overflow-x-auto card bg-base-100 shadow">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nom</th>
                  <th>Rôle</th>
                  <th>Créé le</th>
                  <th className="w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-mono text-sm">{u.email}</td>
                    <td>{u.name || '—'}</td>
                    <td>
                      {u.isAdmin ? (
                        <span className="badge badge-warning">Admin</span>
                      ) : (
                        <span className="badge badge-ghost">Utilisateur</span>
                      )}
                    </td>
                    <td className="text-sm text-base-content/70">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      {u.email !== 'admin@local' && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            title="Modifier"
                            onClick={() => {
                              setEditId(u.id);
                              setCreateOpen(false);
                              setDeleteId(null);
                            }}
                          >
                            <FontAwesomeIcon icon={faPencil} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs text-error"
                            title="Supprimer"
                            onClick={() => {
                              setDeleteId(u.id);
                              setCreateOpen(false);
                              setEditId(null);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-base-content/70">
                Aucun utilisateur. Créez-en un pour qu’ils puissent se connecter.
              </div>
            )}
          </div>
        )}

        {createOpen && (
          <CreateUserModal
            onClose={() => setCreateOpen(false)}
            onCreated={() => {
              setCreateOpen(false);
              fetchUsers();
            }}
          />
        )}
        {editId && (
          <EditUserModal
            user={users.find((u) => u.id === editId)!}
            onClose={() => setEditId(null)}
            onUpdated={() => {
              setEditId(null);
              fetchUsers();
            }}
          />
        )}
        {deleteId && (
          <DeleteUserModal
            user={users.find((u) => u.id === deleteId)!}
            onClose={() => setDeleteId(null)}
            onDeleted={() => {
              setDeleteId(null);
              fetchUsers();
            }}
          />
        )}
      </main>
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/api/admin/users', {
        email: email.trim(),
        name: name.trim() || undefined,
        password,
      });
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Créer un utilisateur</h3>
        <p className="text-sm text-base-content/70 py-1">
          L’utilisateur pourra se connecter avec cet email et ce mot de passe.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              type="email"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom (optionnel)</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Mot de passe * (min. 6 caractères)</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Créer'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}

function EditUserModal({
  user,
  onClose,
  onUpdated,
}: {
  user: AdminUser;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [name, setName] = useState(user.name || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.patch(`/api/admin/users/${user.id}`, {
        name: name.trim() || undefined,
        ...(password ? { password } : {}),
      });
      onUpdated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Modifier l’utilisateur</h3>
        <p className="text-sm text-base-content/70 py-1 font-mono">{user.email}</p>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nom</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nouveau mot de passe (laisser vide pour ne pas changer)</span>
            </label>
            <input
              type="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
            />
          </div>
          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner" /> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onDeleted,
}: {
  user: AdminUser;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      onDeleted();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog open className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Supprimer l’utilisateur</h3>
        <p className="py-2">
          Supprimer <strong>{user.email}</strong> ? Toutes ses données (lieux, inventaires, etc.) seront supprimées.
        </p>
        {error && (
          <div className="alert alert-error mt-2">
            <span>{error}</span>
          </div>
        )}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner" /> : 'Supprimer'}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop" onClick={onClose}>
        <button type="button">close</button>
      </form>
    </dialog>
  );
}
