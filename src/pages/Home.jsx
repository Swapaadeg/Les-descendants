import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/home.scss';

const Home = () => {
  const { isAuthenticated, logout, user } = useAuth();
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
          <div className="home__feature">
            <div className="home__feature-icon">🏕️</div>
            <h3 className="home__feature-title">Tribus</h3>
            <p className="home__feature-desc">
              Crée ou rejoins une tribu pour partager tes dinos avec tes amis
            </p>
          </div>

          <div className="home__feature">
            <div className="home__feature-icon">📊</div>
            <h3 className="home__feature-title">Statistiques</h3>
            <p className="home__feature-desc">
              Suis l'évolution de tes dinosaures et compare-les avec ta tribu
            </p>
          </div>

          <div className="home__feature">
            <div className="home__feature-icon">✨</div>
            <h3 className="home__feature-title">Mutations</h3>
            <p className="home__feature-desc">
              Enregistre les stats mutées de tes dinos légendaires
            </p>
          </div>

          <div className="home__feature">
            <div className="home__feature-icon">🏆</div>
            <h3 className="home__feature-title">Classements</h3>
            <p className="home__feature-desc">
              Affiche ton meilleur dino du mois et partage tes succès
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="home__footer">
          <p className="home__footer-text">
            Une plateforme communautaire pour les éleveurs ARK
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
