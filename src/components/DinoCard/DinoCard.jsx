import React, { useState } from 'react';
import dinoTypes from '../../data/types';
import { baseStats, shouldIgnoreOxygen, calculateLevel, calculateTotalLevel } from '../../data/stats';
import { getImageUrl } from '../../config/api';
import '../../styles/components/dino-card.scss';

const DinoCard = ({ dino, onUpdate, onDelete, onToggleFeatured, members = [], currentUserId }) => {
  const [editingStats, setEditingStats] = useState({});
  const [tempValues, setTempValues] = useState({});

  const assignedUserId = dino.assignedUser?.id || null;

  const isAquatic = shouldIgnoreOxygen(dino.typeIds, dinoTypes);
  const hasPhoto = dino.photoUrl;
  const photoSrc = getImageUrl(dino.photoUrl);

  // Calculer les niveaux
  const baseLevel = calculateLevel(dino.stats, dino.species, isAquatic);
  const totalLevel = dino.isMutated
    ? calculateTotalLevel(dino.stats, dino.mutatedStats, dino.species, isAquatic)
    : null;

  // Handler pour le changement d'image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && onUpdate) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      onUpdate(dino.id, { image: file });
    }
  };

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

  // Handler pour activer/désactiver la mutation
  const handleToggleMutation = () => {
    if (!onUpdate) return;

    const newMutatedStatus = !dino.isMutated;

    // Si on active la mutation et qu'il n'y a pas de stats mutées, les initialiser avec les stats de base
    const mutatedStats = newMutatedStatus && !dino.mutatedStats
      ? { ...dino.stats }
      : dino.mutatedStats || {};

    onUpdate(dino.id, {
      isMutated: newMutatedStatus,
      mutatedStats: mutatedStats
    });
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
              onClick={onUpdate ? () => startEditing(stat.id, baseValue, false) : undefined}
              title={onUpdate ? "Cliquer pour modifier" : undefined}
              style={onUpdate ? undefined : { cursor: 'default' }}
            >
              {baseValue || baseValue === 0 ? baseValue : '—'}
              {onUpdate && <span className="dino-card__stat-edit-icon">✎</span>}
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
                onClick={onUpdate ? () => startEditing(stat.id, mutatedValue, true) : undefined}
                title={onUpdate ? "Cliquer pour modifier" : undefined}
                style={onUpdate ? undefined : { cursor: 'default' }}
              >
                {mutatedValue || mutatedValue === 0 ? mutatedValue : '—'}
                {onUpdate && <span className="dino-card__stat-edit-icon">✎</span>}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <article className="dino-card">
      {/* Boutons d'action (seulement si les fonctions sont fournies) */}
      {(onToggleFeatured || onDelete || onUpdate) && (
        <div className="dino-card__actions">
          {onUpdate && (
            <button
              type="button"
              className={`dino-card__mutation-btn ${dino.isMutated ? 'dino-card__mutation-btn--active' : ''}`}
              onClick={handleToggleMutation}
              title={dino.isMutated ? "Retirer la mutation" : "Activer la mutation"}
            >
              ✨
            </button>
          )}
          {onToggleFeatured && (
            <button
              type="button"
              className={`dino-card__featured-btn ${dino.isFeatured ? 'dino-card__featured-btn--active' : ''}`}
              onClick={() => onToggleFeatured(dino.id, dino.isFeatured)}
              title={dino.isFeatured ? "Retirer de la vitrine" : "Mettre en vitrine"}
            >
              ⭐
            </button>
          )}
          {onDelete && (
            <button
              className="dino-card__delete-btn"
              onClick={() => onDelete(dino.id)}
              title="Supprimer ce dinosaure"
            >
              🗑️
            </button>
          )}
        </div>
      )}

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
          {onUpdate && (
            <>
              <input
                type="file"
                id={`image-input-${dino.id}`}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="dino-card__change-image-btn"
                onClick={() => document.getElementById(`image-input-${dino.id}`).click()}
                title="Changer l'image"
              >
                📷
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Ajouter une image si pas de photo */}
      {!hasPhoto && onUpdate && (
        <div className="dino-card__photo dino-card__photo--empty">
          <input
            type="file"
            id={`image-input-${dino.id}`}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className="dino-card__add-image-btn"
            onClick={() => document.getElementById(`image-input-${dino.id}`).click()}
            title="Ajouter une image"
          >
            📷 Ajouter une photo
          </button>
        </div>
      )}

      {/* Header */}
      <div className="dino-card__header">
        <h3 className="dino-card__title">{dino.species}</h3>

        {/* Assignation */}
        <div className="dino-card__assignee">
          <div className="dino-card__assignee-label">Assigné à</div>
          <div className="dino-card__assignee-value">
            {dino.assignedUser ? (
              <span className="dino-card__assignee-chip">
                <span className="dino-card__assignee-avatar">
                  {dino.assignedUser.username?.charAt(0)?.toUpperCase() || '👤'}
                </span>
                <span className="dino-card__assignee-name">{dino.assignedUser.username}</span>
              </span>
            ) : (
              <span className="dino-card__assignee-empty">Non assigné</span>
            )}
          </div>

          {onUpdate && members.length > 0 && (
            <div className="dino-card__assignee-actions">
              <select
                className="dino-card__assignee-select"
                value={assignedUserId ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const newAssignee = value === '' ? null : parseInt(value, 10);
                  onUpdate(dino.id, { assigned_user_id: newAssignee });
                }}
              >
                <option value="">Non assigné</option>
                {members.map(member => (
                  <option key={member.id} value={member.user_id}>
                    {member.username}
                  </option>
                ))}
              </select>

              {currentUserId && assignedUserId !== currentUserId && (
                <button
                  type="button"
                  className="dino-card__assignee-me"
                  onClick={() => onUpdate(dino.id, { assigned_user_id: currentUserId })}
                  title="M'assigner ce dino"
                >
                  Moi
                </button>
              )}

              {assignedUserId && (
                <button
                  type="button"
                  className="dino-card__assignee-clear"
                  onClick={() => onUpdate(dino.id, { assigned_user_id: null })}
                  title="Libérer ce dino"
                >
                  Libérer
                </button>
              )}
            </div>
          )}
        </div>

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
