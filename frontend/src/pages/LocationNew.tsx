import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationsApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LocationNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Le nom du lieu est requis');
      return;
    }
    try {
      setSaving(true);
      const location = await locationsApi.create({
        name: name.trim(),
        address: address.trim() || undefined,
      });
      navigate(`/location/${location.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Erreur lors de la création');
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Nouveau lieu</h1>
      <p className="mb-6 text-muted-foreground">
        Ajoutez une adresse ou un domicile (maison, appartement, etc.). Vous pourrez ensuite y ajouter des pièces et des coffres, chacun avec des photos.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="location-name">Nom du lieu *</Label>
          <Input
            id="location-name"
            type="text"
            className="h-10 w-full"
            placeholder="Ex : Maison principale, 123 rue Example"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location-address">Adresse (optionnel)</Label>
          <Input
            id="location-address"
            type="text"
            className="h-10 w-full"
            placeholder="Ex : 123 rue Example, Ville"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Création…' : 'Créer le lieu'}
          </Button>
        </div>
      </form>
    </div>
  );
}
