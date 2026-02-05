import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import api from '../services/api';
import Footer from '../components/Footer';

type DbStatus = 'checking' | 'ok' | 'error';

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatus>('checking');
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    const checkDb = async () => {
      try {
        const res = await api.get('/health/db');
        setDbStatus(res.data?.status === 'ok' ? 'ok' : 'error');
      } catch {
        setDbStatus('error');
      }
    };
    checkDb();
  }, []);

  useEffect(() => {
    api.get('/api/auth/google/enabled')
      .then((res) => setGoogleEnabled(res.data?.enabled === true))
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    const authError = searchParams.get('error');
    if (authError === 'auth_failed') {
      setError('Connexion Google annulée ou échouée. Réessayez ou connectez-vous avec email/mot de passe.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    // Check if user is already logged in
    api.get('/api/auth/me')
      .then((res) => {
        if (res.data) {
          // Admin goes to /admin, others to home
          window.location.href = res.data.isAdmin ? '/admin' : '/';
        }
      })
      .catch(() => {
        // Not logged in, stay on login page
      });
  }, []);

  const backendAuthUrl = import.meta.env.PROD
    ? `${window.location.origin}/api/auth/google`
    : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`;

  const handleGoogleLogin = () => {
    window.location.href = backendAuthUrl;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });

      if (response.data) {
        // Admin -> /admin, regular user -> home
        window.location.href = response.data.isAdmin ? '/admin' : '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <div className="flex-grow flex items-center justify-center px-4 py-4 sm:py-8 pb-24 sm:pb-20">
        <div className="card bg-base-100 shadow-2xl w-full max-w-md relative">
          {/* Database status LED - top right of card */}
          <span
            className={`absolute top-4 right-4 inline-block w-3 h-3 rounded-full border border-base-content/20 ${
              dbStatus === 'checking'
                ? 'bg-amber-400 animate-pulse'
                : dbStatus === 'ok'
                  ? 'bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]'
                  : 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]'
            }`}
            title={dbStatus === 'ok' ? 'Base de données connectée' : dbStatus === 'error' ? 'Base de données indisponible' : 'Vérification…'}
            aria-hidden
          />
          <div className="card-body pb-4 sm:pb-6">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2">Inventory AI</h1>
              <p className="text-base-content/70">
                Connectez-vous pour gérer vos inventaires
              </p>
            </div>

            {/* Username/Password Form */}
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <label className="input-group">
                  <span>
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    className="input input-bordered w-full"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                    placeholder="Mot de passe"
                    className="input input-bordered w-full"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </label>
              </div>

              {error && (
                <div className="alert alert-error">
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full border-2 border-primary/40 shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {googleEnabled && (
              <>
                <div className="divider text-base-content/50 text-sm">ou</div>
                <button
                  type="button"
                  className="btn btn-outline w-full gap-2 border-2"
                  onClick={handleGoogleLogin}
                >
                  <FontAwesomeIcon icon={faGoogle} className="text-lg" />
                  Se connecter avec Google
                </button>
              </>
            )}

            <p className="text-xs text-center text-base-content/50 mt-6 leading-relaxed px-2 break-words">
              En vous connectant, vous acceptez nos{' '}
              <a href="/terms" className="link link-primary break-all">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="link link-primary break-all">
                politique de confidentialité
              </a>
              .
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
