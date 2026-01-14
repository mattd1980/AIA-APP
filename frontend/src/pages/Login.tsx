import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    api.get('/api/auth/me')
      .then((res) => {
        if (res.data) {
          // User is already logged in, redirect to home
          window.location.href = '/';
        }
      })
      .catch(() => {
        // Not logged in, stay on login page
      });
  }, []);

  const handleGoogleLogin = () => {
    const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });

      if (response.data) {
        // Login successful, reload page to update auth state
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="card bg-base-100 shadow-2xl w-full max-w-md">
          <div className="card-body">
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
                  <span className="label-text">Nom d'utilisateur</span>
                </label>
                <label className="input-group">
                  <span>
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <input
                    type="text"
                    placeholder="admin"
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
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="divider">Ou</div>

            <button
              className="btn btn-outline w-full"
              onClick={handleGoogleLogin}
            >
              <FontAwesomeIcon icon={faGoogle} className="mr-2" />
              Se connecter avec Google
            </button>

            <p className="text-xs text-center text-base-content/50 mt-4">
              En vous connectant, vous acceptez nos{' '}
              <a href="/terms" className="link link-primary">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="link link-primary">
                politique de confidentialité
              </a>
            </p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="/privacy" className="text-xs link link-hover">
                Confidentialité
              </a>
              <span className="text-xs">•</span>
              <a href="/terms" className="text-xs link link-hover">
                Conditions
              </a>
              <span className="text-xs">•</span>
              <a href="/cookies" className="text-xs link link-hover">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
