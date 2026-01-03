import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import Header from '../../components/Header/Header';
import Skeleton from '../../components/Skeleton/Skeleton';
import './EventsList.scss';

const EventsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const { events, pagination, loading, error } = useEvents(currentPage, 20);

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <div className="events-list">
        <div className="events-list__container">
          <div className="events-list__header">
            <h1 className="events-list__title">Événements du serveur</h1>
            {user?.is_admin && (
              <Link to="/events/create" className="events-list__btn-create">
                <span className="events-list__btn-icon">➕</span>
                Créer un événement
              </Link>
            )}
          </div>

          {loading && (
            <div className="events-list__grid">
              <Skeleton count={6} height={250} />
            </div>
          )}

          {error && !loading && (
            <div className="events-list__error">
              <span className="events-list__error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="events-list__empty">
              <span className="events-list__empty-icon">📅</span>
              <h2>Aucun événement pour le moment</h2>
              <p>Les événements du serveur apparaîtront ici</p>
              {user?.is_admin && (
                <Link to="/events/create" className="events-list__btn-empty">
                  Créer le premier événement
                </Link>
              )}
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <>
              <div className="events-list__grid">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="event-card"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="event-card__image">
                      {event.thumbnail_url ? (
                        <img src={event.thumbnail_url} alt={event.title} />
                      ) : (
                        <div className="event-card__placeholder">
                          <span>📸</span>
                        </div>
                      )}
                      {event.image_count > 1 && (
                        <div className="event-card__badge">
                          {event.image_count} photos
                        </div>
                      )}
                    </div>
                    <div className="event-card__content">
                      <h3 className="event-card__title">{event.title}</h3>
                      <p className="event-card__date">
                        📅 {new Date(event.event_date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      {event.description && (
                        <p className="event-card__description">
                          {event.description.length > 100
                            ? event.description.substring(0, 100) + '...'
                            : event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.total_pages > 1 && (
                <div className="events-list__pagination">
                  <button
                    className="pagination__btn"
                    disabled={!pagination.has_prev}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    ← Précédent
                  </button>
                  <span className="pagination__info">
                    Page {pagination.current_page} / {pagination.total_pages}
                    <span className="pagination__total">
                      ({pagination.total_events} événements)
                    </span>
                  </span>
                  <button
                    className="pagination__btn"
                    disabled={!pagination.has_next}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default EventsList;
