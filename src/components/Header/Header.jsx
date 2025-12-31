import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/header.scss';

const Header = () => {
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
    </header>
  );
};

export default Header;
