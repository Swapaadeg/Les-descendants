import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

/**
 * Hook pour récupérer les statistiques du dashboard admin
 * @returns {Object} { stats, loading, error, refreshStats }
 */
export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getStats();
      console.log('[useAdminStats] Data received from API:', data);
      console.log('[useAdminStats] stats object:', data.stats);
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('[useAdminStats] Error fetching stats:', err);
      console.error('[useAdminStats] Error response:', err.response);
      setError(err.response?.data?.error || err.response?.data?.message || err.message);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};
