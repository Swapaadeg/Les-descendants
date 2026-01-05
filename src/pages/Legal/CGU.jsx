import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import '../../styles/pages/legal.scss';

function CGU() {
  return (
    <div className="legal">
      <Header />

      <main className="legal__main">
        <div className="container">
          <div className="legal__content">
            <h1 className="legal__title">Conditions Générales d'Utilisation</h1>

            <section className="legal__section">
              <h2>1. Objet</h2>
              <p>
                Les présentes Conditions Générales d'Utilisation (CGU) définissent les règles d'accès et d'utilisation
                du site <strong>Arki'Family</strong>, plateforme communautaire dédiée aux joueurs d'ARK: Survival Ascended.
              </p>
            </section>

            <section className="legal__section">
              <h2>2. Acceptation des CGU</h2>
              <p>
                L'utilisation du site implique l'acceptation pleine et entière des présentes CGU.
                Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser le site.
              </p>
            </section>

            <section className="legal__section">
              <h2>3. Inscription</h2>
              <p>
                Pour accéder aux fonctionnalités du site, vous devez créer un compte avec :
              </p>
              <ul>
                <li>Une adresse email valide</li>
                <li>Un nom d'utilisateur unique</li>
                <li>Un mot de passe sécurisé</li>
              </ul>
              <p>
                Vous êtes responsable de la confidentialité de vos identifiants.
                Toute utilisation de votre compte est sous votre responsabilité.
              </p>
            </section>

            <section className="legal__section">
              <h2>4. Utilisation du service</h2>
              <p><strong>Vous vous engagez à :</strong></p>
              <ul>
                <li>Fournir des informations exactes et à jour</li>
                <li>Respecter les autres utilisateurs</li>
                <li>Ne pas publier de contenu illégal, offensant, ou violent</li>
                <li>Ne pas usurper l'identité d'autrui</li>
                <li>Ne pas tenter de pirater ou perturber le site</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>5. Contenu utilisateur</h2>
              <p>
                Vous conservez la propriété de votre contenu (photos, descriptions, etc.).
                En publiant du contenu, vous accordez à Arki'Family une licence non-exclusive pour l'afficher sur le site.
              </p>
              <p>
                Nous nous réservons le droit de modérer ou supprimer tout contenu inapproprié.
              </p>
            </section>

            <section className="legal__section">
              <h2>6. Comportements interdits</h2>
              <p>Sont strictement interdits :</p>
              <ul>
                <li>Le harcèlement, les insultes, la discrimination</li>
                <li>Le spam et la publicité non sollicitée</li>
                <li>La diffusion de contenu pornographique ou violent</li>
                <li>L'utilisation de bots ou scripts automatisés</li>
                <li>La revente ou l'exploitation commerciale du service</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>7. Sanctions</h2>
              <p>
                En cas de non-respect des CGU, nous nous réservons le droit de :
              </p>
              <ul>
                <li>Avertir l'utilisateur</li>
                <li>Suspendre temporairement le compte</li>
                <li>Bannir définitivement l'utilisateur</li>
                <li>Supprimer le contenu inapproprié</li>
              </ul>
            </section>

            <section className="legal__section">
              <h2>8. Responsabilité</h2>
              <p>
                Le site est fourni "en l'état". Nous ne garantissons pas l'absence d'erreurs ou d'interruptions.
                Nous ne sommes pas responsables des pertes de données ou dommages résultant de l'utilisation du service.
              </p>
            </section>

            <section className="legal__section">
              <h2>9. Propriété intellectuelle</h2>
              <p>
                ARK: Survival Ascended est une marque de Studio Wildcard.
                Arki'Family est un projet communautaire non officiel et non affilié.
              </p>
            </section>

            <section className="legal__section">
              <h2>10. Modification des CGU</h2>
              <p>
                Nous nous réservons le droit de modifier les présentes CGU à tout moment.
                Les utilisateurs seront informés des modifications importantes.
              </p>
            </section>

            <section className="legal__section">
              <h2>11. Droit applicable</h2>
              <p>
                Les présentes CGU sont soumises au droit français.
                Tout litige relève de la compétence des tribunaux français.
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

export default CGU;
