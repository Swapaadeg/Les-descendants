/**
 * Service API - Arki'Family
 * Interface centralisée pour toutes les requêtes vers le backend
 */

import axios from 'axios';

// URL de base de l'API
// En développement: localhost:8000 (serveur PHP built-in depuis api/)
// En production: https://arki-family.swapdevstudio.fr/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://arki-family.swapdevstudio.fr/api' 
    : 'http://localhost:8000');

// Fonction pour convertir les URLs relatives en URLs absolues
export const getFullImageUrl = (relativeUrl) => {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith('http')) {
    // En dev, retirer /api/ car le serveur sert depuis api/
    // En prod, garder /api/ car c'est le vrai chemin
    if (import.meta.env.MODE !== 'production') {
      return relativeUrl.replace('/api/', '/');
    }
    return relativeUrl;
  }
  // URL relative
  return relativeUrl;
};

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Pour envoyer les cookies
});

// Variable pour stocker le token CSRF
let csrfToken = null;

// Fonction pour récupérer le token CSRF
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/csrf-token.php`, {
      withCredentials: true,
    });
    csrfToken = response.data.csrf_token;
    return csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Intercepteur pour ajouter le token JWT et CSRF dans les requêtes
api.interceptors.request.use(
  async (config) => {
    // Ajouter le JWT token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ajouter le CSRF token pour les requêtes non-GET
    if (['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
      if (!csrfToken) {
        csrfToken = await fetchCSRFToken();
      }
      if (csrfToken) {
        // Si c'est FormData (fichiers), ajouter le token à FormData
        if (config.data instanceof FormData) {
          config.data.append('csrf_token', csrfToken);
        } else {
          // Sinon, ajouter au JSON
          config.data = config.data || {};
          config.data.csrf_token = csrfToken;
        }
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas rediriger si on est déjà sur les pages publiques (login, register, verify-email, reset-password)
      const currentPath = window.location.pathname;
      const publicPages = ['/login', '/register', '/verify-email', '/reset-password', '/'];
      
      // Token expiré ou invalide - déconnecter l'utilisateur
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Rediriger vers login SAUF si on est déjà sur une page publique
      if (!publicPages.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===========================
// AUTHENTIFICATION
// ===========================

export const authAPI = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (userData) => {
    const response = await api.post('/auth/register.php', userData);
    return response.data;
  },

  /**
   * Connexion utilisateur
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login.php', credentials);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async () => {
    try {
      await api.post('/auth/logout.php');
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Vérification d'email avec token
   */
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email.php', { token });
    return response.data;
  },

  /**
   * Renvoyer l'email de vérification
   */
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification.php', { email });
    return response.data;
  },

  /**
   * Demander une réinitialisation de mot de passe
   */
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/reset-password.php', {
      action: 'request',
      email,
    });
    return response.data;
  },

  /**
   * Réinitialiser le mot de passe avec le token
   */
  resetPassword: async (token, password, password_confirm) => {
    const response = await api.post('/auth/reset-password.php', {
      action: 'reset',
      token,
      password,
      password_confirm,
    });
    return response.data;
  },

  /**
   * Récupérer les informations de l'utilisateur connecté
   */
  me: async () => {
    const response = await api.get('/auth/me.php');
    return response.data;
  },
};

// ===========================
// UTILISATEUR / PROFIL
// ===========================

export const userAPI = {
  /**
   * Upload de la photo de profil (avatar)
   */
  uploadAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    formData.append('action', 'upload_avatar');

    const response = await api.post('/auth/profile.php', formData);
    return response.data;
  },

  /**
   * Changer l'adresse email
   */
  changeEmail: async (newEmail, password) => {
    const response = await api.put('/auth/profile.php', {
      action: 'update_email',
      newEmail,
      password,
    });
    return response.data;
  },

  /**
   * Changer le mot de passe
   */
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/auth/profile.php', {
      action: 'update_password',
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// ===========================
// DINOSAURES
// ===========================

export const dinoAPI = {
  /**
   * Récupérer tous les dinosaures (de la tribu actuelle)
   */
  getAll: async (tribeId = null) => {
    const url = tribeId ? `/dinosaurs.php?tribe_id=${tribeId}` : '/dinosaurs.php';
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Récupérer un dinosaure par ID
   */
  getById: async (id) => {
    const response = await api.get(`/dinosaurs.php?id=${id}`);
    return response.data;
  },

  /**
   * Créer un nouveau dinosaure
   */
  create: async (dinoData) => {
    // Créer un FormData pour l'upload de fichier
    const formData = new FormData();
    formData.append('species', dinoData.species);
    formData.append('typeIds', JSON.stringify(dinoData.typeIds));
    formData.append('isMutated', dinoData.isMutated ? '1' : '0');
    formData.append('stats', JSON.stringify(dinoData.stats));
    formData.append('mutatedStats', JSON.stringify(dinoData.mutatedStats || {}));

    // Ajouter la photo si présente
    if (dinoData.photo) {
      formData.append('photo', dinoData.photo);
    }

    const response = await api.post('/dinosaurs.php', formData);
    return response.data;
  },

  /**
   * Mettre à jour un dinosaure
   */
  update: async (id, dinoData) => {
    const response = await api.put(`/dinosaurs.php?id=${id}`, dinoData);
    return response.data;
  },

  /**
   * Supprimer un dinosaure
   */
  delete: async (id) => {
    const response = await api.delete(`/dinosaurs.php?id=${id}`);
    return response.data;
  },

  /**
   * Toggle le statut featured d'un dinosaure
   */
  toggleFeatured: async (id, isFeatured) => {
    const response = await api.put(`/dinosaurs.php?id=${id}`, { is_featured: isFeatured });
    return response.data;
  },

  /**
   * Récupérer les dinosaures featured d'une tribu (accessible publiquement)
   */
  getFeatured: async (tribeId) => {
    const response = await api.get(`/dinosaurs.php?tribe_id=${tribeId}&featured=1`);
    return response.data;
  },
};

// ===========================
// TRIBUS
// ===========================

export const tribeAPI = {
  /**
   * Récupérer toutes les tribus publiques
   */
  getAll: async () => {
    const response = await api.get('/tribes.php');
    // Transformer les URLs uniquement en dev
    if (import.meta.env.MODE !== 'production' && response.data.tribes) {
      response.data.tribes = response.data.tribes.map(tribe => ({
        ...tribe,
        banner_url: tribe.banner_url ? tribe.banner_url.replace('/api/', '/') : null,
        logo_url: tribe.logo_url ? tribe.logo_url.replace('/api/', '/') : null,
      }));
    }
    return response.data;
  },

  /**
   * Récupérer la tribu de l'utilisateur connecté
   */
  getMy: async () => {
    const response = await api.get('/tribes.php?my');
    if (import.meta.env.MODE !== 'production' && response.data.tribe) {
      response.data.tribe.banner_url = response.data.tribe.banner_url ? response.data.tribe.banner_url.replace('/api/', '/') : null;
      response.data.tribe.logo_url = response.data.tribe.logo_url ? response.data.tribe.logo_url.replace('/api/', '/') : null;
    }
    return response.data;
  },

  /**
   * Créer une nouvelle tribu
   */
  create: async (tribeData) => {
    const response = await api.post('/tribes.php', tribeData);
    return response.data;
  },

  /**
   * Mettre à jour une tribu
   */
  update: async (tribeData) => {
    const response = await api.put('/tribes.php', tribeData);
    if (import.meta.env.MODE !== 'production' && response.data.tribe) {
      response.data.tribe.banner_url = response.data.tribe.banner_url ? response.data.tribe.banner_url.replace('/api/', '/') : null;
      response.data.tribe.logo_url = response.data.tribe.logo_url ? response.data.tribe.logo_url.replace('/api/', '/') : null;
    }
    return response.data;
  },

  /**
   * Supprimer une tribu
   */
  delete: async (tribeId) => {
    const response = await api.delete(`/tribes.php?id=${tribeId}`);
    return response.data;
  },

  // Gestion des membres
  members: {
    /**
     * Récupérer les demandes en attente (pour le owner)
     */
    getRequests: async () => {
      const response = await api.get('/tribe-members.php');
      return response.data;
    },

    /**
     * Demander à rejoindre une tribu
     */
    requestJoin: async (tribeId, requestMessage) => {
      const response = await api.post('/tribe-members.php', {
        tribe_id: tribeId,
        request_message: requestMessage,
      });
      return response.data;
    },

    /**
     * Accepter ou refuser une demande
     */
    handleRequest: async (requestId, action) => {
      const response = await api.put('/tribe-members.php', {
        request_id: requestId,
        action, // 'accept' or 'reject'
      });
      return response.data;
    },

    /**
     * Quitter une tribu ou expulser un membre
     */
    remove: async (memberId) => {
      const response = await api.delete(`/tribe-members.php?member_id=${memberId}`);
      return response.data;
    },
  },

  /**
   * Transférer la propriété de la tribu à un autre membre
   */
  transferOwnership: async (newOwnerId) => {
    const response = await api.post('/tribe-transfer-ownership.php', {
      new_owner_id: newOwnerId,
    });
    return response.data;
  },

  /**
   * Upload de bannière ou logo
   */
  uploadImage: async (type, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post(`/tribe-upload.php?type=${type}`, formData);
    return response.data;
  },

  /**
   * Récupérer les derniers dinosaures modifiés
   */
  getRecentDinos: async (tribeId) => {
    const response = await api.get(`/dinosaurs.php?recent&tribe_id=${tribeId}`);
    return response.data;
  },
};

// ===========================
// ÉVÉNEMENTS
// ===========================

export const eventAPI = {
  /**
   * Récupérer tous les événements avec pagination
   */
  getAll: async (page = 1, limit = 20) => {
    const response = await api.get(`/events.php?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Récupérer un événement par ID avec ses images
   */
  getById: async (id) => {
    const response = await api.get(`/events.php?id=${id}`);
    return response.data;
  },

  /**
   * Créer un nouvel événement (admin only)
   */
  create: async (eventData) => {
    const formData = new FormData();
    formData.append('title', eventData.title);
    formData.append('description', eventData.description || '');
    formData.append('event_date', eventData.event_date);

    // Ajouter toutes les images
    eventData.images.forEach((image) => {
      formData.append('images[]', image);
    });

    const response = await api.post('/events.php', formData);
    return response.data;
  },

  /**
   * Mettre à jour un événement (admin only)
   */
  update: async (id, eventData) => {
    const response = await api.put(`/events.php?id=${id}`, eventData);
    return response.data;
  },

  /**
   * Supprimer un événement (admin only)
   */
  delete: async (id) => {
    const response = await api.delete(`/events.php?id=${id}`);
    return response.data;
  },
};

// ===========================
// ADMINISTRATION
// ===========================

export const adminAPI = {
  /**
   * Récupérer les statistiques du dashboard admin
   */
  getStats: async () => {
    const response = await api.get('/admin/stats.php');
    return response.data;
  },

  // Gestion des tribus
  tribes: {
    /**
     * Récupérer les tribus selon leur statut
     * @param {string} status - 'pending', 'approved' ou 'all'
     * @param {number} page - Numéro de page
     * @param {number} limit - Nombre de résultats par page
     */
    getAll: async (status = 'pending', page = 1, limit = 20) => {
      const response = await api.get(
        `/admin/tribes.php?status=${status}&page=${page}&limit=${limit}`
      );
      return response.data;
    },

    /**
     * Approuver une tribu
     * @param {number} tribeId - ID de la tribu
     */
    approve: async (tribeId) => {
      const response = await api.put('/admin/tribes.php', {
        tribe_id: tribeId,
        action: 'approve'
      });
      return response.data;
    },

    /**
     * Rejeter une tribu
     * @param {number} tribeId - ID de la tribu
     * @param {string} rejectionReason - Raison du rejet (optionnel)
     */
    reject: async (tribeId, rejectionReason = null) => {
      const response = await api.put('/admin/tribes.php', {
        tribe_id: tribeId,
        action: 'reject',
        rejection_reason: rejectionReason
      });
      return response.data;
    },

    /**
     * Supprimer une tribu (admin)
     * @param {number} tribeId - ID de la tribu
     */
    delete: async (tribeId) => {
      const response = await api.delete(`/admin/tribes.php?id=${tribeId}`);
      return response.data;
    }
  }
};

// ===========================
// TASKS
// ===========================

export const taskAPI = {
  /**
   * Récupérer les tâches de la tribu
   */
  getAll: async (status = 'pending') => {
    const response = await api.get(`/tasks.php?status=${status}`);
    return response.data;
  },

  /**
   * Récupérer le nombre de tâches en attente (for badge)
   */
  getPendingCount: async () => {
    const response = await api.get('/tasks.php?status=pending');
    return response.data.length;
  },

  /**
   * Marquer une tâche comme complète
   */
  complete: async (taskId) => {
    const response = await api.put(`/tasks.php?id=${taskId}`, {
      status: 'completed'
    });
    return response.data;
  },
};

export default api;
