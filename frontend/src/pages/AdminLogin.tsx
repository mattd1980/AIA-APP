import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faLock } from '@fortawesome/free-solid-svg-icons';
import api from '../services/api';
import { getApiError } from '@/utils/get-api-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';

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
      setError('Acces reserve a l\'administrateur. Utilisez le compte admin.');
    } catch (err: unknown) {
      setError(getApiError(err, 'Email ou mot de passe incorrect'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardContent className="p-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <FontAwesomeIcon icon={faUserShield} />
            Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Connectez-vous avec le mot de passe super admin.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email admin</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <FontAwesomeIcon icon={faUserShield} />
                </span>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Mot de passe</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <Input
                  id="admin-password"
                  type="password"
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Spinner className="size-4" />
              ) : (
                'Acceder au tableau de bord'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
