import { Link } from 'react-router-dom';
import '../../styles/components/footer.scss';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <p className="footer__text">
          Une plateforme communautaire pour les éleveurs d'Arki'Family
        </p>
        <div className="footer__season">
          <span className="footer__season-icon">❄️</span>
          Édition Hiver 2025
        </div>
        <div className="footer__links">
          <Link to="/mentions-legales" className="footer__link">
            Mentions légales
          </Link>
          <span className="footer__separator">•</span>
          <Link to="/politique-confidentialite" className="footer__link">
            Politique de confidentialité
          </Link>
          <span className="footer__separator">•</span>
          <Link to="/cgu" className="footer__link">
            CGU
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
