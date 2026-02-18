import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Guides.scss';

const TutoMutations = () => {
  return (
    <div className="guide-page">
      <Header />
      <main className="guide-page__content">
        <div className="guide-page__container">
          <div className="guide-page__banner">
            <img
              src="/assets/banner/muta banner.jpg"
              alt="Bannière Guide des mutations"
              className="guide-page__banner-image"
              style={{ objectPosition: 'center 60%' }}
            />
          </div>
          <h1 className="guide-page__title">
            <span className="guide-page__icon">🧬</span>
            Guide complet des mutations
          </h1>

          {/* ÉTAPE 1 */}
          <div className="guide-page__section">
            <h2 className="guide-page__section-title">
              <span className="guide-page__section-badge">Étape 1</span>
              Réunir les stats parfaites
            </h2>
            <p className="guide-page__section-intro">
              Avant de parler mutation, il faut une base propre et stable.
            </p>

            <div className="guide-page__step-block">
              <h3>1. Tame plusieurs dinos sauvages haut niveau</h3>
              <p>Cherche des dinos avec :</p>
              <ul>
                <li>Une stat très haute dans <strong>UNE</strong> catégorie (HP, Melee, Stamina...)</li>
                <li>Peu importe si le reste est nul</li>
              </ul>
              <div className="guide-page__example">
                <span className="guide-page__example-label">Exemple :</span>
                <ul>
                  <li>Rex A → <strong>48 points</strong> en HP</li>
                  <li>Rex B → <strong>50 points</strong> en Melee</li>
                  <li>Rex C → <strong>45 points</strong> en Stamina</li>
                </ul>
              </div>
            </div>

            <div className="guide-page__step-block">
              <h3>2. Combine les meilleures stats</h3>
              <p>Tu fais reproduire jusqu'à obtenir :</p>
              <ul>
                <li>HP du A</li>
                <li>Melee du B</li>
                <li>Stamina du C</li>
              </ul>
              <p>
                Quand tu as un dino qui possède toutes les meilleures stats réunies, tu as ton{' '}
                <strong>couple de base parfait</strong>.
              </p>
            </div>

            <div className="guide-page__warning">
              Les stats doivent être <strong>non mutées</strong> à ce stade.
              Tu veux un compteur mutation à <strong>0 / 0</strong>.
            </div>

            <div className="guide-page__step-block">
              <h3>3. Reproduis le couple</h3>
              <p>Tu gardes :</p>
              <ul>
                <li><strong>1 mâle parfait</strong></li>
                <li><strong>Plusieurs femelles parfaites</strong></li>
              </ul>
              <p>Toutes doivent avoir :</p>
              <ul>
                <li>Les mêmes stats</li>
                <li>0 mutation côté paternel et maternel</li>
              </ul>
            </div>
          </div>

          {/* ÉTAPE 2 */}
          <div className="guide-page__section">
            <h2 className="guide-page__section-title">
              <span className="guide-page__section-badge">Étape 2</span>
              Comprendre les mutations (sans devenir fou)
            </h2>

            <div className="guide-page__highlight-box">
              <p>Une mutation =</p>
              <ul>
                <li><strong>+2 points</strong> dans UNE stat</li>
                <li><strong>+1</strong> au compteur mutation du parent</li>
              </ul>
            </div>
          </div>

          {/* ÉTAPE 3 */}
          <div className="guide-page__section">
            <h2 className="guide-page__section-title">
              <span className="guide-page__section-badge">Étape 3</span>
              La méthode du MÂLE MUTANT (la technique propre)
            </h2>
            <p className="guide-page__section-intro">
              Voilà la clé. On ne mute <strong>QUE le mâle</strong>.
            </p>
            <p className="guide-page__section-intro">
              Pourquoi ? Parce qu'un seul mâle peut reproduire avec 20 femelles.
              C'est plus rapide et plus propre.
            </p>

            <div className="guide-page__step-block">
              <h3>Méthode exacte</h3>
              <ol>
                <li>
                  <strong>Mâle parfait</strong> (0 mutation)
                </li>
                <li>
                  <strong>20 femelles parfaites</strong> (0 mutation)
                </li>
              </ol>

              <div className="guide-page__image-block">
                <img
                  src="/assets/mutas/rex 0 0.png"
                  alt="Rex avec 0 mutation paternelle et 0 mutation maternelle"
                  className="guide-page__muta-image"
                />
                <span className="guide-page__image-caption">Rex de base — 0/0 mutations</span>
              </div>

              <p>Tu fais reproduire.</p>
              <ol start={3}>
                <li>
                  <strong>Tu cherches un bébé qui a :</strong>
                  <ul>
                    <li>Les stats parfaites</li>
                    <li>UNE mutation dans la stat que tu veux (ex : Melee)</li>
                  </ul>
                </li>
              </ol>

              <div className="guide-page__result-grid">
                <div className="guide-page__result-card guide-page__result-card--bad">
                  <span className="guide-page__result-icon">❌</span>
                  <p>
                    <strong>Une femelle</strong> → tu peux la récupérer avec un mâle SANS MUTA
                    pour récupérer la muta sur un nouveau mâle.
                  </p>
                </div>
                <div className="guide-page__result-card guide-page__result-card--good">
                  <span className="guide-page__result-icon">✅</span>
                  <p>
                    <strong>Un mâle</strong> → c'est ton nouveau reproducteur
                  </p>
                </div>
              </div>

              <ol start={4}>
                <li>
                  <strong>Remplacement du mâle</strong>
                  <ul>
                    <li>Ancien mâle → stockage</li>
                    <li>Nouveau mâle mutant → reproducteur principal</li>
                  </ul>
                  <p>Et on recommence.</p>
                </li>
              </ol>
            </div>

            <div className="guide-page__warning">
              Les femelles doivent rester <strong>0 mutation</strong>, toujours propres.
              Comme ça, le compteur mutation augmente uniquement côté paternel.
            </div>
          </div>

          {/* BONUS — Traits génétiques */}
          <div className="guide-page__section">
            <h2 className="guide-page__section-title">
              <span className="guide-page__section-badge">Bonus</span>
              Traits génétiques et mutations
            </h2>

            <div className="guide-page__image-block">
              <img
                src="/assets/mutas/cornu gene.png"
                alt="Dino avec traits génétiques Mutable"
                className="guide-page__muta-image"
              />
            </div>

            <div className="guide-page__step-block">
              <p>
                Comme vu dans le{' '}
                <Link to="/guides/scanner" className="guide-page__link">tuto Scanner de gènes</Link>,
                il existe un trait génétique <strong>Mutable</strong> qui augmente la probabilité
                qu'un bébé subisse une mutation :
              </p>
              <div className="guide-page__example">
                <span className="guide-page__example-label">Trait Mutable</span>
                <p>
                  +1,0% / 1,5% / 2,0% de chance de mutation par stat
                  (Health, Stamina, Oxygen, Food, Weight, Melee Damage)
                </p>
              </div>
            </div>

            <div className="guide-page__step-block">
              <h3>Comment en profiter ?</h3>
              <p>
                Injecte jusqu'à <strong>3 copies</strong> du trait Mutable sur ton mâle reproducteur
                via le Gene Scanner pour maximiser tes chances de mutations.
              </p>
              <div className="guide-page__warning">
                Le dino doit être <strong>bébé, juvénile ou adolescent</strong> pour recevoir des traits.
                Ne le laisse surtout pas mourir avant l'injection !
              </div>
              <p>
                Dès que tu obtiens un <strong>nouveau mâle mutant</strong>, transfère les traits
                de l'ancien vers le nouveau reproducteur. 🧬
              </p>
            </div>
          </div>

          {/* ÉTAPE 4 */}
          <div className="guide-page__section">
            <h2 className="guide-page__section-title">
              <span className="guide-page__section-badge">Étape 4</span>
              Empiler les mutations dans UNE seule stat
            </h2>
            <p className="guide-page__section-intro">
              Tu veux un Rex boss fight ? Tu montes <strong>254 points</strong> de mutation dans une seule stat
              (soit 127 mutations).  Si tu as une mutation dans HP, une mutation dans Melee, une mutation dans Stamina, etc. tu vas vite être limité.
              C'est pour ça que tu dois <strong>empiler les mutations dans une seule stat</strong>, si tu vises les dégats et que tu as une mutation en vie : <strong>tu peux tuer le bébé</strong>
            </p>
            <p className="guide-page__section-intro">
              Pourquoi ? Parce que tu veux <strong>contrôler la stat</strong>.
            </p>

            <div className="guide-page__step-block">
              <h3>Exemple progression Melee :</h3>
              <ul>
                <li>Base : 50</li>
                <li>1 mutation → 52</li>
                <li>2 mutations → 54</li>
                <li>...</li>
                <li>20 mutations → +40 points donc 70 en mélée</li>
                <li>Etc.</li>
              </ul>
            </div>

            <div className="guide-page__image-block">
              <img
                src="/assets/mutas/Muta 127 127.png"
                alt="Dino avec 127 mutations paternelles et 127 mutations maternelles"
                className="guide-page__muta-image"
              />
              <span className="guide-page__image-caption">127 / 127 mutations empilées</span>
            </div>

            <div className="guide-page__warning">
              Si tu dépasses <strong>254 points</strong> dans une stat, tu ne pourras plus mettre d'XP à ton dino dans cette stat !
            </div>

            <div className="guide-page__step-block">
              <h3>La combinaison finale</h3>
              <p>
                Ensuite tu fais pareil sur une autre stat. Tu reproduis un <strong>mâle 254 HP</strong> et
                une <strong>femelle 254 Dégâts</strong> et pouf, tu as un monstre.
              </p>
            </div>

            <div className="guide-page__image-block">
              <img
                src="/assets/mutas/254 254.png"
                alt="Dino avec 254 points en HP et 254 en Melee"
                className="guide-page__muta-image"
              />
              <span className="guide-page__image-caption">254 HP + 254 Melee — le monstre final</span>
            </div>

            <div className="guide-page__conclusion">
              <h2>Et voilà !</h2>
              <p>
                Et là tu commences à voir la différence. Avec de la patience et de la méthode,
                tu peux créer des dinos surpuissants capables de dominer n'importe quel boss fight.
              </p>
              <p>
                Retiens les règles d'or : <strong>femelles propres</strong>, <strong>un seul mâle mutant</strong>,
                et <strong>une stat à la fois</strong>. Bonne chance, éleveur !
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutoMutations;
