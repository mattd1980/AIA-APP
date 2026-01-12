import { useEffect, useState } from 'react';
import { inventoryApi } from '../services/api';
import type { Inventory } from '../services/api';
import InventoryCard from '../components/InventoryCard';

export default function Home() {
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventories();
  }, []);

  const loadInventories = async () => {
    try {
      setLoading(true);
      const response = await inventoryApi.list();
      setInventories(response?.data || []);
    } catch (error) {
      console.error('Error loading inventories:', error);
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
      return;
    }

    try {
      await inventoryApi.delete(id);
      loadInventories();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('Erreur lors de la suppression');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mes Inventaires</h1>
      
      {inventories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-base-content/70 mb-4">Aucun inventaire pour le moment</p>
          <a href="/new" className="btn btn-primary">
            Créer un nouvel inventaire
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventories.map((inventory) => (
            <InventoryCard
              key={inventory.id}
              inventory={inventory}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
