import { useState, useCallback } from 'react';
import api from '../services/api';

export const usePendingRequests = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshPendingCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/tribes.php?pending_count=1');
      setPendingCount(response.data.count || 0);
    } catch (err) {
      console.error('Error fetching pending requests count:', err);
      setError(err);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pendingCount,
    loading,
    error,
    refreshPendingCount
  };
};

export default usePendingRequests;
