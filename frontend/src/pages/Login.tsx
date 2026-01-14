import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function Login() {
  useEffect(() => {
    // Check if user is already logged in
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          // User is already logged in, redirect to home
          window.location.href = '/';
        }
      })
      .catch(() => {
        // Not logged in, stay on login page
      });
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card bg-base-100 shadow-2xl w-full max-w-md">
        <div className="card-body">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">Inventory AI</h1>
            <p className="text-base-content/70">
              Connectez-vous pour gérer vos inventaires
            </p>
          </div>

          <div className="divider">Ou</div>

          <button
            className="btn btn-primary w-full"
            onClick={handleGoogleLogin}
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            Se connecter avec Google
          </button>

          <p className="text-xs text-center text-base-content/50 mt-4">
            En vous connectant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
}
