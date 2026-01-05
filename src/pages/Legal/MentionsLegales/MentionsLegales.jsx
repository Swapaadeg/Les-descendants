import { Link } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import '../../../styles/pages/legal.scss';

function MentionsLegales() {
  return (
    <div className="legal">
      <Header />

      <main className="legal__main">
        <div className="container">
          <div className="legal__content">
            <h1 className="legal__title">Mentions Légales</h1>

            <section className="legal__section">
              <h2>1. Éditeur du site</h2>
              <p>
                <strong>Arki'Family</strong> est un site édité par :<br />
                [Swap Dev Studio]<br />

                Email : <a href="mailto:marie.rivier23@gmail.com">marie.rivier23@gmail.com</a>
              </p>
            </section>

            <section className="legal__section">
              <h2>2. Directeur de publication</h2>
              <p>[VOTRE NOM ET PRÉNOM]</p>
            </section>

            <section className="legal__section">
              <h2>3. Hébergement</h2>
              <p>
                Le site est hébergé par :<br />
                <strong>o2switch</strong><br />
                SARL au capital de 100 000 €<br />
                RCS Clermont-Ferrand 510 909 807<br />
                Siège social : 222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand, France<br />
                Téléphone : 04 44 44 60 40<br />
                Site web : <a href="https://www.o2switch.fr" target="_blank" rel="noopener noreferrer">www.o2switch.fr</a>
              </p>
            </section>

            <section className="legal__section">
              <h2>4. Propriété intellectuelle</h2>
              <p>
                L'ensemble du contenu de ce site (textes, images, logos, etc.) est la propriété exclusive de son éditeur,
                sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
              </p>
              <p>
                ARK: Survival Ascended est une marque déposée de Studio Wildcard.
                Ce site est un projet communautaire non officiel et n'est pas affilié à Studio Wildcard.
              </p>
            </section>

            <section className="legal__section">
              <h2>5. Données personnelles</h2>
              <p>
                Pour plus d'informations sur la collecte et le traitement de vos données personnelles,
                consultez notre <Link to="/politique-confidentialite">Politique de confidentialité</Link>.
              </p>
            </section>

            <div className="legal__back">
              <Link to="/" className="legal__back-btn">← Retour à l'accueil</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentionsLegales;
