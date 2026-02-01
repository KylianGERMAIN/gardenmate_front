import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/user.service';
import { UserPlant } from '../types';
import { translateSunlightLevel } from '../utils/translations';
import './Home.css';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserPlants = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const plants = await userService.getUserPlants(user.uid);
        setUserPlants(plants);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des plantes');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserPlants();
  }, [user]);

  if (isLoading) {
    return <div className="loading">Chargement de vos plantes...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  return (
    <div className="home">
      <h1>Mes Plantes</h1>
      {userPlants.length === 0 ? (
        <div className="empty-state">
          <p>Vous n'avez pas encore de plantes.</p>
          <p>Ajoutez-en depuis le catalogue !</p>
        </div>
      ) : (
        <div className="plants-grid">
          {userPlants.map((userPlant) => (
            <div key={userPlant.uid} className="plant-card">
              <h3>{userPlant.plant.name}</h3>
              <p className="plant-info">
                <span>☀️ {translateSunlightLevel(userPlant.plant.sunlightLevel)}</span>
                {userPlant.plant.wateringFrequency !== null && (
                  <span>💧 Arrosage: {userPlant.plant.wateringFrequency} jours</span>
                )}
              </p>
              {userPlant.plantedAt && (
                <p className="plant-date">Planté le: {new Date(userPlant.plantedAt).toLocaleDateString('fr-FR')}</p>
              )}
              {userPlant.lastWateredAt && (
                <p className="plant-date">
                  Dernier arrosage: {new Date(userPlant.lastWateredAt).toLocaleDateString('fr-FR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
