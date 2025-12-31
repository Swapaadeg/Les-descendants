import React from 'react';
import '../../styles/components/header.scss';

const Header = () => {
  return (
    <header className="header">
      <img
        src="/assets/seasonal/winter/banner-hiver.png"
        alt="Arki-Family Hiver"
        className="header__banner"
      />
    </header>
  );
};

export default Header;
