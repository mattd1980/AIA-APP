import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faLock } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';

export default function AdminLogin({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        username: email,
        password,
      });
      if (res.data?.isAdmin) {
        onSuccess();
        window.location.href = '/admin';
        return;
      }
      setError('Accès réservé à l\'administrateur. Utilisez le compte admin.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-sm">
        <div className="card-body">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FontAwesomeIcon icon={faUserShield} />
            Admin
          </h1>
          <p className="text-sm text-base-content/70">
            Connectez-vous avec le mot de passe super admin.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email admin</span>
              </label>
              <label className="input-group">
                <span>
                  <FontAwesomeIcon icon={faUserShield} />
                </span>
                <input
                  type="email"
                  placeholder="admin@local"
                  className="input input-bordered w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Mot de passe</span>
              </label>
              <label className="input-group">
                <span>
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner" />
              ) : (
                'Accéder au tableau de bord'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
