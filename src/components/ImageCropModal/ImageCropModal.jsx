import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import '../../styles/components/image-crop-modal.scss';

const ImageCropModal = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleValidate = async () => {
    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (e) {
      console.error('Erreur lors du recadrage:', e);
    }
  };

  return (
    <div className="image-crop-modal">
      <div className="image-crop-modal__overlay" onClick={onCancel}></div>
      <div className="image-crop-modal__content">
        <div className="image-crop-modal__header">
          <h3 className="image-crop-modal__title">Recadrer l'image</h3>
          <button
            type="button"
            className="image-crop-modal__close"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        <div className="image-crop-modal__crop-area">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        <div className="image-crop-modal__controls">
          <div className="image-crop-modal__zoom">
            <label className="image-crop-modal__zoom-label">
              <span>🔍</span>
              <span>Zoom</span>
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="image-crop-modal__zoom-slider"
            />
          </div>
        </div>

        <div className="image-crop-modal__actions">
          <button
            type="button"
            className="image-crop-modal__btn image-crop-modal__btn--cancel"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            type="button"
            className="image-crop-modal__btn image-crop-modal__btn--validate"
            onClick={handleValidate}
          >
            ✓ Valider
          </button>
        </div>
      </div>
    </div>
  );
};

// Fonction utilitaire pour créer l'image recadrée
const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;

      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
      );

      // Convertir le canvas en blob
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        blob.name = 'cropped.jpg';
        const fileUrl = window.URL.createObjectURL(blob);
        resolve({ blob, url: fileUrl });
      }, 'image/jpeg', 0.95);
    };
    image.onerror = reject;
  });
};

export default ImageCropModal;
