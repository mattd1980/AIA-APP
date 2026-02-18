import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDollarSign,
  faSpinner,
  faFilePdf,
  faArrowLeft,
  faEdit,
  faSave,
  faTimes,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { inventoryApi } from '../services/api';
import type { InventoryDetail as InventoryDetailType } from '../services/api';
import EditableItem from '../components/EditableItem';

export default function InventoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [inventoryName, setInventoryName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [addingImages, setAddingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inventoryRef = useRef<InventoryDetailType | null>(null);

  useEffect(() => {
    if (inventory) {
      inventoryRef.current = inventory;
    }
  }, [inventory]);

  useEffect(() => {
    if (!id) return;
    
    loadInventory(true); // Initial load with loading state
    
    // Poll for updates if processing
    const interval = setInterval(() => {
      // Only poll if status is processing
      if (inventoryRef.current?.status === 'processing') {
        loadInventory(false); // Polling without loading state
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id]);

  const loadInventory = async (showLoading = false) => {
    if (!id) return;

    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await inventoryApi.getById(id);
      setInventory(data);
      setInventoryName(data.name || '');
    } catch {
      // Only show alert on initial load, not during polling
      if (showLoading) {
        alert('Erreur lors du chargement de l\'inventaire');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleSaveName = async () => {
    if (!id) return;
    try {
      setSavingName(true);
      await inventoryApi.update(id, { name: inventoryName || undefined });
      setEditingName(false);
      loadInventory(false);
    } catch {
      alert('Erreur lors de la mise à jour du nom');
    } finally {
      setSavingName(false);
    }
  };

  const handleAddImages = async (files: File[]) => {
    if (!id || files.length === 0) return;
    try {
      setAddingImages(true);
      await inventoryApi.addImages(id, files);
      loadInventory(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch {
      alert('Erreur lors de l\'ajout des images');
    } finally {
      setAddingImages(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!id) return;

    try {
      setGeneratingReport(true);
      const blob = await inventoryApi.generateReport(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-report-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Erreur lors de la génération du rapport');
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (!inventory) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          Inventaire non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        className="btn btn-ghost mb-4"
        onClick={() => navigate('/')}
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Retour
      </button>

      <div className="card bg-base-100 shadow-lg mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex-1 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    value={inventoryName}
                    onChange={(e) => setInventoryName(e.target.value)}
                    placeholder="Nom de l'inventaire"
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleSaveName}
                    disabled={savingName}
                  >
                    <FontAwesomeIcon icon={faSave} />
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => {
                      setEditingName(false);
                      setInventoryName(inventory.name || '');
                    }}
                    disabled={savingName}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold break-words">
                    {inventory.name || `Inventaire #${inventory.id.slice(0, 8)}`}
                  </h1>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => setEditingName(true)}
                    title="Modifier le nom"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </div>
              )}
            </div>
            <span className={`badge ${
              inventory.status === 'completed' ? 'badge-success' :
              inventory.status === 'processing' ? 'badge-primary' :
              inventory.status === 'error' ? 'badge-error' :
              'badge-warning'
            }`}>
              {inventory.status === 'processing' && (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
              )}
              {inventory.status === 'draft' && 'Brouillon'}
              {inventory.status === 'processing' && 'En cours'}
              {inventory.status === 'completed' && 'Terminé'}
              {inventory.status === 'error' && 'Erreur'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <p className="text-sm text-base-content/70">Valeur totale estimée</p>
              <p className="text-2xl font-bold text-primary">
                <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                {inventory.totalEstimatedValue.toFixed(2)} CAD
              </p>
            </div>
            <div>
              <p className="text-sm text-base-content/70">Montant d'assurance recommandé</p>
              <p className="text-2xl font-bold text-secondary">
                <FontAwesomeIcon icon={faDollarSign} className="mr-1" />
                {inventory.recommendedInsuranceAmount.toFixed(2)} CAD
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) {
                  handleAddImages(files);
                }
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={addingImages}
            >
              {addingImages ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                  Ajout...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} className="mr-2" />
                  Ajouter des images
                </>
              )}
            </button>
            {inventory.status === 'completed' && (
              <button
                className="btn btn-primary"
                onClick={handleGenerateReport}
                disabled={generatingReport}
              >
                {generatingReport ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                    Génération...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                    Générer le rapport PDF
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {inventory.status === 'processing' && (
        <div className="card bg-base-100 shadow-md mb-6">
          <div className="card-body">
            <div className="flex items-center justify-center mb-4">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-primary animate-spin mr-4"
              />
              <div>
                <h3 className="card-title">Analyse en cours</h3>
                <p className="text-sm text-base-content/70">
                  Traitement des images en cours…
                </p>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Images à traiter</div>
                <div className="stat-value text-2xl">{inventory.images.length}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Objets identifiés</div>
                <div className="stat-value text-2xl text-primary">
                  {inventory.items ? inventory.items.length : 0}
                </div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-4">
                <div className="stat-title text-xs">Valeur totale</div>
                <div className="stat-value text-2xl text-secondary">
                  ${inventory.totalEstimatedValue.toFixed(2)}
                </div>
              </div>
            </div>

            {inventory.metadata && (
              <div className="mt-4">
                <details className="collapse collapse-arrow bg-base-200">
                  <summary className="collapse-title text-sm font-medium">
                    Détails de traitement (débogage)
                  </summary>
                  <div className="collapse-content">
                    <pre className="text-xs bg-base-300 p-4 rounded overflow-auto max-h-48">
                      {JSON.stringify(inventory.metadata, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            {inventory.items && inventory.items.length === 0 && (
              <div className="alert alert-warning mt-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="font-bold">Aucun objet identifié pour le moment</h3>
                  <div className="text-xs mt-2">
                    <p>Le traitement est en cours. Cela peut prendre quelques instants.</p>
                    <p className="mt-1">Si le problème persiste, vérifiez la console du navigateur (F12) pour plus de détails.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {inventory.status === 'error' && (
        <div className="card bg-error/10 border border-error shadow-md mb-6">
          <div className="card-body">
            <h3 className="card-title text-error">Erreur lors du traitement</h3>
            <p className="text-base-content/70">
              Une erreur s'est produite lors de l'analyse des images.
            </p>
            {inventory.metadata && (
              <details className="collapse collapse-arrow bg-base-200 mt-4">
                <summary className="collapse-title text-sm font-medium">
                  Détails de l'erreur (débogage)
                </summary>
                <div className="collapse-content">
                  <pre className="text-xs bg-base-300 p-4 rounded overflow-auto max-h-48">
                    {JSON.stringify(inventory.metadata, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {inventory.status === 'completed' && (!inventory.items || inventory.items.length === 0) && (
        <div className="card bg-warning/10 border border-warning shadow-md mb-6">
          <div className="card-body">
            <h3 className="card-title text-warning">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Aucun objet identifié
            </h3>
            <p className="text-base-content/70">
              Le traitement est terminé, mais aucun objet n'a été identifié dans les images.
            </p>
            {inventory.metadata && (
              <details className="collapse collapse-arrow bg-base-200 mt-4">
                <summary className="collapse-title text-sm font-medium">
                  Informations de débogage
                </summary>
                <div className="collapse-content">
                  <div className="text-sm space-y-2">
                    <p><strong>Images traitées:</strong> {String(inventory.metadata.imageCount ?? 0)}</p>
                    <p><strong>Objets trouvés:</strong> {String(inventory.metadata.itemCount ?? 0)}</p>
                    {Array.isArray(inventory.metadata.errors) && inventory.metadata.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold text-error">Erreurs:</p>
                        <ul className="list-disc list-inside text-xs">
                          {(inventory.metadata.errors as string[]).map((error: string, idx: number) => (
                            <li key={idx} className="text-error">{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer">JSON complet (débogage)</summary>
                    <pre className="text-xs bg-base-300 p-4 rounded overflow-auto max-h-48 mt-2">
                      {JSON.stringify(inventory.metadata, null, 2)}
                    </pre>
                  </details>
                </div>
              </details>
            )}
          </div>
        </div>
      )}

      {inventory.items && inventory.items.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Objets identifiés ({inventory.items.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inventory.items.map((item) => (
              <EditableItem
                key={item.id}
                item={item}
                inventoryId={inventory.id}
                onUpdate={loadInventory}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
