import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';
import {
  User,
  CreateUserRequest,
  UserPlant,
  AssignPlantRequest,
  UpdateUserPlantRequest,
  WaterPlantRequest,
  WateringEvent,
} from '../types';

export const userService = {
  getUser: async (uid: string): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.USERS.BY_UID(uid));
    return response.data;
  },

  createUser: async (userData: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>(API_ENDPOINTS.USERS.BASE, userData);
    return response.data;
  },

  deleteUser: async (uid: string): Promise<User> => {
    const response = await apiClient.delete<User>(API_ENDPOINTS.USERS.BY_UID(uid));
    return response.data;
  },

  getUserPlants: async (userUid: string): Promise<UserPlant[]> => {
    const response = await apiClient.get<UserPlant[]>(API_ENDPOINTS.USERS.PLANTS(userUid));
    return response.data;
  },

  getPlantsNeedingWater: async (userUid: string): Promise<UserPlant[]> => {
    const response = await apiClient.get<UserPlant[]>(
      API_ENDPOINTS.USERS.PLANTS_NEEDING_WATER(userUid)
    );
    return response.data;
  },

  assignPlantToUser: async (
    userUid: string,
    plantData: AssignPlantRequest
  ): Promise<UserPlant> => {
    const response = await apiClient.post<UserPlant>(
      API_ENDPOINTS.USERS.PLANTS(userUid),
      plantData
    );
    return response.data;
  },

  updateUserPlant: async (
    userUid: string,
    plantUid: string,
    updateData: UpdateUserPlantRequest
  ): Promise<UserPlant> => {
    const response = await apiClient.patch<UserPlant>(
      API_ENDPOINTS.USERS.PLANT_BY_UID(userUid, plantUid),
      updateData
    );
    return response.data;
  },

  deleteUserPlant: async (userUid: string, plantUid: string): Promise<UserPlant> => {
    const response = await apiClient.delete<UserPlant>(
      API_ENDPOINTS.USERS.PLANT_BY_UID(userUid, plantUid)
    );
    return response.data;
  },

  waterPlant: async (
    userUid: string,
    plantUid: string,
    waterData?: WaterPlantRequest
  ): Promise<WateringEvent> => {
    const response = await apiClient.post<WateringEvent>(
      API_ENDPOINTS.USERS.WATER_PLANT(userUid, plantUid),
      waterData || {}
    );
    return response.data;
  },
};
