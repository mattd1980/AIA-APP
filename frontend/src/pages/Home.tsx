import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faPlus } from '@fortawesome/free-solid-svg-icons';
import { locationsApi } from '../services/api';
import type { Location } from '../services/api';
import LocationCard from '../components/LocationCard';

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const list = await locationsApi.list();
      setLocations(list);
    } catch (error) {
      console.error('Erreur chargement des lieux:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ? Toutes les pièces, coffres et photos seront supprimés.')) {
      return;
    }
    try {
      await locationsApi.delete(id);
      loadLocations();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleExportCsv = async () => {
    try {
      setExporting(true);
      const blob = await locationsApi.exportInventoryCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventaire-assurance-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export CSV:', err);
      alert('Erreur lors de l\'export. Réessayez.');
    } finally {
      setExporting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">Mes lieux</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/location/new" className="btn btn-primary">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Nouveau lieu
          </a>
          {locations.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-primary"
              onClick={handleExportCsv}
              disabled={exporting}
              title="Exporter l'inventaire en CSV pour votre assureur"
            >
              {exporting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              )}
              Exporter en CSV (assureur)
            </button>
          )}
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/70 mb-4">Aucun lieu pour le moment</p>
          <a href="/location/new" className="btn btn-primary">
            Ajouter une adresse ou un domicile
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
