import React from 'react';
import './Header.scss';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header__content">
          <h1 className="header__logo">
            <span className="header__logo-text">LES</span>
            <span className="header__logo-text header__logo-text--highlight">DESCENDANTS</span>
          </h1>
          <p className="header__subtitle">ARK Dinosaur Stats Tracker</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
