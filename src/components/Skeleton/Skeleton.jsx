import React from 'react';
import '../../styles/components/skeleton.scss';

/**
 * Composant Skeleton générique pour les états de chargement
 */
export const Skeleton = ({ width = '100%', height = '20px', variant = 'rectangular', className = '' }) => {
  const variantClass = `skeleton--${variant}`;

  return (
    <div
      className={`skeleton ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
};

/**
 * Skeleton pour une card de dinosaure
 */
export const DinoCardSkeleton = () => {
  return (
    <div className="dino-card-skeleton">
      {/* Photo */}
      <Skeleton variant="rectangular" height="200px" className="dino-card-skeleton__photo" />

      {/* Header */}
      <div className="dino-card-skeleton__header">
        <Skeleton width="60%" height="24px" />
        <Skeleton variant="circular" width="30px" height="30px" />
      </div>

      {/* Level */}
      <div className="dino-card-skeleton__level">
        <Skeleton width="80px" height="18px" />
      </div>

      {/* Types */}
      <div className="dino-card-skeleton__types">
        <Skeleton width="60px" height="24px" className="dino-card-skeleton__type" />
        <Skeleton width="60px" height="24px" className="dino-card-skeleton__type" />
      </div>

      {/* Stats grid */}
      <div className="dino-card-skeleton__stats">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="dino-card-skeleton__stat">
            <Skeleton width="100%" height="40px" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton pour la page tribu complète
 */
export const TribeSkeleton = () => {
  return (
    <div className="tribe-skeleton">
      {/* Bannière */}
      <Skeleton variant="rectangular" height="300px" className="tribe-skeleton__banner" />

      {/* Logo (overlap sur bannière) */}
      <div className="tribe-skeleton__logo-container">
        <Skeleton variant="circular" width="150px" height="150px" />
      </div>

      {/* Infos tribu */}
      <div className="tribe-skeleton__info">
        <Skeleton width="200px" height="32px" className="tribe-skeleton__title" />
        <Skeleton width="100%" height="60px" className="tribe-skeleton__description" />
        <Skeleton width="150px" height="20px" />
      </div>

      {/* Boutons d'action */}
      <div className="tribe-skeleton__actions">
        <Skeleton width="200px" height="48px" />
        <Skeleton width="200px" height="48px" />
        <Skeleton width="200px" height="48px" />
      </div>

      {/* Section derniers dinos */}
      <div className="tribe-skeleton__section">
        <Skeleton width="250px" height="28px" className="tribe-skeleton__section-title" />
        <div className="tribe-skeleton__dinos">
          {[...Array(3)].map((_, i) => (
            <DinoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
