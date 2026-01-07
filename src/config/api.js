/**
 * Configuration de l'API
 */

// URL de base de l'API
// Dev: serveur PHP local
// Prod: URL o2switch
export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.MODE === 'production'
    ? 'https://arki-family.swapdevstudio.fr/api'
    : 'http://localhost:8000'
);

// Images par défaut
export const DEFAULT_DINO_IMAGE = '/assets/default-dino.svg';
export const DEFAULT_AVATAR_IMAGE = '/assets/default-avatar.svg';

/**
 * Helper pour construire les URLs d'images
 * Ajoute le préfixe API_BASE_URL si l'URL est relative
 * Retourne une image par défaut si aucune image n'est fournie
 */
export const getImageUrl = (relativePath, useDefault = true) => {
  if (!relativePath) {
    return useDefault ? DEFAULT_DINO_IMAGE : null;
  }
  // Si l'URL commence déjà par http, la retourner telle quelle
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // Enlever le préfixe /api/ si présent (pour éviter api/api/)
  let cleanPath = relativePath;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.substring(4); // Enlève '/api'
  }
  // Préfixer avec l'URL de l'API
  return `${API_BASE_URL}${cleanPath}`;
};

// Endpoints
export const API_ENDPOINTS = {
  dinosaurs: `${API_BASE_URL}/dinosaurs.php`
};
