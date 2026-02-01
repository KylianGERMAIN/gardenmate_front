import { SunlightLevel } from '../types';

// Traductions françaises
export const translations = {
  sunlightLevel: {
    [SunlightLevel.FULL_SUN]: 'Plein soleil',
    [SunlightLevel.PARTIAL_SHADE]: 'Mi-ombre',
    [SunlightLevel.SHADE]: 'Ombre',
  },
  userRole: {
    ADMIN: 'Administrateur',
    USER: 'Utilisateur',
  },
} as const;

/**
 * Traduit un niveau d'ensoleillement en français
 */
export const translateSunlightLevel = (level: SunlightLevel): string => {
  return translations.sunlightLevel[level] || level;
};

/**
 * Traduit un rôle utilisateur en français
 */
export const translateUserRole = (role: string): string => {
  return translations.userRole[role as keyof typeof translations.userRole] || role;
};
