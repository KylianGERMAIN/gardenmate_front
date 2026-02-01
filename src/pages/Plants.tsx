import React, { useEffect, useState } from 'react';
import { plantService } from '../services/plant.service';
import { Plant } from '../types';
import { translateSunlightLevel } from '../utils/translations';
import { useAuth } from '../contexts/AuthContext';
import { AssignPlantModal } from '../components/AssignPlantModal';
import './Plants.css';

export const Plants: React.FC = () => {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  const loadPlants = async () => {
    try {
      setIsLoading(true);
      const plantsData = await plantService.getPlants();
      setPlants(plantsData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des plantes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  if (isLoading) {
    return <div className="loading">Chargement du catalogue...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  return (
    <div className="plants">
      <h1>Catalogue des Plantes</h1>
      {plants.length === 0 ? (
        <div className="empty-state">Aucune plante disponible.</div>
      ) : (
        <div className="plants-grid">
          {plants.map((plant) => (
            <div key={plant.uid} className="plant-card">
              <h3>{plant.name}</h3>
              <p className="plant-info">
                <span>☀️ {translateSunlightLevel(plant.sunlightLevel)}</span>
                {plant.wateringFrequency !== null && (
                  <span>💧 Arrosage: {plant.wateringFrequency} jours</span>
                )}
              </p>
              {user && (
                <button
                  className="add-to-garden-button"
                  onClick={() => setSelectedPlant(plant)}
                >
                  🌱 Ajouter à mon jardin
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {selectedPlant && user && (
        <AssignPlantModal
          plant={selectedPlant}
          userUid={user.uid}
          onClose={() => setSelectedPlant(null)}
          onSuccess={() => {
            // Optionnel : recharger la liste ou afficher un message
            setSelectedPlant(null);
          }}
        />
      )}
    </div>
  );
};
