import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tribeAPI } from '../../services/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import '../../styles/pages/tribes-list.scss';

const TribesListPage = () => {
  const [tribes, setTribes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTribes();
  }, []);

  const loadTribes = async () => {
    try {
      setLoading(true);
      const data = await tribeAPI.getAll();
      // L'API retourne déjà uniquement les tribus validées et publiques
      setTribes(data.tribes || []);
    } catch (err) {
      console.error('Erreur chargement tribus:', err);
      setError('Erreur lors du chargement des tribus');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tribes-list">
      <Header />

      <main className="tribes-list__main">
        <div className="container">
          {/* En-tête */}
          <div className="tribes-list__header">
            <h1 className="tribes-list__title">🏕️ Toutes les tribus</h1>
            <p className="tribes-list__subtitle">
              Découvre les tribus d'Arki'Family et leurs dinosaures en vitrine
            </p>
          </div>

          {/* Chargement */}
          {loading && (
            <div className="tribes-list__loading">
              <div className="tribes-list__spinner"></div>
              <p>Chargement des tribus...</p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="tribes-list__error">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Liste des tribus */}
          {!loading && !error && (
            <>
              {tribes.length === 0 ? (
                <div className="tribes-list__empty">
                  <span className="tribes-list__empty-icon">🏕️</span>
                  <h3>Aucune tribu pour le moment</h3>
                  <p>Sois le premier à créer une tribu!</p>
                  <Link to="/dashboard" className="tribes-list__btn">
                    Créer ma tribu
                  </Link>
                </div>
              ) : (
                <>
                  <div className="tribes-list__count">
                    {tribes.length} tribu{tribes.length > 1 ? 's' : ''} disponible{tribes.length > 1 ? 's' : ''}
                  </div>

                  <div className="tribes-list__grid">
                    {tribes.map((tribe) => (
                      <Link
                        key={tribe.id}
                        to={`/tribes/${tribe.id}`}
                        className="tribe-card"
                        style={{
                          '--tribe-primary': tribe.primary_color || '#00f0ff',
                          '--tribe-secondary': tribe.secondary_color || '#b842ff',
                        }}
                      >
                        {/* Bannière (toujours affichée, gradient si pas d'image) */}
                        <div className="tribe-card__banner">
                          {tribe.banner_url && <img src={tribe.banner_url} alt={tribe.name} />}
                        </div>

                        {/* Logo */}
                        <div className="tribe-card__logo">
                          {tribe.logo_url ? (
                            <img src={tribe.logo_url} alt={tribe.name} />
                          ) : (
                            <div className="tribe-card__logo-placeholder">🏛️</div>
                          )}
                        </div>

                        {/* Informations */}
                        <div className="tribe-card__content">
                          <h3 className="tribe-card__name">{tribe.name}</h3>

                          {tribe.description && (
                            <p className="tribe-card__description">
                              {tribe.description.length > 100
                                ? `${tribe.description.substring(0, 100)}...`
                                : tribe.description
                              }
                            </p>
                          )}

                          <div className="tribe-card__stats">
                            <span className="tribe-card__stat">
                              <span className="tribe-card__stat-icon">👥</span>
                              {tribe.member_count || 0} membre{(tribe.member_count || 0) > 1 ? 's' : ''}
                            </span>
                            <span className="tribe-card__stat">
                              <span className="tribe-card__stat-icon">⭐</span>
                              Voir la vitrine
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Bouton retour */}
          <div className="tribes-list__footer">
            <Link to="/" className="tribes-list__back-link">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TribesListPage;
