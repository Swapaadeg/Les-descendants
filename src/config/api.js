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

// Endpoints
export const API_ENDPOINTS = {
  dinosaurs: `${API_BASE_URL}/dinosaurs.php`
};
