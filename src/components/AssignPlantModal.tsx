import React, { useState } from 'react';
import { userService } from '../services/user.service';
import { Plant, AssignPlantRequest } from '../types';
import './AssignPlantModal.css';

interface AssignPlantModalProps {
  plant: Plant;
  userUid: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignPlantModal: React.FC<AssignPlantModalProps> = ({
  plant,
  userUid,
  onClose,
  onSuccess,
}) => {
  const [plantedAt, setPlantedAt] = useState('');
  const [lastWateredAt, setLastWateredAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const plantData: AssignPlantRequest = {
        plantUid: plant.uid,
        plantedAt: plantedAt || undefined,
        lastWateredAt: lastWateredAt || undefined,
      };
      await userService.assignPlantToUser(userUid, plantData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout de la plante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ajouter "{plant.name}" à mon jardin</h2>
          <button className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="assign-plant-form">
          {error && <div className="form-error">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="planted-at">Date de plantation (optionnel)</label>
            <input
              id="planted-at"
              type="date"
              value={plantedAt}
              onChange={(e) => setPlantedAt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="last-watered">Dernier arrosage (optionnel)</label>
            <input
              id="last-watered"
              type="date"
              value={lastWateredAt}
              onChange={(e) => setLastWateredAt(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
            <button type="submit" disabled={isLoading} className="submit-button">
              {isLoading ? 'Ajout en cours...' : 'Ajouter à mon jardin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
