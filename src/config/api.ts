// Configuration de l'API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    BY_UID: (uid: string) => `/users/${uid}`,
    PLANTS: (userUid: string) => `/users/${userUid}/plants`,
    PLANTS_NEEDING_WATER: (userUid: string) => `/users/${userUid}/plants/needing-water`,
    PLANT_BY_UID: (userUid: string, plantUid: string) => `/users/${userUid}/plants/${plantUid}`,
    WATER_PLANT: (userUid: string, plantUid: string) => `/users/${userUid}/plants/${plantUid}/water`,
  },
  PLANTS: {
    BASE: '/plants',
    BY_UID: (uid: string) => `/plants/${uid}`,
  },
} as const;
