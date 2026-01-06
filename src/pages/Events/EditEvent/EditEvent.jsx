import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useEvents, useEventDetail } from '../../../hooks/useEvents';
import { getImageUrl } from '../../../config/api';
import Header from '../../../components/Header/Header';
import './EditEvent.scss';

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { updateEvent } = useEvents();
  const { event, loading, error: loadError } = useEventDetail(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
  });

  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Redirect si pas admin
  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/events');
    }
  }, [user, navigate]);

  // Pré-remplir le formulaire quand l'événement est chargé
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        event_date: event.event_date || '',
      });
      setExistingImages(event.images || []);
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteExistingImage = (imageId) => {
    setImagesToDelete((prev) => [...prev, imageId]);
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + newImages.length + files.length;

    if (totalImages > 10) {
      setError('Maximum 10 images par événement');
      return;
    }

    setNewImages((prev) => [...prev, ...files]);

    // Générer les previews pour les nouvelles images
    const previews = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then((results) => {
      setNewImagePreviews((prev) => [...prev, ...results]);
    });
    setError(null);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Réorganiser les images existantes
    const newOrder = [...existingImages];
    const [draggedImage] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, draggedImage);

    // Mettre à jour le display_order
    const reorderedImages = newOrder.map((img, index) => ({
      ...img,
      display_order: index,
    }));

    setExistingImages(reorderedImages);
    setDraggedIndex(null);
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

    // Vérifier qu'il reste au moins une image après suppression
    const remainingImages = existingImages.length + newImages.length;
    if (remainingImages === 0) {
      setError('Au moins une image est requise');
      return;
    }

    try {
      setSubmitting(true);

      // Préparer les données pour l'update
      const updateData = {
        ...formData,
        imagesToDelete,
        images: newImages, // Renommer newImages -> images pour l'API
        imageOrder: existingImages.map((img, index) => ({ id: img.id, display_order: index })),
      };

      const response = await updateEvent(id, updateData);
      
      // Vérifier s'il y a des erreurs d'upload
      if (response.upload_errors && response.upload_errors.length > 0) {
        setError(`Événement modifié mais erreurs d'upload:\n${response.upload_errors.join('\n')}`);
        // Attendre 3 secondes avant de naviguer pour que l'utilisateur voie l'erreur
        setTimeout(() => navigate(`/events/${id}`), 3000);
      } else {
        navigate(`/events/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification de l\'événement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return null; // Loading ou redirect en cours
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="edit-event">
          <div className="edit-event__container">
            <div className="edit-event__loading">
              <div className="edit-event__loading-spinner">⏳</div>
              <p>Chargement de l'événement...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (loadError || !event) {
    return (
      <>
        <Header />
        <div className="edit-event">
          <div className="edit-event__container">
            <div className="edit-event__error">
              <span>⚠️</span> {loadError || 'Événement introuvable'}
            </div>
            <button
              className="edit-event__btn edit-event__btn--secondary"
              onClick={() => navigate('/events')}
            >
              Retour aux événements
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="edit-event">
        <div className="edit-event__container">
          <div className="edit-event__header">
            <button
              className="edit-event__back"
              onClick={() => navigate(`/events/${id}`)}
            >
              ← Retour
            </button>
            <h1 className="edit-event__title">Modifier l'événement</h1>
          </div>

          {error && (
            <div className="edit-event__error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="edit-event__form" onSubmit={handleSubmit}>
            <div className="edit-event__field">
              <label htmlFor="title">
                Titre de l'événement <span className="edit-event__required">*</span>
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
              <span className="edit-event__hint">
                {formData.title.length}/191 caractères
              </span>
            </div>

            <div className="edit-event__field">
              <label htmlFor="event_date">
                Date de l'événement <span className="edit-event__required">*</span>
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

            <div className="edit-event__field">
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

            {/* Images existantes */}
            {existingImages.length > 0 && (
              <div className="edit-event__field">
                <label>Images actuelles ({existingImages.length})</label>
                <div className="edit-event__preview-hint">
                  💡 Glissez-déposez les images pour les réorganiser. La première sera l'image principale.
                </div>
                <div className="edit-event__existing-images">
                  {existingImages.map((image, index) => (
                    <div
                      key={image.id}
                      className={`edit-event__existing-image ${draggedIndex === index ? 'edit-event__existing-image--dragging' : ''}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)}
                    >
                      <img src={getImageUrl(image.image_url)} alt={`Image ${index + 1}`} />
                      <div className="edit-event__image-overlay">
                        <span className="edit-event__image-number">{index + 1}</span>
                        {index === 0 && (
                          <span className="edit-event__image-badge-main">⭐ Principale</span>
                        )}
                        <button
                          type="button"
                          className="edit-event__delete-image"
                          onClick={() => handleDeleteExistingImage(image.id)}
                          disabled={submitting}
                          title="Supprimer cette image"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nouvelles images à ajouter */}
            <div className="edit-event__field">
              <label htmlFor="new_images">
                Ajouter de nouvelles images
                {existingImages.length + newImages.length < 10 && (
                  <span className="edit-event__hint-inline">
                    ({existingImages.length + newImages.length}/10)
                  </span>
                )}
              </label>
              <input
                type="file"
                id="new_images"
                accept="image/*"
                multiple
                onChange={handleNewImageChange}
                disabled={submitting || existingImages.length + newImages.length >= 10}
                className="edit-event__file-input"
              />
              <label
                htmlFor="new_images"
                className={`edit-event__file-label ${
                  existingImages.length + newImages.length >= 10 ? 'edit-event__file-label--disabled' : ''
                }`}
              >
                <span className="edit-event__file-icon">📸</span>
                {existingImages.length + newImages.length >= 10
                  ? 'Maximum d\'images atteint (10)'
                  : newImages.length > 0
                  ? `${newImages.length} nouvelle(s) image(s) à ajouter`
                  : 'Cliquer pour ajouter des images'}
              </label>
              <span className="edit-event__hint">
                Format JPG, PNG, GIF ou WebP. Maximum 5MB par image.
              </span>

              {newImagePreviews.length > 0 && (
                <div className="edit-event__new-images">
                  {newImagePreviews.map((preview, index) => (
                    <div key={index} className="edit-event__new-image">
                      <img src={preview} alt={`Nouvelle image ${index + 1}`} />
                      <button
                        type="button"
                        className="edit-event__delete-image"
                        onClick={() => handleRemoveNewImage(index)}
                        disabled={submitting}
                        title="Retirer cette image"
                      >
                        ✕
                      </button>
                      <span className="edit-event__image-badge">Nouveau</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="edit-event__actions">
              <button
                type="button"
                onClick={() => navigate(`/events/${id}`)}
                className="edit-event__btn edit-event__btn--secondary"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="edit-event__btn edit-event__btn--primary"
              >
                {submitting ? 'Modification en cours...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditEvent;
