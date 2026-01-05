import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../styles/pages/legal.scss';

function PolitiqueConfidentialite() {
  return (
    <div className="legal">
      <Header />

      <main className="legal__main">
        <div className="container">
          <div className="legal__content">
            <h1 className="legal__title">Politique de Confidentialité</h1>

            <section className="legal__section">
              <h2>1. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul>
                <li><strong>Compte utilisateur :</strong> email, nom d'utilisateur, mot de passe (hashé)</li>
                <li><strong>Profil :</strong> photo de profil (optionnel), prénom, nom (optionnels)</li>
                <li><strong>Contenu :</strong> dinosaures créés, photos uploadées, messages dans les tribus</li>
                <li><strong>Technique :</strong> adresse IP, cookies de session</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>2. Finalité du traitement</h2>
              <p>Ces données sont utilisées pour :</p>
              <ul>
                <li>Créer et gérer votre compte</li>
                <li>Permettre les fonctionnalités du site (tribus, dinosaures, etc.)</li>
                <li>Assurer la sécurité du site</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>3. Base légale</h2>
              <p>
                Le traitement de vos données repose sur votre <strong>consentement</strong> lors de la création de votre compte
                et sur l'<strong>exécution du contrat</strong> (fourniture des services).
              </p>
            </section>

            <section className="legal__section">
              <h2>4. Durée de conservation</h2>
              <ul>
                <li><strong>Compte actif :</strong> pendant toute la durée d'utilisation du service</li>
                <li><strong>Compte inactif :</strong> 3 ans après la dernière connexion</li>
                <li><strong>Après suppression :</strong> données anonymisées ou supprimées sous 30 jours</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>5. Destinataires des données</h2>
              <p>
                Vos données sont accessibles uniquement par l'administrateur du site.
                Elles ne sont jamais vendues ou transmises à des tiers.
              </p>
            </section>

            <section className="legal__section">
              <h2>6. Vos droits (RGPD)</h2>
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
                <li><strong>Droit de rectification :</strong> corriger vos données</li>
                <li><strong>Droit à l'effacement :</strong> supprimer votre compte et vos données</li>
                <li><strong>Droit d'opposition :</strong> vous opposer au traitement</li>
                <li><strong>Droit à la portabilité :</strong> récupérer vos données</li>
              </ul>
              <p>
                Pour exercer ces droits, contactez-nous à :
                <a href="mailto:marie.rivier23@gmail.com"> marie.rivier23@gmail.com</a>
              </p>
            </section>

            <section className="legal__section">
              <h2>7. Cookies</h2>
              <p>
                Nous utilisons uniquement des cookies de session nécessaires au fonctionnement du site
                (authentification, préférences). Ces cookies ne collectent pas de données personnelles à des fins publicitaires.
              </p>
            </section>

            <section className="legal__section">
              <h2>8. Sécurité</h2>
              <p>
                Nous mettons en œuvre des mesures de sécurité pour protéger vos données :
              </p>
              <ul>
                <li>Mots de passe hashés avec Argon2id</li>
                <li>Connexion HTTPS sécurisée</li>
                <li>Protection contre les injections SQL et XSS</li>
                <li>Sauvegarde régulière des données</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>9. Contact</h2>
              <p>
                Pour toute question concernant vos données personnelles :<br />
                Email : <a href="mailto:marie.rivier23@gmail.com">marie.rivier23@gmail.com</a>
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

export default PolitiqueConfidentialite;
