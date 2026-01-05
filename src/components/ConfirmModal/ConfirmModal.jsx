import React from 'react';
import './ConfirmModal.scss';

const ConfirmModal = ({
  isOpen,
  title = 'Confirmation',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  confirmButtonClass = 'confirm',
  isDangerous = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal__header">
          <h3>{title}</h3>
        </div>

        <div className="confirm-modal__body">
          <p>{message}</p>
        </div>

        <div className="confirm-modal__actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`btn btn-${isDangerous ? 'danger' : confirmButtonClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
