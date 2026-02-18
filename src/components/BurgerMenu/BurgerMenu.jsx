import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './BurgerMenu.scss';

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [guidesOpen, setGuidesOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const menuRef = useRef(null);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setGuidesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setIsOpen(false);
    setGuidesOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (isOpen) setGuidesOpen(false);
  };

  const toggleGuides = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setGuidesOpen(!guidesOpen);
  };

  return (
    <div className="burger-menu" ref={menuRef}>
      <button
        className={`burger-menu__toggle ${isOpen ? 'burger-menu__toggle--active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu de navigation"
        aria-expanded={isOpen}
      >
        <span className="burger-menu__bar"></span>
        <span className="burger-menu__bar"></span>
        <span className="burger-menu__bar"></span>
      </button>

      <nav
        className={`burger-menu__nav ${isOpen ? 'burger-menu__nav--open' : ''}`}
        style={{
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none'
        }}
        aria-hidden={!isOpen}
      >
        <ul className="burger-menu__list">
          <li className="burger-menu__item">
            <Link to="/events" className="burger-menu__link">
              <span className="burger-menu__icon">📅</span>
              Événements
            </Link>
          </li>

          <li className="burger-menu__item">
            <Link to="/tribes" className="burger-menu__link">
              <span className="burger-menu__icon">🏛️</span>
              Tribus
            </Link>
          </li>

          {user && (
            <>
              <li className="burger-menu__item">
                <Link to="/profile" className="burger-menu__link">
                  <span className="burger-menu__icon">👤</span>
                  Mon profil
                </Link>
              </li>

              <li className="burger-menu__item">
                <Link to="/tribe" className="burger-menu__link">
                  <span className="burger-menu__icon">🦖</span>
                  Ma tribu
                </Link>
              </li>

              <li className="burger-menu__item">
                <Link to="/dashboard" className="burger-menu__link">
                  <span className="burger-menu__icon">➕</span>
                  Ajouter un dinosaure
                </Link>
              </li>
            </>
          )}

          <li className="burger-menu__item burger-menu__item--submenu">
            <button
              className={`burger-menu__link burger-menu__link--submenu ${guidesOpen ? 'burger-menu__link--active' : ''}`}
              onClick={toggleGuides}
              aria-expanded={guidesOpen}
            >
              <span className="burger-menu__icon">📚</span>
              Guides
              <span className={`burger-menu__arrow ${guidesOpen ? 'burger-menu__arrow--open' : ''}`}>▸</span>
            </button>

            <ul className={`burger-menu__submenu ${guidesOpen ? 'burger-menu__submenu--open' : ''}`}>
              <li className="burger-menu__subitem">
                <Link to="/guides/shiny" className="burger-menu__sublink">
                  <span className="burger-menu__icon">✨</span>
                  Tuto Shiny
                </Link>
              </li>
              <li className="burger-menu__subitem">
                <Link to="/guides/scanner" className="burger-menu__sublink">
                  <span className="burger-menu__icon">🔬</span>
                  Scanner de gènes
                </Link>
              </li>
              <li className="burger-menu__subitem">
                <Link to="/guides/mutations" className="burger-menu__sublink">
                  <span className="burger-menu__icon">🧬</span>
                  Mutations
                </Link>
              </li>
            </ul>
          </li>

          {!user && (
            <>
              <li className="burger-menu__item burger-menu__item--separator"></li>
              <li className="burger-menu__item">
                <Link to="/login" className="burger-menu__link burger-menu__link--highlight">
                  <span className="burger-menu__icon">🔐</span>
                  Se connecter
                </Link>
              </li>
              <li className="burger-menu__item">
                <Link to="/register" className="burger-menu__link burger-menu__link--cta">
                  <span className="burger-menu__icon">🦕</span>
                  Créer un compte
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>

      {isOpen && <div className="burger-menu__overlay" onClick={() => setIsOpen(false)} />}
    </div>
  );
};

export default BurgerMenu;
