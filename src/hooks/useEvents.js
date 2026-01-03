import { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';

/**
 * Hook pour gérer la liste des événements avec pagination
 */
export const useEvents = (page = 1, limit = 20) => {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = async (pageNum = page) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventAPI.getAll(pageNum, limit);
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Erreur chargement événements:', error);
      setError(error.response?.data?.error || error.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(page);
  }, [page, limit]);

  const createEvent = async (eventData) => {
    try {
      const result = await eventAPI.create(eventData);
      await fetchEvents(1); // Refresh à la page 1
      return result;
    } catch (error) {
      console.error('Erreur création événement:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de création';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const result = await eventAPI.update(id, eventData);
      await fetchEvents(page); // Refresh current page
      return result;
    } catch (error) {
      console.error('Erreur modification événement:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de modification';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteEvent = async (id) => {
    try {
      const result = await eventAPI.delete(id);
      await fetchEvents(page); // Refresh current page
      return result;
    } catch (error) {
      console.error('Erreur suppression événement:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    events,
    pagination,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};

/**
 * Hook pour gérer le détail d'un événement
 */
export const useEventDetail = (eventId) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await eventAPI.getById(eventId);
        setEvent(data);
      } catch (error) {
        console.error('Erreur chargement événement:', error);
        setError(error.response?.data?.error || error.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  return { event, loading, error };
};
