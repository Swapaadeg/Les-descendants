/**
 * Contexte d'authentification - Arki'Family
 * Gère l'état global de l'utilisateur connecté
 */

import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Vérifier que le token est encore valide en récupérant les infos utilisateur
          const userData = await authAPI.me();
          setUser(userData.user);
        } catch (err) {
          // Token invalide ou expiré
          console.error('Erreur de chargement utilisateur:', err);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  /**
   * Inscription d'un nouvel utilisateur
   */
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.register(userData);
      // Note: L'utilisateur n'est pas automatiquement connecté après l'inscription
      // Il doit d'abord confirmer son email
      return response;
    } catch (err) {
      let errorData = err.response?.data;

      // Si la réponse est une chaîne, essayer d'extraire le JSON
      if (typeof errorData === 'string') {
        const jsonMatch = errorData.match(/\{.*\}$/);
        if (jsonMatch) {
          try {
            errorData = JSON.parse(jsonMatch[0]);
          } catch (e) {
            console.error('Impossible de parser le JSON:', e);
          }
        }
      }

      const errorMessage = errorData?.error || 'Erreur lors de l\'inscription';
      setError(errorMessage);

      // Passer l'erreur avec les détails
      const error = new Error(errorMessage);
      // Ajouter les détails directement sur l'erreur
      if (errorData?.details) {
        error.details = errorData.details;
      }
      throw error;
    }
  };

  /**
   * Connexion utilisateur
   */
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);

      // Vérifier que response et response.user existent
      if (!response || !response.user) {
        throw new Error('Réponse invalide du serveur');
      }

      if (!response.user.email_verified) {
        throw new Error('Tu dois confirmer ton email avant de te connecter. Vérifie ta boîte mail !');
      }

      setUser(response.user);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Déconnexion utilisateur
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  };

  /**
   * Vérifier l'email avec le token
   */
  const verifyEmail = async (token) => {
    try {
      setError(null);
      const response = await authAPI.verifyEmail(token);
      // L'utilisateur est connecté automatiquement après vérification
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Erreur lors de la vérification de l\'email';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Demander un nouveau lien de vérification
   */
  const resendVerification = async (email) => {
    try {
      setError(null);
      const response = await authAPI.resendVerification(email);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Demander une réinitialisation de mot de passe
   */
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      const response = await authAPI.requestPasswordReset(email);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Erreur lors de la demande de réinitialisation';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Réinitialiser le mot de passe
   */
  const resetPassword = async (token, password, password_confirm) => {
    try {
      setError(null);
      const response = await authAPI.resetPassword(token, password, password_confirm);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Mettre à jour les informations utilisateur (après modification du profil)
   */
  const updateUser = (newUserData) => {
    setUser((prev) => ({ ...prev, ...newUserData }));
    localStorage.setItem('user', JSON.stringify({ ...user, ...newUserData }));
  };

  /**
   * Rafraîchir les données utilisateur depuis le serveur
   */
  const refreshUser = async () => {
    try {
      const userData = await authAPI.me();
      setUser(userData.user);
      localStorage.setItem('user', JSON.stringify(userData.user));
      return userData.user;
    } catch (err) {
      console.error('Erreur de rafraîchissement utilisateur:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    resetPassword,
    updateUser,
    refreshUser,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
