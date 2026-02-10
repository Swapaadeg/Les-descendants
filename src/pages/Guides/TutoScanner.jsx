import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import './Guides.scss';

const TutoScanner = () => {
  const traits = [
    {
      name: 'Aggressive',
      copies: 2,
      effects: [
        "À chaque fois que cette créature inflige des dégâts à une cible non alliée, elle gagne un bonus de vitesse de déplacement de 2,5%/3,75%/5,0% pendant 5 s, qui se rafraîchit (ne s’empile pas) à chaque coup."
      ]
    },
    {
      name: 'Angry',
      copies: 2,
      effects: [
        "Cette créature inflige jusqu’à 1,25%/1,875%/2,5% de dégâts supplémentaires selon sa santé actuelle. Le bonus commence à 50% de PV restants et augmente linéairement jusqu’à son maximum à 25%."
      ]
    },
    {
      name: 'Athletic',
      copies: 3,
      effects: [
        "Cette créature gagne 0,05/0,075/0,1 de régénération de santé et 0,05%/0,075%/0,1% de régénération d’endurance par point d’oxygène.",
        "Note : un cooldown de 60 s s’applique après avoir été touché, pendant lequel la régénération est réduite à sa valeur de base. Être touché à nouveau relance le timer."
      ]
    },
    {
      name: 'Aquatic/Swimmer',
      copies: 3,
      effects: [
        "En nageant, cette créature :",
        "• se déplace 7,5%/11,25%/15% plus vite",
        "• consomme 12,5%/18,75%/25,0% d’oxygène en moins",
        "• consomme 4%/6%/8% d’endurance en moins"
      ]
    },
    {
      name: 'Bearing/Carrier',
      copies: 3,
      effects: [
        "Cette créature réduit le poids d’inventaire d’une catégorie d’objets transportés de 15,0%/22,5%/30%.",
        "Catégories :",
        "• Carcasse : Chitin, Hide, Keratin, Organic Polymer, Pelt, Wool",
        "• Grotte/Aberrant : Red Gem, Green Gem, Blue Gem, Congealed Gas Ball, Element Ore",
        "• Désert/Scorched : Silk, Raw Salt, Sand, Cactus Sap, Sulfur",
        "• Exotique : Angler Gel, Black Pearls, Element, Leech Blood, Oil, Silica Pearls",
        "• Viandes : Raw Meat, Raw Fish Meat, Raw Mutton, Raw Prime Meat, Raw Prime Fish Meat, Spoiled Meat",
        "• Minéral : Flint, Stone, Crystal, Obsidian, Metal",
        "• Végétal : Thatch, Wood, Fiber, Berries, Crops, Seeds",
        "• Wastes/Extinction : Silicate, Corrupted Nodule, Element Dust, Scrap Metal, Condensed Gas, Fragmented Green Gem, Red Crystalized Sap, Blue Crystalized Sap",
        "Note : cet effet est affecté par le Drag Weight, et est réduit sur les grosses créatures."
      ]
    },
    {
      name: 'Carefree',
      copies: 1,
      effects: [
        "Cette créature gagne 7,5%/11,25%/15,0% de vitesse de déplacement bonus, perdu pendant 20 s après avoir infligé des dégâts, reçu des dégâts ou pris un cavalier."
      ]
    },
    {
      name: 'Cold',
      copies: 3,
      effects: [
        "Cette créature et son cavalier gagnent 40/60/80 d’isolation hyperthermique et 5,0%/7,5%/10,0% de réduction des dégâts de chaleur/feu."
      ]
    },
    {
      name: 'Cowardly',
      copies: 3,
      effects: [
        "À chaque fois que cette créature reçoit des dégâts d’une cible non alliée, elle gagne 2,5%/3,75%/5,0% de vitesse de déplacement pendant 5 s, qui se rafraîchit (ne s’empile pas)."
      ]
    },
    {
      name: 'Distracting',
      copies: 1,
      effects: [
        "Les cibles non alliées touchées par les attaques de mêlée de cette créature infligent 5,0%/7,5%/10,0% de dégâts en moins à toutes les autres cibles pendant 20 s."
      ]
    },
    {
      name: 'Diurnal',
      copies: 3,
      effects: [
        "Cette créature réduit sa consommation d’endurance de jour de 2,5%/3,75%/5,0%."
      ]
    },
    {
      name: 'Excitable',
      copies: 1,
      effects: [
        "Toucher un ennemi avec l’attaque de mêlée de base réduit le cooldown des autres capacités de 0,25/0,375/0,5 seconde."
      ]
    },
    {
      name: 'Fast Learner',
      copies: 3,
      effects: [
        "Augmente le gain d’expérience de 15,0%/22,5%/30,0%.",
        "Note : ce trait peut être remplacé sur les créatures adultes."
      ]
    },
    {
      name: 'Fatty',
      copies: 3,
      effects: [
        "Cette créature gagne 0,1/0,15/0,2 d’armure par point de nourriture."
      ]
    },
    {
      name: 'Frenetic',
      copies: 3,
      effects: [
        "La récupération de torpeur est augmentée de 7,5%/11,25%/15,0%."
      ]
    },
    {
      name: 'Giantslaying',
      copies: 2,
      effects: [
        "• Inflige 2,5%/3,75%/5,0% de dégâts supplémentaires aux grosses créatures (Drag Weight ≥ 500)",
        "• Inflige 7,5%/11,25%/15,0% de dégâts en moins aux petites créatures (Drag Weight ≤ 200)"
      ]
    },
    {
      name: 'Heavy-Hitting',
      copies: 3,
      effects: [
        "• Inflige 2,5%/3,75%/5,0% de dégâts de mêlée supplémentaires",
        "• Vitesse d’attaque de mêlée réduite de 5%/7,5%/10,0%"
      ]
    },
    {
      name: 'Robust',
      copies: 3,
      effects: [
        "Augmente de façon additive la probabilité qu’un bébé hérite de la meilleure valeur des parents pour une statistique de 1,5%/2,25%/3,0%.",
        "Statistiques possibles : Health, Stamina, Oxygen, Food, Weight, Melee Damage."
      ]
    },
    {
      name: 'Frail',
      copies: 3,
      effects: [
        "Diminue de façon additive la probabilité qu’un bébé hérite de la meilleure valeur des parents pour une statistique de 1,5%/2,25%/3,0%.",
        "Statistiques possibles : Health, Stamina, Oxygen, Food, Weight, Melee Damage."
      ]
    },
    {
      name: 'Mutable',
      copies: 3,
      effects: [
        "Augmente de façon additive la probabilité qu’un bébé subisse une mutation pour une statistique de 1,0%/1,5%/2,0%.",
        "Statistiques possibles : Health, Stamina, Oxygen, Food, Weight, Melee Damage."
      ]
    },
    {
      name: 'Kingslaying',
      copies: 3,
      effects: [
        "• Inflige 5,0%/7,5%/10,0% de dégâts supplémentaires aux Boss et créatures Alpha",
        "• Inflige 10%/15%/20% de dégâts en moins à toutes les autres cibles"
      ]
    },
    {
      name: 'Nocturnal',
      copies: 3,
      effects: [
        "Cette créature réduit sa consommation d’endurance de nuit de 2,5%/3,7%/5,0%."
      ]
    },
    {
      name: 'Numb',
      copies: 1,
      effects: [
        "25,0%/37,5%/50,0% des dégâts finaux subis par cette créature sont appliqués sous forme de dégâts sur 5 s, non réductibles par d’autres moyens."
      ]
    },
    {
      name: 'Protective',
      copies: 2,
      effects: [
        "Réduit les dégâts subis par le cavalier de 15,0%/22,5%/30,0%. L’effet persiste 10 s après la descente."
      ]
    },
    {
      name: 'Quick-Hitting',
      copies: 3,
      effects: [
        "• Attaque 2,5%/3,75%/5,0% plus vite",
        "• Inflige 5,0%/7,5%/10,0% de dégâts de mêlée en moins"
      ]
    },
    {
      name: 'Slow Metabolism',
      copies: 3,
      effects: [
        "Consomme 5,0%/7,5%/10,0% de nourriture en moins, y compris celle utilisée pour alimenter des capacités (ex : soin de zone du Daedon)."
      ]
    },
    {
      name: 'Sprinter/High Endurance',
      copies: 3,
      effects: [
        "Consomme 4%/6%/8% d’endurance en moins en sprintant."
      ]
    },
    {
      name: 'Tenacious',
      copies: 3,
      effects: [
        "Subit jusqu’à 12,5%/18,75%/25,0% de dégâts en moins selon sa santé actuelle. La réduction commence à 50% de PV restants et augmente linéairement jusqu’à son maximum à 25%."
      ]
    },
    {
      name: 'Vampiric',
      copies: 1,
      effects: [
        "Restaure la santé manquante à hauteur de 5,0%/7,5%/10,0% des dégâts infligés.",
        "Note : cet effet dépend du Drag Weight. À partir de 200, l’effet est réduit de 50%. À partir de 500, il est réduit de 90%."
      ]
    },
    {
      name: 'Warm',
      copies: 3,
      effects: [
        "Cette créature et son cavalier gagnent 40/60/80 d’isolation hypothermique et 5,0%/7,5%/10,0% de réduction des dégâts de froid/glace."
      ]
    }
  ];

  return (
    <div className="guide-page">
      <Header />
      <main className="guide-page__content">
        <div className="guide-page__container">
          <div className="guide-page__banner">
            <img
              src="/assets/banner/gene.png"
              alt="Bannière Traits génétiques"
              className="guide-page__banner-image"
            />
          </div>
          <h1 className="guide-page__title">
            <span className="guide-page__icon">🔬</span>
            Traits génétiques
          </h1>
          <div className="guide-page__intro">
            <p className="guide-page__intro-label">Tutoriel simple</p>
            <p>
              Les traits apparaissent d’abord sur les créatures sauvages (ou issues d’œufs/fœtus sauvages comme
              Wyvern, Rock Drake, Reaper, Rhyniognatha). Chaque créature éligible a exactement un trait aléatoire.
            </p>
            <p>
              Chaque trait a un niveau (Tier 1 à 3). Plus le Tier est élevé, plus il est rare et puissant
              (chances environ 74% / 22,2% / 3,7%).
            </p>
          </div>

          <div className="guide-page__steps">
            <h2>Étapes</h2>
            <ol>
              <li>
                <strong>Repérer un trait</strong> : sur une créature apprivoisée ou inconsciente, le résumé des
                traits apparaît dans l’infobulle si les descriptions étendues sont activées (ex. “[1] Athletic”).
                Sur un animal (même sauvage), tu peux voir les traits en regardant avec le Gene Scanner et en
                maintenant le bouton d’info supplémentaire.
              </li>
              <li>
                <strong>Extraire un trait</strong> : équipe le <em>Gene Scanner</em> (DLC Bob’s Tall Tales) et
                “frappe” la créature (LMB/RT/R2/RB). Le scanner peut stocker jusqu’à 10 traits.
              </li>
              <li>
                <strong>Stocker</strong> : transfère les traits vers la <em>Gene Storage</em> pour garder jusqu’à 200
                traits. Ils sont réutilisables à l’infini tant que la créature source n’est pas perdue.
              </li>
              <li>
                <strong>Implanter</strong> : avec le Gene Scanner, frappe une créature apprivoisée en croissance
                (bébé, juvénile, adolescent) pour lui appliquer le trait. Une créature peut avoir jusqu’à 5 traits
                au total, et beaucoup de traits s’empilent (2–3 copies max).
              </li>
              <li>
                <strong>Exception</strong> : un adulte possédant le trait <em>Fast Learner</em> peut remplacer ce trait
                par un autre.
              </li>
            </ol>
          </div>

          <div className="guide-page__intro">
            <p>
              Important : les traits ne se transmettent pas par accouplement. Les bébés issus d’élevage n’auront
              des traits que si tu les implantes avec le Gene Scanner.
            </p>
            <p>
              Les traits ne peuvent être appliqués qu’à la même espèce de base que celle d’origine (ex. un trait
              extrait d’un Wyvern ne peut pas être appliqué à un Ankylosaurus). En revanche, tu peux transférer
              entre variantes d’une même espèce (ex. Fire → Poison Wyvern, Aberrant → standard).
            </p>
          </div>
          <div className="guide-page__table-wrapper">
            <table className="guide-page__traits-table">
              <thead>
                <tr>
                  <th>Trait</th>
                  <th>Empilement max</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {traits.map((trait) => (
                  <tr key={trait.name}>
                    <td className="guide-page__trait-name">{trait.name}</td>
                    <td className="guide-page__trait-copies">{trait.copies}</td>
                    <td className="guide-page__trait-desc">
                      <ul>
                        {trait.effects.map((effect) => (
                          <li key={effect}>{effect}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutoScanner;
