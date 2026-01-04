import React from 'react';
import dinoTypes from '../../data/types';
import { baseStats, shouldIgnoreOxygen, calculateLevel, calculateTotalLevel } from '../../data/stats';
import './DinoCardCompact.scss';

const DinoCardCompact = ({ dino }) => {
  const isAquatic = shouldIgnoreOxygen(dino.typeIds, dinoTypes);
  const hasPhoto = dino.photoUrl;
  const photoSrc = dino.photoUrl;

  // Calculer les niveaux
  const baseLevel = calculateLevel(dino.stats, dino.species, isAquatic);
  const totalLevel = dino.isMutated
    ? calculateTotalLevel(dino.stats, dino.mutatedStats, dino.species, isAquatic)
    : null;

  const renderStatCompact = (stat, baseValue, mutatedValue = null) => {
    // Ne pas afficher l'oxygène pour les dinos aquatiques
    if (stat.id === 'oxygen' && isAquatic) return null;

    return (
      <div key={stat.id} className="dino-compact__stat">
        <span className="dino-compact__stat-icon" style={{ color: stat.color }}>
          {stat.icon}
        </span>
        <div className="dino-compact__stat-values">
          <span className="dino-compact__stat-value">{baseValue || 0}</span>
          {dino.isMutated && mutatedValue !== null && (
            <span className="dino-compact__stat-value dino-compact__stat-value--mutated">
              {mutatedValue || 0}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <article className="dino-compact">
      {/* Badge muté */}
      {dino.isMutated && (
        <div className="dino-compact__mutated-badge">✨</div>
      )}

      {/* Photo miniature */}
      {hasPhoto && (
        <div className="dino-compact__photo">
          <img src={photoSrc} alt={dino.species} />
        </div>
      )}

      {/* Header compact */}
      <div className="dino-compact__header">
        <h3 className="dino-compact__title">{dino.species}</h3>

        {/* Niveau en ligne */}
        <div className="dino-compact__level">
          {dino.isMutated ? (
            <>
              <span className="dino-compact__level-value">Niv. {baseLevel}</span>
              <span className="dino-compact__level-separator">→</span>
              <span className="dino-compact__level-value dino-compact__level-value--mutated">
                {totalLevel}
              </span>
            </>
          ) : (
            <span className="dino-compact__level-value">Niveau {baseLevel}</span>
          )}
        </div>

        {/* Types en ligne */}
        <div className="dino-compact__types">
          {dino.typeIds.map(typeId => {
            const type = dinoTypes.find(t => t.id === typeId);
            return type ? (
              <span key={type.id} className="dino-compact__type" style={{ color: type.color }}>
                {type.icon}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Stats en grille compacte */}
      <div className="dino-compact__stats">
        {baseStats.map(stat => renderStatCompact(
          stat,
          dino.stats[stat.id],
          dino.isMutated ? dino.mutatedStats[stat.id] : null
        ))}
      </div>
    </article>
  );
};

export default DinoCardCompact;
