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

      // Rafraîchir la liste
      await fetchDinosaurs();
    } catch (error) {
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

  return {
    dinos,
    loading,
    error,
    addDinosaur,
    updateDinosaur,
    deleteDinosaur,
    refreshDinosaurs: fetchDinosaurs
  };
};

export default useDinosaurs;
