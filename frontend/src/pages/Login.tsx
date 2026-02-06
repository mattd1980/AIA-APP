import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import api from '@/services/api';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

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
    api.get('/api/auth/me')
      .then((res) => {
        if (res.data) {
          window.location.href = res.data.isAdmin ? '/admin' : '/';
        }
      })
      .catch(() => {});
  }, []);

  const backendBase =
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000');
  const backendAuthUrl = `${backendBase.replace(/\/$/, '')}/api/auth/google`;

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
        window.location.href = response.data.isAdmin ? '/admin' : '/';
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erreur de connexion');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1 items-center justify-center px-4 py-4 pb-24 sm:py-8 sm:pb-20">
        <Card className="relative w-full max-w-md shadow-2xl">
          <span
            className={`absolute right-4 top-4 inline-block h-3 w-3 rounded-full border ${
              dbStatus === 'checking'
                ? 'border-amber-400 bg-amber-400 animate-pulse'
                : dbStatus === 'ok'
                  ? 'border-green-500 bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]'
                  : 'border-red-500 bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]'
            }`}
            title={dbStatus === 'ok' ? 'Base de données connectée' : dbStatus === 'error' ? 'Base de données indisponible' : 'Vérification…'}
            aria-hidden
          />
          <CardContent className="pb-4 sm:pb-6 sm:pt-6">
            <div className="mb-6 text-center">
              <h1 className="mb-2 text-4xl font-bold">Inventory AI</h1>
              <p className="text-muted-foreground">
                Connectez-vous pour gérer vos inventaires
              </p>
            </div>

            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center pointer-events-none text-muted-foreground">
                    <FontAwesomeIcon icon={faUser} className="text-base" />
                  </span>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className="pl-9"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center pointer-events-none text-muted-foreground">
                    <FontAwesomeIcon icon={faLock} className="text-base" />
                  </span>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <Spinner className="size-4" data-icon="inline-start" />
                ) : null}
                Se connecter
              </Button>
            </form>

            {googleEnabled && (
              <>
                <div className="my-4 flex items-center gap-4">
                  <Separator className="flex-1" />
                  <span className="text-muted-foreground text-sm">ou</span>
                  <Separator className="flex-1" />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleGoogleLogin}
                >
                  <FontAwesomeIcon icon={faGoogle} className="text-lg" />
                  Se connecter avec Google
                </Button>
              </>
            )}

            <p className="mt-6 break-words px-2 text-center text-muted-foreground text-xs leading-relaxed">
              En vous connectant, vous acceptez nos{' '}
              <a href="/terms" className="text-primary underline-offset-4 hover:underline break-all">
                conditions d'utilisation
              </a>{' '}
              et notre{' '}
              <a href="/privacy" className="text-primary underline-offset-4 hover:underline break-all">
                politique de confidentialité
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
