// Types pour les entités du backend

export enum SunlightLevel {
  FULL_SUN = 'FULL_SUN',
  PARTIAL_SHADE = 'PARTIAL_SHADE',
  SHADE = 'SHADE',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  uid: string;
  login: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Plant {
  uid: string;
  name: string;
  sunlightLevel: SunlightLevel;
  wateringFrequency: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPlant {
  uid: string;
  userUid: string;
  plantUid: string;
  plantedAt: string | null;
  lastWateredAt: string | null;
  plant: Plant;
  createdAt: string;
  updatedAt: string;
}

export interface WateringEvent {
  uid: string;
  userPlantUid: string;
  note: string | null;
  createdAt: string;
}

// Types pour les requêtes API
export interface LoginRequest {
  login: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface CreateUserRequest {
  login: string;
  password: string;
  role: UserRole;
}

export interface PlantGetQuery {
  sunlightLevel?: SunlightLevel;
  name?: string;
}

export interface CreatePlantRequest {
  name: string;
  sunlightLevel: SunlightLevel;
}

export interface AssignPlantRequest {
  plantUid: string;
  plantedAt?: string;
  lastWateredAt?: string;
}

export interface UpdateUserPlantRequest {
  plantedAt?: string | null;
  lastWateredAt?: string | null;
}

export interface WaterPlantRequest {
  note?: string | null;
}
