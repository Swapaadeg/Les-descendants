import React from 'react';
import './TribeCard.scss';

const TribeCard = ({ tribe, onApprove, onReject, showActions = true }) => {
  const formattedDate = new Date(tribe.created_at).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="tribe-card">
      <div className="tribe-card__header">
        <h3 className="tribe-card__name">{tribe.name}</h3>
        <span className={`tribe-card__status tribe-card__status--${tribe.is_validated ? 'approved' : 'pending'}`}>
          {tribe.is_validated ? '✓ Approuvée' : '⏳ En attente'}
        </span>
      </div>

      <div className="tribe-card__info">
        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Créateur :</span>
          <span className="tribe-card__info-value">
            {tribe.owner.username}
            {!tribe.owner.email_verified && (
              <span className="tribe-card__warning" title="Email non vérifié"> ⚠️</span>
            )}
          </span>
        </div>

        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Email :</span>
          <span className="tribe-card__info-value">{tribe.owner.email}</span>
        </div>

        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Membres :</span>
          <span className="tribe-card__info-value">{tribe.member_count}</span>
        </div>

        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Dinosaures :</span>
          <span className="tribe-card__info-value">🦖 {tribe.dino_count ?? 0}</span>
        </div>

        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Visibilité :</span>
          <span className="tribe-card__info-value">{tribe.is_public ? '🌐 Publique' : '🔒 Privée'}</span>
        </div>

        <div className="tribe-card__info-item">
          <span className="tribe-card__info-label">Date de création :</span>
          <span className="tribe-card__info-value">{formattedDate}</span>
        </div>
      </div>

      {tribe.description && (
        <div className="tribe-card__description">
          <p>{tribe.description}</p>
        </div>
      )}

      {showActions && !tribe.is_validated && (
        <div className="tribe-card__actions">
          <button
            className="tribe-card__btn tribe-card__btn--approve"
            onClick={() => onApprove(tribe.id)}
          >
            <span>✓</span> Approuver
          </button>
          <button
            className="tribe-card__btn tribe-card__btn--reject"
            onClick={() => onReject(tribe.id)}
          >
            <span>✗</span> Rejeter
          </button>
        </div>
      )}
    </div>
  );
};

export default TribeCard;
