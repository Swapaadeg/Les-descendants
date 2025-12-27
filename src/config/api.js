/**
 * Configuration de l'API
 */

// URL de base de l'API
// En développement local: utilisez votre serveur local PHP
// En production: utilisez l'URL de votre site o2switch
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api';

// Endpoints
export const API_ENDPOINTS = {
  dinosaurs: `${API_BASE_URL}/dinosaurs.php`
};
