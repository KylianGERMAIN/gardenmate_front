import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import { Plant, PlantGetQuery, CreatePlantRequest } from '../types';

export const plantService = {
  getPlants: async (query?: PlantGetQuery): Promise<Plant[]> => {
    // Filtrer les paramètres vides/undefined pour éviter les erreurs de validation
    const cleanParams: PlantGetQuery = {};
    if (query?.sunlightLevel) {
      cleanParams.sunlightLevel = query.sunlightLevel;
    }
    if (query?.name) {
      cleanParams.name = query.name;
    }
    
    const response = await apiClient.get<Plant[]>(API_ENDPOINTS.PLANTS.BASE, {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    });
    return response.data;
  },

  createPlant: async (plantData: CreatePlantRequest): Promise<Plant> => {
    const response = await apiClient.post<Plant>(API_ENDPOINTS.PLANTS.BASE, plantData);
    return response.data;
  },

  deletePlant: async (uid: string): Promise<Plant> => {
    const response = await apiClient.delete<Plant>(API_ENDPOINTS.PLANTS.BY_UID(uid));
    return response.data;
  },
};
