import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEvents } from '../../hooks/useEvents';
import Header from '../../components/Header/Header';
import './CreateEvent.scss';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent } = useEvents();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Redirect si pas admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/events');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 10) {
      setError('Maximum 10 images par événement');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: files,
    }));

    // Générer les previews
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(setImagePreviews);
    setError(null);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Réorganiser les images
    const newImages = [...formData.images];
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // Réorganiser les previews
    const newPreviews = [...imagePreviews];
    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
    newPreviews.splice(dropIndex, 0, draggedPreview);

    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
    setDraggedIndex(null);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setFormData((prev) => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title || formData.title.trim().length < 3) {
      setError('Le titre doit contenir au moins 3 caractères');
      return;
    }

    if (!formData.event_date) {
      setError('La date est requise');
      return;
    }

    if (formData.images.length === 0) {
      setError('Au moins une image est requise');
      return;
    }

    try {
      setSubmitting(true);
      await createEvent(formData);
      navigate('/events');
    } catch (err) {
      setError(err.message || 'Erreur lors de la création de l\'événement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return null; // Loading ou redirect en cours
  }

  return (
    <>
      <Header />
      <div className="create-event">
        <div className="create-event__container">
          <div className="create-event__header">
            <button
              className="create-event__back"
              onClick={() => navigate('/events')}
            >
              ← Retour
            </button>
            <h1 className="create-event__title">Créer un événement</h1>
          </div>

          {error && (
            <div className="create-event__error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="create-event__form" onSubmit={handleSubmit}>
            <div className="create-event__field">
              <label htmlFor="title">
                Titre de l'événement <span className="create-event__required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={191}
                placeholder="Ex: Grande chasse au Giga"
                disabled={submitting}
              />
              <span className="create-event__hint">
                {formData.title.length}/191 caractères
              </span>
            </div>

            <div className="create-event__field">
              <label htmlFor="event_date">
                Date de l'événement <span className="create-event__required">*</span>
              </label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </div>

            <div className="create-event__field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                placeholder="Décrivez l'événement..."
                disabled={submitting}
              />
            </div>

            <div className="create-event__field">
              <label htmlFor="images">
                Images (1-10) <span className="create-event__required">*</span>
              </label>
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
                disabled={submitting}
                className="create-event__file-input"
              />
              <label htmlFor="images" className="create-event__file-label">
                <span className="create-event__file-icon">📸</span>
                {formData.images.length > 0
                  ? `${formData.images.length} image(s) sélectionnée(s)`
                  : 'Cliquer pour choisir des images'}
              </label>
              <span className="create-event__hint">
                Format JPG, PNG, GIF ou WebP. Maximum 5MB par image.
              </span>

              {imagePreviews.length > 0 && (
                <>
                  <div className="create-event__preview-hint">
                    💡 Glissez-déposez les images pour les réorganiser. La première sera l'image principale.
                  </div>
                  <div className="create-event__previews">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className={`create-event__preview ${draggedIndex === index ? 'create-event__preview--dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <img src={preview} alt={`Preview ${index + 1}`} />
                        <div className="create-event__preview-overlay">
                          <span className="create-event__preview-number">{index + 1}</span>
                          {index === 0 && (
                            <span className="create-event__preview-badge">⭐ Principale</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="create-event__preview-remove"
                            title="Retirer cette image"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="create-event__actions">
              <button
                type="button"
                onClick={() => navigate('/events')}
                className="create-event__btn create-event__btn--secondary"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="create-event__btn create-event__btn--primary"
              >
                {submitting ? 'Création en cours...' : 'Créer l\'événement'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateEvent;
