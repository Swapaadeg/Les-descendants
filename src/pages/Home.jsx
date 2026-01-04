import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTribe } from '../hooks/useTribe';
import '../styles/pages/home.scss';

const Home = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { tribe } = useTribe();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    // Rester sur la page d'accueil après déconnexion
  };

  return (
    <div className="home">
      {/* Banner en arrière-plan */}
      <div className="home__banner">
        <img
          src="/assets/seasonal/winter/banner-hiver.png"
          alt="Arki'Family - Hiver"
          className="home__banner-image"
        />
        <div className="home__banner-overlay"></div>
      </div>

      {/* Bouton Admin en haut à droite */}
      {isAuthenticated && user?.is_admin && (
        <Link to="/admin" className="home__admin-link">
          <span className="home__admin-icon">⚙️</span>
          <span className="home__admin-text">Admin</span>
        </Link>
      )}

      {/* Avatar utilisateur en haut à droite */}
      {isAuthenticated && user && (
        <Link to="/profile" className="home__user-avatar">
          {user.photo_profil ? (
            <img
              src={user.photo_profil}
              alt={user.username}
              className="home__user-avatar-img"
            />
          ) : (
            <div className="home__user-avatar-placeholder">
              {user.username?.charAt(0).toUpperCase() || '👤'}
            </div>
          )}
        </Link>
      )}

      {/* Contenu principal */}
      <div className="home__content">
        {/* Logo cliquable */}
        <Link to="/" className="home__logo-link">
          <img
            src="/assets/seasonal/winter/logo-hiver.png"
            alt="Arki'Family Logo"
            className="home__logo"
          />
        </Link>

        {/* Titre principal */}
        <h1 className="home__title">
          Bienvenue dans <span className="home__title-highlight">Arki'Family</span>
        </h1>

        {/* Sous-titre */}
        <p className="home__subtitle">
          {isAuthenticated
            ? `Content de te revoir, ${user?.username || 'explorateur'} ! 🦖`
            : 'Rejoins une tribu, élève tes dinosaures, partage tes aventures'
          }
        </p>

        {/* Boutons d'action conditionnels */}
        <div className="home__actions">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="home__btn home__btn--primary">
                <span className="home__btn-icon">🦖</span>
                Mes dinosaures
              </Link>
              <Link to="/dashboard" className="home__btn home__btn--accent">
                {tribe && tribe.id ? (
                  <>
                    {tribe.logo_url ? (
                      <img
                        src={tribe.logo_url}
                        alt={tribe.name}
                        className="home__btn-tribe-logo"
                      />
                    ) : (
                      <span className="home__btn-icon">🏛️</span>
                    )}
                    <span>{tribe.name}</span>
                  </>
                ) : (
                  <>
                    <span className="home__btn-icon">🏛️</span>
                    <span>Créer ou rejoindre une tribu</span>
                  </>
                )}
              </Link>
              <button onClick={handleLogout} className="home__btn home__btn--secondary">
                <span className="home__btn-icon">🚪</span>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/register" className="home__btn home__btn--primary">
                <span className="home__btn-icon">🦖</span>
                Créer un compte
              </Link>
              <Link to="/login" className="home__btn home__btn--secondary">
                <span className="home__btn-icon">🔐</span>
                Se connecter
              </Link>
            </>
          )}
        </div>

        {/* Caractéristiques */}
        <div className="home__features">
          <Link to="/tribes" className="home__feature home__feature--clickable">
            <div className="home__feature-icon">🏕️</div>
            <h3 className="home__feature-title">Tribus</h3>
            <p className="home__feature-desc">
              Découvre toutes les tribus et leurs dinosaures en vitrine
            </p>
          </Link>

          <Link to="/dashboard" className="home__feature home__feature--clickable">
            <div className="home__feature-icon">📊</div>
            <h3 className="home__feature-title">Statistiques</h3>
            <p className="home__feature-desc">
              Suis l'évolution de tes dinosaures et compare-les avec ta tribu
            </p>
          </Link>

          <Link to="/dashboard?filter=mutated" className="home__feature home__feature--clickable">
            <div className="home__feature-icon">✨</div>
            <h3 className="home__feature-title">Mutations</h3>
            <p className="home__feature-desc">
              Découvre les dinosaures mutés de ta tribu
            </p>
          </Link>

          <Link to="/events" className="home__feature home__feature--clickable">
            <div className="home__feature-icon">🎉</div>
            <h3 className="home__feature-title">Evénements</h3>
            <p className="home__feature-desc">
              Remémore-toi les événements du serveur
            </p>
          </Link>
        </div>

        {/* Footer */}
        <div className="home__footer">
          <p className="home__footer-text">
            Une plateforme communautaire pour les éleveurs d'Arki'Family
          </p>
          <div className="home__footer-season">
            <span className="home__footer-season-icon">❄️</span>
            Édition Hiver 2025
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
