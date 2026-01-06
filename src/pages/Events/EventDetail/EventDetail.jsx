import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import { useAuth } from '../../../contexts/AuthContext';
import { useEventDetail } from '../../../hooks/useEvents';
import { eventAPI } from '../../../services/api';
import { getImageUrl } from '../../../config/api';
import Header from '../../../components/Header/Header';
import Skeleton from '../../../components/Skeleton/Skeleton';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './EventDetail.scss';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { event, loading, error } = useEventDetail(id);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      return;
    }

    try {
      setDeleting(true);
      await eventAPI.delete(id);
      navigate('/events');
    } catch (err) {
      alert('Erreur lors de la suppression : ' + (err.response?.data?.error || err.message));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="event-detail">
          <div className="event-detail__container">
            <Skeleton height={60} />
            <Skeleton height={400} />
            <Skeleton count={3} />
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <div className="event-detail">
          <div className="event-detail__container">
            <div className="event-detail__error">
              <span className="event-detail__error-icon">⚠️</span>
              <h2>Événement introuvable</h2>
              <p>{error || 'Cet événement n\'existe pas ou a été supprimé.'}</p>
              <button onClick={() => navigate('/events')} className="event-detail__btn-back-error">
                ← Retour aux événements
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="event-detail">
        <div className="event-detail__container">
          <div className="event-detail__header">
            <button
              className="event-detail__back"
              onClick={() => navigate('/events')}
            >
              ← Retour aux événements
            </button>

            {user?.is_admin && (
              <div className="event-detail__actions">
                <Link
                  to={`/events/${id}/edit`}
                  className="event-detail__btn event-detail__btn--edit"
                >
                  ✏️ Modifier
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="event-detail__btn event-detail__btn--delete"
                >
                  {deleting ? 'Suppression...' : '🗑️ Supprimer'}
                </button>
              </div>
            )}
          </div>

          <h1 className="event-detail__title">{event.title}</h1>

          <div className="event-detail__meta">
            <span className="event-detail__date">
              📅 {new Date(event.event_date).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            {event.images && event.images.length > 0 && (
              <span className="event-detail__photo-count">
                📸 {event.images.length} photo{event.images.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {event.images && event.images.length > 0 && (
            <div className="event-detail__carousel">
              <Swiper
                modules={[Navigation, Pagination, Keyboard]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                keyboard={{ enabled: true }}
                loop={event.images.length > 1}
                className="event-swiper"
              >
                {event.images.map((image) => (
                  <SwiperSlide key={image.id}>
                    <div className="event-detail__slide">
                      <img
                        src={getImageUrl(image.image_url)}
                        alt={`${event.title} - Image ${image.display_order + 1}`}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {event.description && (
            <div className="event-detail__description">
              <h2 className="event-detail__description-title">Description</h2>
              <p className="event-detail__description-text">{event.description}</p>
            </div>
          )}

          <div className="event-detail__footer">
            <p className="event-detail__created">
              Ajouté le {new Date(event.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetail;
