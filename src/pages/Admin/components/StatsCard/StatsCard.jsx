import React from 'react';
import { Link } from 'react-router-dom';
import './StatsCard.scss';

const StatsCard = ({ title, value, icon, color = 'primary', link = null }) => {
  const content = (
    <div className={`stats-card stats-card--${color}`}>
      <div className="stats-card__icon">{icon}</div>
      <div className="stats-card__content">
        <h3 className="stats-card__title">{title}</h3>
        <p className="stats-card__value">{value}</p>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="stats-card__link">
        {content}
      </Link>
    );
  }

  return content;
};

export default StatsCard;
