import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/header.scss';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <Link to="/" className="header__logo-link">
        <img
          src="/assets/seasonal/winter/logo-hiver.png"
          alt="Arki'Family"
          className="header__logo"
        />
      </Link>
      <img
        src="/assets/seasonal/winter/banner-hiver.png"
        alt="Arki-Family Hiver"
        className="header__banner"
      />
      {user && (
        <Link to="/profile" className="header__user-avatar">
          {user.photo_profil ? (
            <img
              src={user.photo_profil}
              alt={user.username}
              className="header__user-avatar-img"
            />
          ) : (
            <div className="header__user-avatar-placeholder">
              {user.username?.charAt(0).toUpperCase() || '👤'}
            </div>
          )}
        </Link>
      )}
    </header>
  );
};

export default Header;
