import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv, faPlus } from '@fortawesome/free-solid-svg-icons';
import { locationsApi } from '@/services/api';
import type { Location } from '@/services/api';
import LocationCard from '@/components/LocationCard';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
    } catch {
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
    } catch {
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
    } catch {
      alert('Erreur lors de l\'export. Réessayez.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Spinner className="size-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Mes lieux</h1>
        <div className="flex flex-wrap items-center gap-2">
          <a href="/location/new">
            <Button>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Nouveau lieu
            </Button>
          </a>
          {locations.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleExportCsv}
              disabled={exporting}
              title="Exporter l'inventaire en CSV pour votre assureur"
            >
              {exporting ? (
                <Spinner className="mr-2 size-4" data-icon="inline-start" />
              ) : (
                <FontAwesomeIcon icon={faFileCsv} className="mr-2" />
              )}
              Exporter en CSV (assureur)
            </Button>
          )}
        </div>
      </div>

      {locations.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-muted-foreground">Aucun lieu pour le moment</p>
          <a href="/location/new">
            <Button>Ajouter une adresse ou un domicile</Button>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locations.map((location) => (
            <LocationCard key={location.id} location={location} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
