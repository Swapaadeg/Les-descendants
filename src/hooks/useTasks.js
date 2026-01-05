import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';

/**
 * Hook personnalisé pour gérer les tâches de dinosaures
 * @param {string} status - Filtre de statut ('pending', 'completed', 'all')
 */
export const useTasks = (status = 'pending') => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  // Charger toutes les tâches selon le statut
  const fetchTasks = async () => {
    // Ne pas charger si pas de token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await taskAPI.getAll(status);
      setTasks(data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors du chargement des tâches:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Charger le nombre de tâches en attente (pour le badge)
  const fetchPendingCount = async () => {
    // Ne pas charger si pas de token
    const token = localStorage.getItem('authToken');
    if (!token) {
      setPendingCount(0);
      return;
    }

    try {
      const count = await taskAPI.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Erreur lors du comptage des tâches:', error);
    }
  };

  // Charger les tâches au montage du composant
  useEffect(() => {
    fetchTasks();
  }, [status]);

  // Marquer une tâche comme complète
  const completeTask = async (taskId) => {
    try {
      await taskAPI.complete(taskId);

      // Mise à jour optimiste de l'état local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: 'completed', completedAt: new Date().toISOString() }
            : task
        )
      );

      // Rafraîchir le compteur de tâches en attente
      await fetchPendingCount();
    } catch (error) {
      // En cas d'erreur, recharger pour avoir l'état correct
      await fetchTasks();
      console.error('Erreur lors de la complétion de la tâche:', error);
      setError(error.message);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    error,
    pendingCount,
    completeTask,
    refreshTasks: fetchTasks,
    refreshPendingCount: fetchPendingCount
  };
};

export default useTasks;
