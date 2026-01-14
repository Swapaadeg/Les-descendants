import React, { useState } from 'react';
import arkDinosaurs from '../../data/dinosaurs';
import dinoTypes from '../../data/types';
import { baseStats, hasSpecialStat, shouldIgnoreOxygen } from '../../data/stats';
import ImageCropModal from '../ImageCropModal/ImageCropModal';
import '../../styles/components/dino-form.scss';

const DinoForm = ({ onAddDino, existingDinos = [] }) => {
  const [formData, setFormData] = useState({
    species: '',
    typeIds: [],
    isMutated: false,
    photo: null,
    stats: {
      health: '',
      stamina: '',
      oxygen: '',
      food: '',
      weight: '',
      damage: '',
      crafting: ''
    },
    mutatedStats: {
      health: '',
      stamina: '',
      oxygen: '',
      food: '',
      weight: '',
      damage: '',
      crafting: ''
    }
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [speciesSearch, setSpeciesSearch] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  const selectedDino = arkDinosaurs.find(d => d.name === formData.species);
  const isAquatic = selectedDino && shouldIgnoreOxygen(selectedDino.types, dinoTypes);
  const hascraftingStat = formData.species === 'Helicoprion' || formData.species === 'Gacha';

  // Vérifier si l'espèce existe déjà
  const isDuplicateSpecies = formData.species && existingDinos.some(d => d.species === formData.species);

  // Filtrer les espèces déjà ajoutées
  const availableSpecies = arkDinosaurs.filter(dino =>
    !existingDinos.some(existing => existing.species === dino.name)
  );

  // Filtrer par recherche
  const filteredSpecies = availableSpecies.filter(dino =>
    dino.name.toLowerCase().includes(speciesSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleTypeChange = (typeId) => {
    setFormData(prev => {
      const typeIds = prev.typeIds.includes(typeId)
        ? prev.typeIds.filter(id => id !== typeId)
        : [...prev.typeIds, typeId];

      return { ...prev, typeIds };
    });
  };

  const handleStatChange = (statId, value, isMutated = false) => {
    const field = isMutated ? 'mutatedStats' : 'stats';
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [statId]: value
      }
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = ({ blob, url }) => {
    // Convertir le blob en fichier
    const croppedFile = new File([blob], 'cropped-photo.jpg', { type: 'image/jpeg' });
    setFormData(prev => ({ ...prev, photo: croppedFile }));
    setPhotoPreview(url);
    setShowCropModal(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation basique
    if (!formData.species) {
      alert('Veuillez sélectionner une espèce');
      return;
    }

    // Vérifier que toutes les stats sont remplies
    const requiredStats = ['health', 'stamina', 'food', 'weight', 'damage'];
    if (!isAquatic) requiredStats.push('oxygen');
    if (hascraftingStat) requiredStats.push('crafting');

    const missingStats = requiredStats.filter(stat => !formData.stats[stat] || formData.stats[stat] === '');

    if (missingStats.length > 0) {
      alert(`Veuillez remplir toutes les stats de base (${missingStats.join(', ')})`);
      return;
    }

    // Si muté, vérifier les stats mutées
    if (formData.isMutated) {
      const missingMutatedStats = requiredStats.filter(stat =>
        !formData.mutatedStats[stat] || formData.mutatedStats[stat] === ''
      );

      if (missingMutatedStats.length > 0) {
        alert(`Veuillez remplir toutes les stats mutées (${missingMutatedStats.join(', ')})`);
        return;
      }
    }

    onAddDino(formData);

    // Reset du formulaire
    setFormData({
      species: '',
      typeIds: [],
      isMutated: false,
      photo: null,
      stats: {
        health: '',
        stamina: '',
        oxygen: '',
        food: '',
        weight: '',
        damage: '',
        crafting: ''
      },
      mutatedStats: {
        health: '',
        stamina: '',
        oxygen: '',
        food: '',
        weight: '',
        damage: '',
        crafting: ''
      }
    });
    setPhotoPreview(null);
  };

  const renderStatInput = (stat, isMutated = false) => {
    // Ne pas afficher l'oxygène pour les dinos aquatiques
    if (stat.id === 'oxygen' && isAquatic) return null;

    const value = isMutated
      ? formData.mutatedStats[stat.id]
      : formData.stats[stat.id];

    return (
      <div key={`${stat.id}-${isMutated}`} className="dino-form__stat">
        <label className="dino-form__label">
          <span className="dino-form__stat-icon">{stat.icon}</span>
          <span>{stat.name}</span>
        </label>
        <input
          type="number"
          className="dino-form__input"
          value={value}
          onChange={(e) => handleStatChange(stat.id, e.target.value, isMutated)}
          placeholder={`${stat.name}${isMutated ? ' (muté)' : ''}`}
          min="0"
        />
      </div>
    );
  };

  return (
    <form className="dino-form" onSubmit={handleSubmit}>
      <div className="dino-form__section">
        <h2 className="dino-form__title">Ajouter un dinosaure</h2>

        {/* Sélection de l'espèce */}
        <div className="dino-form__field">
          <label className="dino-form__label">
            Espèce
            {availableSpecies.length < arkDinosaurs.length && (
              <span className="dino-form__count">
                ({availableSpecies.length} disponibles sur {arkDinosaurs.length})
              </span>
            )}
          </label>
          {availableSpecies.length === 0 ? (
            <div className="dino-form__no-species">
              ✨ Toutes les espèces ont été ajoutées!
            </div>
          ) : (
            <>
              <input
                type="text"
                className="dino-form__search"
                placeholder="🔍 Rechercher une espèce..."
                value={speciesSearch}
                onChange={(e) => setSpeciesSearch(e.target.value)}
              />
              <select
                name="species"
                className="dino-form__select"
                value={formData.species}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une espèce</option>
                {filteredSpecies.sort((a, b) => a.name.localeCompare(b.name)).map(dino => (
                  <option key={dino.name} value={dino.name}>
                    {dino.name}
                  </option>
                ))}
              </select>
              {filteredSpecies.length === 0 && speciesSearch && (
                <div className="dino-form__no-results">
                  Aucune espèce trouvée pour "{speciesSearch}"
                </div>
              )}
            </>
          )}
        </div>

        {/* Sélection des types */}
        <div className="dino-form__field">
          <label className="dino-form__label">Types</label>
          <div className="dino-form__types">
            {dinoTypes.map(type => (
              <button
                key={type.id}
                type="button"
                className={`dino-form__type-btn ${
                  formData.typeIds.includes(type.id) ? 'dino-form__type-btn--active' : ''
                }`}
                onClick={() => handleTypeChange(type.id)}
                style={{
                  '--type-color': type.color
                }}
              >
                <span className="dino-form__type-icon">{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upload photo */}
        <div className="dino-form__field">
          <label className="dino-form__label">Photo</label>
          <div className="dino-form__photo-upload">
            <input
              type="file"
              id="photo"
              className="dino-form__file-input"
              accept="image/*"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo" className="dino-form__file-label">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="dino-form__photo-preview" />
              ) : (
                <div className="dino-form__photo-placeholder">
                  <span>📸</span>
                  <span>Ajouter une photo</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Mutation */}
        <div className="dino-form__field">
          <label className="dino-form__checkbox-label">
            <input
              type="checkbox"
              name="isMutated"
              className="dino-form__checkbox"
              checked={formData.isMutated}
              onChange={handleChange}
            />
            <span className="dino-form__checkbox-text">Dinosaure muté</span>
          </label>
        </div>
      </div>

      {/* Stats de base */}
      <div className="dino-form__section">
        <h3 className="dino-form__subtitle">Stats de base</h3>
        <div className="dino-form__stats-grid">
          {baseStats.map(stat => renderStatInput(stat, false))}
          {hascraftingStat && (
            <div className="dino-form__stat">
              <label className="dino-form__label">
                <span className="dino-form__stat-icon">🔨</span>
                <span>Craft</span>
              </label>
              <input
                type="number"
                className="dino-form__input"
                value={formData.stats.crafting}
                onChange={(e) => handleStatChange('crafting', e.target.value, false)}
                placeholder="Craft"
                min="0"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats mutées */}
      {formData.isMutated && (
        <div className="dino-form__section dino-form__section--mutated">
          <h3 className="dino-form__subtitle">Stats mutées</h3>
          <div className="dino-form__stats-grid">
            {baseStats.map(stat => renderStatInput(stat, true))}
            {hascraftingStat && (
              <div className="dino-form__stat">
                <label className="dino-form__label">
                  <span className="dino-form__stat-icon">🔨</span>
                  <span>Craft (muté)</span>
                </label>
                <input
                  type="number"
                  className="dino-form__input"
                  value={formData.mutatedStats.crafting}
                  onChange={(e) => handleStatChange('crafting', e.target.value, true)}
                  placeholder="Craft (muté)"
                  min="0"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <button type="submit" className="dino-form__submit">
        <span>✨</span>
        <span>Ajouter le dinosaure</span>
      </button>

      {showCropModal && imageToCrop && (
        <ImageCropModal
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </form>
  );
};

export default DinoForm;
