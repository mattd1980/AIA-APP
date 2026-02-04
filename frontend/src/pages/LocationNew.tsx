import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationsApi } from '../services/api';

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Nouveau lieu</h1>
      <p className="text-base-content/70 mb-6">
        Ajoutez une adresse ou un domicile (maison, appartement, etc.). Vous pourrez ensuite y ajouter des pièces et des coffres, chacun avec des photos.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom du lieu *</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ex : Maison principale, 123 rue Example"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">Adresse (optionnel)</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Ex : 123 rue Example, Ville"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}
        <div className="flex gap-4">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Création…' : 'Créer le lieu'}
          </button>
        </div>
      </form>
    </div>
  );
}
