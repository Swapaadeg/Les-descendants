import { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';

/**
 * Hook pour gérer les tribus dans l'interface admin
 * @param {string} initialStatus - Statut initial ('pending', 'approved', 'all')
 * @returns {Object} État et fonctions de gestion des tribus
 */
export const useAdminTribes = (initialStatus = 'pending') => {
  const [tribes, setTribes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(initialStatus);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTribes = useCallback(async (page = currentPage) => {
    try {
      setLoading(true);
      const data = await adminAPI.tribes.getAll(status, page, 20);
      setTribes(data.tribes);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setTribes([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [status, currentPage]);

  const approveTribe = async (tribeId) => {
    try {
      await adminAPI.tribes.approve(tribeId);
      await fetchTribes(currentPage); // Refresh list
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const rejectTribe = async (tribeId, reason = null) => {
    try {
      await adminAPI.tribes.reject(tribeId, reason);
      await fetchTribes(currentPage); // Refresh list
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  const deleteTribe = async (tribeId) => {
    try {
      await adminAPI.tribes.delete(tribeId);
      await fetchTribes(currentPage); // Refresh list
    } catch (err) {
      throw new Error(err.response?.data?.message || err.message);
    }
  };

  // Refresh when status changes
  useEffect(() => {
    setCurrentPage(1);
    fetchTribes(1);
  }, [status]);

  // Refresh when page changes
  useEffect(() => {
    if (currentPage !== 1) {
      fetchTribes(currentPage);
    }
  }, [currentPage]);

  return {
    tribes,
    pagination,
    loading,
    error,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    approveTribe,
    rejectTribe,
    deleteTribe,
    refreshTribes: fetchTribes
  };
};
