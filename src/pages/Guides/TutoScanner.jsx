import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Guides.scss';

const TutoScanner = () => {
  return (
    <div className="guide-page">
      <Header />
      <main className="guide-page__content">
        <div className="guide-page__container">
          <h1 className="guide-page__title">
            <span className="guide-page__icon">🔬</span>
            Scanner de gènes
          </h1>

          <div className="guide-page__placeholder">
            <p>Contenu à venir...</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutoScanner;
