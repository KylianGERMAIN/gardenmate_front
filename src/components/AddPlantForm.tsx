import React, { useState } from 'react';
import { plantService } from '../services/plant.service';
import { SunlightLevel, CreatePlantRequest } from '../types';
import { translateSunlightLevel } from '../utils/translations';
import './AddPlantForm.css';

interface AddPlantFormProps {
  onPlantAdded: () => void;
}

export const AddPlantForm: React.FC<AddPlantFormProps> = ({ onPlantAdded }) => {
  const [name, setName] = useState('');
  const [sunlightLevel, setSunlightLevel] = useState<SunlightLevel>(SunlightLevel.FULL_SUN);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const plantData: CreatePlantRequest = {
        name: name.trim(),
        sunlightLevel,
      };
      await plantService.createPlant(plantData);
      setSuccess(true);
      setName('');
      setSunlightLevel(SunlightLevel.FULL_SUN);
      // Rafraîchir la liste des plantes
      setTimeout(() => {
        onPlantAdded();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de la plante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="add-plant-form-container">
      <h2>Ajouter une nouvelle plante</h2>
      <form onSubmit={handleSubmit} className="add-plant-form">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">Plante ajoutée avec succès !</div>}
        
        <div className="form-group">
          <label htmlFor="plant-name">Nom de la plante *</label>
          <input
            id="plant-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            placeholder="Ex: Tomate, Basilic, etc."
          />
        </div>

        <div className="form-group">
          <label htmlFor="sunlight-level">Niveau d'ensoleillement *</label>
          <select
            id="sunlight-level"
            value={sunlightLevel}
            onChange={(e) => setSunlightLevel(e.target.value as SunlightLevel)}
            required
          >
            <option value={SunlightLevel.FULL_SUN}>
              {translateSunlightLevel(SunlightLevel.FULL_SUN)}
            </option>
            <option value={SunlightLevel.PARTIAL_SHADE}>
              {translateSunlightLevel(SunlightLevel.PARTIAL_SHADE)}
            </option>
            <option value={SunlightLevel.SHADE}>
              {translateSunlightLevel(SunlightLevel.SHADE)}
            </option>
          </select>
        </div>

        <button type="submit" disabled={isLoading || !name.trim()} className="submit-button">
          {isLoading ? 'Ajout en cours...' : 'Ajouter la plante'}
        </button>
      </form>
    </div>
  );
};
