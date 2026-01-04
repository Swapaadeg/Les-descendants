import { useState, useEffect } from 'react';
import { dinoAPI } from '../services/api';

export const useDinosaurs = () => {
  const [dinos, setDinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger tous les dinosaures
  const fetchDinosaurs = async () => {
    try {
      setLoading(true);
      const data = await dinoAPI.getAll();
      setDinos(data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des dinosaures:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger les dinosaures au montage du composant
  useEffect(() => {
    fetchDinosaurs();
  }, []);

  // Ajouter un dinosaure
  const addDinosaur = async (dinoData) => {
    try {
      const result = await dinoAPI.create(dinoData);

      // Rafraîchir la liste
      await fetchDinosaurs();

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du dinosaure:', error);
      setError(error.message);
      throw error;
    }
  };

  // Mettre à jour un dinosaure
  const updateDinosaur = async (dinoId, updatedData) => {
    try {
      await dinoAPI.update(dinoId, updatedData);

      // Mise à jour optimiste avec merge profond pour les objets imbriqués
      setDinos(prevDinos =>
        prevDinos.map(dino => {
          if (dino.id !== dinoId) return dino;

          // Merge profond des stats et mutatedStats
          const updated = { ...dino };

          if (updatedData.stats) {
            updated.stats = { ...dino.stats, ...updatedData.stats };
          }

          if (updatedData.mutatedStats) {
            updated.mutatedStats = { ...dino.mutatedStats, ...updatedData.mutatedStats };
          }

          // Autres propriétés (is_featured, etc.)
          if (updatedData.isFeatured !== undefined) {
            updated.isFeatured = updatedData.isFeatured;
          }

          return updated;
        })
      );
    } catch (error) {
      // En cas d'erreur, recharger pour avoir l'état correct
      await fetchDinosaurs();
      console.error('Erreur lors de la mise à jour du dinosaure:', error);
      setError(error.message);
      throw error;
    }
  };

  // Supprimer un dinosaure
  const deleteDinosaur = async (dinoId) => {
    try {
      await dinoAPI.delete(dinoId);

      // Rafraîchir la liste
      await fetchDinosaurs();
    } catch (error) {
      console.error('Erreur lors de la suppression du dinosaure:', error);
      setError(error.message);
      throw error;
    }
  };

  // Toggle le statut featured d'un dinosaure
  const toggleFeatured = async (dinoId, isFeatured) => {
    try {
      await dinoAPI.toggleFeatured(dinoId, isFeatured);

      // Mise à jour optimiste de l'état local
      setDinos(prevDinos =>
        prevDinos.map(dino =>
          dino.id === dinoId
            ? { ...dino, isFeatured }
            : dino
        )
      );
    } catch (error) {
      // En cas d'erreur, recharger pour avoir l'état correct
      await fetchDinosaurs();
      console.error('Erreur lors de la mise à jour du statut featured:', error);
      setError(error.message);
      throw error;
    }
  };

  return {
    dinos,
    loading,
    error,
    addDinosaur,
    updateDinosaur,
    deleteDinosaur,
    toggleFeatured,
    refreshDinosaurs: fetchDinosaurs
  };
};

export default useDinosaurs;
