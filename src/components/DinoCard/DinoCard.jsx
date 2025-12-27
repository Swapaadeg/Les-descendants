import React, { useState } from 'react';
import dinoTypes from '../../data/types';
import { baseStats, shouldIgnoreOxygen, calculateLevel, calculateTotalLevel } from '../../data/stats';
import './DinoCard.scss';

const DinoCard = ({ dino, onUpdate, onDelete }) => {
  const [editingStats, setEditingStats] = useState({});
  const [tempValues, setTempValues] = useState({});

  const isAquatic = shouldIgnoreOxygen(dino.typeIds, dinoTypes);
  const hasPhoto = dino.photoUrl;
  const photoSrc = dino.photoUrl;

  // Calculer les niveaux
  const baseLevel = calculateLevel(dino.stats, dino.species, isAquatic);
  const totalLevel = dino.isMutated
    ? calculateTotalLevel(dino.stats, dino.mutatedStats, dino.species, isAquatic)
    : null;

  const startEditing = (statId, currentValue, isMutated = false) => {
    const key = `${statId}-${isMutated}`;
    setEditingStats(prev => ({ ...prev, [key]: true }));
    setTempValues(prev => ({ ...prev, [key]: currentValue || '' }));
  };

  const cancelEditing = (statId, isMutated = false) => {
    const key = `${statId}-${isMutated}`;
    setEditingStats(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
    setTempValues(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };

  const saveEdit = (statId, isMutated = false) => {
    const key = `${statId}-${isMutated}`;
    const newValue = tempValues[key];

    const field = isMutated ? 'mutatedStats' : 'stats';
    onUpdate(dino.id, {
      [field]: {
        ...dino[field],
        [statId]: newValue
      }
    });

    cancelEditing(statId, isMutated);
  };

  const handleKeyPress = (e, statId, isMutated) => {
    if (e.key === 'Enter') {
      saveEdit(statId, isMutated);
    } else if (e.key === 'Escape') {
      cancelEditing(statId, isMutated);
    }
  };

  const renderStat = (stat, baseValue, mutatedValue = null) => {
    // Ne pas afficher l'oxygène pour les dinos aquatiques
    if (stat.id === 'oxygen' && isAquatic) return null;

    const baseKey = `${stat.id}-false`;
    const mutatedKey = `${stat.id}-true`;
    const isEditingBase = editingStats[baseKey];
    const isEditingMutated = editingStats[mutatedKey];

    return (
      <div
        key={stat.id}
        className={`dino-card__stat ${dino.isMutated ? 'dino-card__stat--has-mutation' : ''}`}
        style={{ '--stat-color': stat.color }}
      >
        <div className="dino-card__stat-header">
          <span className="dino-card__stat-icon">{stat.icon}</span>
          <span className="dino-card__stat-name">{stat.name}</span>
        </div>

        {/* Stat de base */}
        <div className="dino-card__stat-row">
          {dino.isMutated && <span className="dino-card__stat-label">Base:</span>}
          {isEditingBase ? (
            <div className="dino-card__stat-edit">
              <input
                type="number"
                className="dino-card__stat-input"
                value={tempValues[baseKey]}
                onChange={(e) => setTempValues(prev => ({ ...prev, [baseKey]: e.target.value }))}
                onKeyDown={(e) => handleKeyPress(e, stat.id, false)}
                autoFocus
                min="0"
              />
              <div className="dino-card__stat-actions">
                <button
                  className="dino-card__stat-btn dino-card__stat-btn--save"
                  onClick={() => saveEdit(stat.id, false)}
                  title="Sauvegarder"
                >
                  ✓
                </button>
                <button
                  className="dino-card__stat-btn dino-card__stat-btn--cancel"
                  onClick={() => cancelEditing(stat.id, false)}
                  title="Annuler"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div
              className="dino-card__stat-value"
              onClick={() => startEditing(stat.id, baseValue, false)}
              title="Cliquer pour modifier"
            >
              {baseValue || baseValue === 0 ? baseValue : '—'}
              <span className="dino-card__stat-edit-icon">✎</span>
            </div>
          )}
        </div>

        {/* Stat mutée */}
        {dino.isMutated && (
          <div className="dino-card__stat-row dino-card__stat-row--mutated">
            <span className="dino-card__stat-label">Muté:</span>
            {isEditingMutated ? (
              <div className="dino-card__stat-edit">
                <input
                  type="number"
                  className="dino-card__stat-input"
                  value={tempValues[mutatedKey]}
                  onChange={(e) => setTempValues(prev => ({ ...prev, [mutatedKey]: e.target.value }))}
                  onKeyDown={(e) => handleKeyPress(e, stat.id, true)}
                  autoFocus
                  min="0"
                />
                <div className="dino-card__stat-actions">
                  <button
                    className="dino-card__stat-btn dino-card__stat-btn--save"
                    onClick={() => saveEdit(stat.id, true)}
                    title="Sauvegarder"
                  >
                    ✓
                  </button>
                  <button
                    className="dino-card__stat-btn dino-card__stat-btn--cancel"
                    onClick={() => cancelEditing(stat.id, true)}
                    title="Annuler"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="dino-card__stat-value dino-card__stat-value--mutated"
                onClick={() => startEditing(stat.id, mutatedValue, true)}
                title="Cliquer pour modifier"
              >
                {mutatedValue || mutatedValue === 0 ? mutatedValue : '—'}
                <span className="dino-card__stat-edit-icon">✎</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <article className="dino-card">
      {/* Bouton de suppression */}
      <button
        className="dino-card__delete-btn"
        onClick={() => onDelete(dino.id)}
        title="Supprimer ce dinosaure"
      >
        🗑️
      </button>

      {/* Badge muté */}
      {dino.isMutated && (
        <div className="dino-card__mutated-badge">
          ✨ MUTÉ
        </div>
      )}

      {/* Photo */}
      {hasPhoto && (
        <div className="dino-card__photo">
          <img src={photoSrc} alt={dino.species} />
        </div>
      )}

      {/* Header */}
      <div className="dino-card__header">
        <h3 className="dino-card__title">{dino.species}</h3>

        {/* Niveau */}
        <div className="dino-card__level">
          {dino.isMutated ? (
            <>
              <div className="dino-card__level-item">
                <span className="dino-card__level-label">Niveau (sans muta)</span>
                <span className="dino-card__level-value dino-card__level-value--base">
                  {baseLevel}
                </span>
              </div>
              <div className="dino-card__level-item dino-card__level-item--mutated">
                <span className="dino-card__level-label">Niveau (avec muta)</span>
                <span className="dino-card__level-value dino-card__level-value--mutated">
                  {totalLevel}
                </span>
              </div>
            </>
          ) : (
            <div className="dino-card__level-item">
              <span className="dino-card__level-label">Niveau</span>
              <span className="dino-card__level-value dino-card__level-value--base">
                {baseLevel}
              </span>
            </div>
          )}
        </div>

        {/* Types */}
        <div className="dino-card__types">
          {dino.typeIds.map(typeId => {
            const type = dinoTypes.find(t => t.id === typeId);
            return type ? (
              <span
                key={type.id}
                className="dino-card__type"
                style={{ '--type-color': type.color }}
              >
                {type.icon} {type.name}
              </span>
            ) : null;
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="dino-card__stats">
        <h4 className="dino-card__stats-title">Stats</h4>
        <div className="dino-card__stats-grid">
          {baseStats.map(stat => renderStat(
            stat,
            dino.stats[stat.id],
            dino.isMutated ? dino.mutatedStats[stat.id] : null
          ))}
        </div>
      </div>
    </article>
  );
};

export default DinoCard;
