import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

export const useDinosaurs = () => {
  const [dinos, setDinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger tous les dinosaures
  const fetchDinosaurs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.dinosaurs);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(API_ENDPOINTS.dinosaurs, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout');
      }

      const result = await response.json();

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
      const payload = {
        id: dinoId,
        ...updatedData
      };

      const response = await fetch(API_ENDPOINTS.dinosaurs, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }

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
      const response = await fetch(`${API_ENDPOINTS.dinosaurs}?id=${dinoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

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
