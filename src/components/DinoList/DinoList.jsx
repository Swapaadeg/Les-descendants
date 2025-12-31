import React, { useState } from 'react';
import DinoCard from '../DinoCard';
import dinoTypes from '../../data/types';
import '../../styles/components/dino-list.scss';

const DinoList = ({ dinos, onUpdateDino, onDeleteDino }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Filtrer et trier les dinosaures par ordre alphabétique
  const filteredDinos = dinos
    .filter(dino => {
      const matchesSearch = dino.species.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (filter === 'mutated' && dino.isMutated) ||
        (filter !== 'mutated' && filter !== 'all' && dino.typeIds.includes(parseInt(filter)));

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.species.localeCompare(b.species));

  if (dinos.length === 0) {
    return (
      <div className="dino-list dino-list--empty">
        <div className="dino-list__empty">
          <span className="dino-list__empty-icon">🦕</span>
          <h3 className="dino-list__empty-title">Aucun dinosaure</h3>
          <p className="dino-list__empty-text">
            Ajoutez votre premier dinosaure pour commencer à tracker vos stats!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="dino-list">
      {/* Filtres */}
      <div className="dino-list__filters">
        <div className="dino-list__search">
          <input
            type="text"
            placeholder="🔍 Rechercher un dinosaure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="dino-list__search-input"
          />
        </div>

        <div className="dino-list__filter-buttons">
          <button
            className={`dino-list__filter-btn ${filter === 'all' ? 'dino-list__filter-btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous ({dinos.length})
          </button>

          <button
            className={`dino-list__filter-btn ${filter === 'mutated' ? 'dino-list__filter-btn--active' : ''}`}
            onClick={() => setFilter('mutated')}
          >
            ✨ Mutés ({dinos.filter(d => d.isMutated).length})
          </button>

          {dinoTypes.map(type => (
            <button
              key={type.id}
              className={`dino-list__filter-btn ${filter === String(type.id) ? 'dino-list__filter-btn--active' : ''}`}
              onClick={() => setFilter(String(type.id))}
              style={{ '--filter-color': type.color }}
            >
              {type.icon} {type.name} ({dinos.filter(d => d.typeIds.includes(type.id)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Résultats */}
      {filteredDinos.length === 0 ? (
        <div className="dino-list__no-results">
          <span className="dino-list__no-results-icon">🔍</span>
          <p className="dino-list__no-results-text">Aucun dinosaure trouvé</p>
        </div>
      ) : (
        <>
          <div className="dino-list__count">
            {filteredDinos.length} dinosaure{filteredDinos.length > 1 ? 's' : ''} trouvé{filteredDinos.length > 1 ? 's' : ''}
          </div>

          <div className="dino-list__grid">
            {filteredDinos.map((dino) => (
              <DinoCard
                key={dino.id}
                dino={dino}
                onUpdate={onUpdateDino}
                onDelete={onDeleteDino}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default DinoList;
