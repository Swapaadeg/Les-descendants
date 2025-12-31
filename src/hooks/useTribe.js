import { useState, useEffect, useCallback } from 'react';
import { tribeAPI } from '../services/api';

/**
 * Hook personnalisé pour gérer l'état de la tribu
 */
export const useTribe = () => {
  const [tribe, setTribe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les données de la tribu
  const loadTribe = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tribeAPI.getMy();
      // Inclure les membres dans l'objet tribu
      setTribe({
        ...data.tribe,
        members: data.members || []
      });
    } catch (err) {
      console.error('Erreur lors du chargement de la tribu:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement de la tribu');
      setTribe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger au montage
  useEffect(() => {
    loadTribe();
  }, [loadTribe]);

  // Mettre à jour la tribu
  const updateTribe = useCallback(async (updates) => {
    try {
      setError(null);
      // Ajouter l'ID de la tribu aux updates
      const updateData = {
        id: tribe?.id,
        ...updates
      };
      await tribeAPI.update(updateData);
      // Recharger les données après la mise à jour
      await loadTribe();
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      const errorMessage = err.response?.data?.error || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [loadTribe, tribe]);

  // Rafraîchir manuellement
  const refreshTribe = useCallback(() => {
    loadTribe();
  }, [loadTribe]);

  return {
    tribe,
    loading,
    error,
    updateTribe,
    refreshTribe
  };
};

export default useTribe;
