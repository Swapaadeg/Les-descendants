import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { shinyAPI } from '../../services/api';
import './Guides.scss';

const TutoShiny = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [images, setImages] = useState({});
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await shinyAPI.getImages();
        const nextImages = {};
        if (data?.images) {
          Object.entries(data.images).forEach(([key, url]) => {
            nextImages[key] = { url };
          });
        }
        setImages(nextImages);
      } catch (error) {
        console.error('Erreur chargement images shiny:', error);
      }
    };

    loadImages();
  }, []);

  const shinyTypes = useMemo(
    () => [
      {
        key: 'enraged',
        name: 'Enraged',
        paragraphs: [
          "Attention aux Enraged — ou traquez-les. Ces dinos ont tous les dangers d’un Alpha, en pire. Ils ne peuvent pas être apprivoisés et ils seront difficiles à vaincre — mais si vous y arrivez, vous (et votre chibi) récolterez les récompenses. (Plus gros, plus fort, plus endurant, plus rapide. Les Enraged laissent un butin spécial, et leurs éliminations comptent pour l’XP du chibi.)",
          {
            highlight:
              "Leur loot vous permet de crafter les Shiny Spearbolt (flèches qui s’utilisent avec un harpon) ou les Shiny Essence Prod (matraque shiny) afin d’extraire l’essence des shinys spéciaux détaillés ci‑dessous."
          }
        ]
      },
      {
        key: 'shinobi',
        name: 'Shinobi',
        paragraphs: [
          "Plusieurs fois, en remontant cette partie de la forêt, j’ai remarqué cet animal. Je suis certain qu’il m’a vu en premier, et a décidé que je n’étais pas une menace, sinon je ne l’aurais jamais aperçu. C’est un megaloceros, un magnifique mâle, dont la particularité la plus remarquable est qu’il se promène tranquillement, complètement ignoré. Deux fois, je l’ai vu passer à côté d’un groupe de phorusrhacidae — ces oiseaux-terreurs — sans qu’ils ne le remarquent. La zone est pleine d’ours ; carnotaurus y raccourcit la vie de tout ce qui est moins rapide que lui, et pourtant ce cerf marche à son rythme, comme s’il n’avait peur de rien. Sa couleur sombre l’aide à se fondre dans les ombres, mais ce n’est sûrement pas tout. Je me demande s’il n’a pas un talent unique…",
          "Les dinos Shinobi sont particulièrement discrets. Les prédateurs devront s’approcher très près avant de les remarquer, et si vous êtes prudent, vous pouvez même contourner une menace sans être repéré. (Réduction significative de l’aggro des dinos sauvages — réduite, pas inexistante ! Prudence.)",
          { emphasis: "Pas d’effet visuel." }
        ]
      },
      {
        key: 'fathomless',
        name: 'Fathomless',
        paragraphs: [
          "Je peux désormais confirmer l’existence d’une variante dont je ne connaissais auparavant l’existence que par des rumeurs. J’avais entendu parler d’animaux dotés d’une force prodigieuse, bien au-delà de ce que leur taille et leur forme devraient permettre. Eh bien, j’ai vu une telle créature : un gallimimus dans la caravane d’une petite tribu nomade. Quand je dis ‘dans la caravane’, je devrais plutôt dire qu’il était la caravane — tous leurs biens, tout leur campement, étaient portés par le dos fragile de cette créature bleue et gracile. En exprimant mon admiration, les voyageurs m’ont dit que cette capacité n’était pas unique ; ils avaient vu un autre animal semblable — un hyaenodon, de toutes choses — doté de la force d’un animal dix fois plus grand, également bleu, sans autre signe extérieur de sa puissance. Comme si les animaux étaient plus grands à l’intérieur.",
          "Les dinos Fathomless sont bleus, sans autre indice apparent de leur force spéciale. Peut-être l’un des plus utiles de la famille Shiny : ils sont ‘plus grands à l’intérieur’ — le poids de tout ce qu’ils portent est réduit de 80%."
        ]
      },
      {
        key: 'endurant',
        name: 'Endurant',
        paragraphs: [
          "Il est toujours agréable de revoir un vieil ami, surtout quand il apporte avec lui une curiosité irrésistible. J’ai été impardonnablement impoli envers mon invitée, tant j’étais absorbé par sa monture. Hetty a toujours adoré ses thylacoleos, et je comprends pourquoi elle a poursuivi celui-ci avec tant d’ardeur. C’est un animal magnifique, bleu-noir, presque panthère, et extrêmement puissant — comme il se doit pour l’avoir amenée jusqu’ici. Mais en plus de sa capacité à bondir et grimper les terrains les plus impossibles, il possède un don particulier : il peut courir, infatigable, jour et nuit si nécessaire. Dans quelques jours, quand ils auront eu le temps de se reposer, elle a accepté une petite course d’endurance — moi et Horace, mon fidèle iguanodon, contre Hetty et Selene. Nous verrons bien qui l’emportera.",
          "Les dinos Endurant peuvent avoir n’importe quelle couleur de Shiny, mais ce n’est pas tout. Ils peuvent sprinter indéfiniment sans perdre d’endurance. (Les attaques et capacités spéciales qui consomment habituellement l’endurance continueront de le faire.)",
          { emphasis: "Pas d’effet visuel." }
        ]
      },
      {
        key: 'burning',
        name: 'Burning',
        paragraphs: [
          "Quelle circonstance a pu produire cette merveille ? J’aimerais qu’elle fasse quelque chose pour le vieux Behemoth. Aujourd’hui j’ai fait une découverte. Je passai une crête et là, devant moi, un equus… en feu. Je n’exagère pas. Son corps était enveloppé de flammes, mais elles ne lui faisaient aucun mal. À le voir brûler ainsi, on aurait dit que c’était son état naturel. J’ai tenté de l’attraper — bien sûr — et j’ai bien cru avoir scellé son destin en le poussant directement sur le chemin d’un sabretooth. Le félin bondit — et le cheval — explosa. Il allait très bien. Le chat, enflammé, prit la fuite en hurlant, et le cheval s’enfuit vers d’autres pâturages. Et moi, je suis rentré boire un verre.",
          "Les dinos Burning sont recouverts de flammes permanentes. Ils sont immunisés aux dégâts du feu et de la lave, et peuvent, si provoqués, déclencher une explosion de feu qui blesse tout autour d’eux. (Attaque spéciale de zone ; touche de mêlée par défaut / Ctrl.)"
        ]
      },
      {
        key: 'frozen',
        name: 'Frozen',
        paragraphs: [
          "Les rares personnes autour de moi connaissent mon intérêt pour ces curiosités vivantes et m’apportent volontiers des récits pour attiser ma curiosité. Je n’aurais jamais cru à celui‑ci si je ne l’avais pas vu de mes propres yeux : on dit qu’au sud, une créature presque mythique rôde — d’après la description, un giganotosaurus — dont le corps est entièrement fait de glace. Elle sème le chaos, tuant tout sur son passage, détruisant tout ce qu’elle touche. Personne ne peut l’arrêter. Ils espèrent que je pourrais faire quelque chose grâce à mes connaissances. Alors, évidemment, j’y vais. Si je ne reviens pas, je laisse ces notes à celui qui les trouvera. Prends soin de toi, survivant, et ne ferme jamais ton esprit : il y a tant de nouveautés brillantes à découvrir…",
          "Les dinos Frozen sont faits de glace ! Pas de souci — le froid ne les dérange pas. Leur température interne basse conserve les denrées périssables comme un réfrigérateur. Ils sont un peu plus lents, mais résistants. Ils subissent des dégâts réduits de toutes les attaques — sauf du feu. Ils sont particulièrement vulnérables aux flammes."
        ]
      },
      {
        key: 'spectral',
        name: 'Spectral',
        paragraphs: [
          "Tout ce que j’ai vu sur cette île est déjà extraordinaire, mais ceci… c’est comme un conte d’enfance. Il y a tant de choses ici qui défient mon entendement scientifique, mais cela — eh bien, je vais le raconter tel que cela s’est passé. En regardant la vallée vers la mer, j’ai été frappé par la beauté sereine d’une paire de brontosaures à la lisière de la forêt, près de la plage. L’un semblait d’un blanc au‑delà de l’ivoire, presque éthéré, et je pensais que la lumière de la lune reflétée sur sa peau lui donnait un aspect de verre — jusqu’à ce que je réalise que la lune était derrière lui, et que la lumière ne se reflétait pas, elle le traversait. Je n’avais aucune peur ; je devais m’approcher. J’ai réveillé Behemoth et nous avons foncé, sans nous soucier des branches et des épines. L’un semblait normal, mais l’autre était transparent, vaporeux. Ils ne prêtèrent guère attention, et quand j’ai tendu la main, elle a traversé l’apparition. J’aurais pu les observer toute la nuit, mais ils partirent vers des terrains plus dangereux où je ne pouvais pas suivre — et là où ils marchaient, le sol tremblait sous les pas d’un seul.",
          "Autre variante étrange : les dinos Spectral errent sur les Arks, liés au monde des vivants par une énergie ésotérique. Ils sont transparents et insubstantiels, entourés d’une lueur spirituelle. Ils peuvent chuter sans se blesser et se déplacent en silence. Au lieu de déféquer, ils offrent des cadeaux issus du plan spirituel sous forme de ‘crottes spectrales’. (Oui, on peut marcher à travers eux. Non, on ne peut pas les faire traverser des murs pour détruire les bases des autres. Arrêtez.)"
        ]
      },
      {
        key: 'filthy',
        name: 'Filthy',
        paragraphs: [
          "Aujourd’hui je célèbre l’arrivée d’une nouvelle compagne dans mon groupe. Je l’ai capturée par pitié, mais ses qualités la rendent plus que bienvenue. En allant pêcher, je suis tombé sur une carbonemys obibimus dans un état pitoyable. Elle était couverte de boue, entourée d’un nuage de mouches et d’une puanteur suffocante. Je ne pouvais pas la laisser ainsi ; une fois sa confiance gagnée, je l’ai menée à l’eau pour la nettoyer. Les couches de crasse partirent par paquets, révélant une coloration magnifique. J’étais tellement concentré que je n’ai pas entendu les raptors arriver. En un instant, ils étaient sur moi — mais ma nouvelle amie attrapa le raptor à ma gorge et le déchira. Ils se tournèrent vers la tortue — elle en mit un en pièces pendant que les autres se brisaient les dents sur sa carapace. Si seulement elle courait aussi bien qu’elle se bat… Mes flèches finirent le travail. Les poissons seront tranquilles aujourd’hui — soupe de raptor pour moi, et Celeste aura une tarte aux baies rien que pour elle.",
          "Ne jugez pas trop vite un dino Filthy. Leur puanteur peut vous faire vaciller, mais si vous les apprivoisez et les nettoyez, ils peuvent devenir vos meilleurs amis. (Les Filthy apparaissent avec un niveau bonus, mais vous devrez le mériter. Plongez-les dans l’eau pour les nettoyer ! Ou frottez-les avec du Savon, tout le monde n’aime pas se baigner.)"
        ]
      },
      {
        key: 'holographic',
        name: 'Holographic',
        paragraphs: [
          "La chose la plus remarquable dans les systèmes vivants et dynamiques, c’est qu’ils font toujours quelque chose de nouveau — ils changent, s’adaptent, se développent d’une manière qu’on n’attend pas. Et si votre simulation est assez réaliste, elle finira même par engendrer des comportements vivants.",
          "Prenez cet exemple. Vous savez tous ces glitches que nous avons réparés ? Des erreurs, des bugs, des lignes cassées qui ne devraient même pas fonctionner. Et pourtant, voici un animal qui a pris ces informations pour se transformer en quelque chose d’entièrement nouveau ! Regardez‑le — un animal partiellement fait de lumière ! Il évolue, ici même, à l’intérieur de la simulation. Et s’il peut faire cela, qui sait où il ira.",
          "Les dinos Holographic se sont échappés d’une simulation et errent désormais sur les ARKs. Ils donnent à leur cavalier la capacité de détecter les menaces, d’identifier leurs compagnons, et de trouver des dinos de haut niveau pour l’apprivoisement."
        ]
      },
      {
        key: 'lunar',
        name: 'Lunar',
        paragraphs: [
          "Après avoir vécu ici si longtemps, on n’est plus surpris de se faire attaquer de nulle part. Et pourtant, alors que je me reposais près du petit bassin au‑dessus de la cascade, un baryonyx bondit sur moi — enfin, c’était son intention, mais ce n’est pas ce qui arriva. Il se mit à flotter doucement dans l’air, griffant et mordant, jusqu’à passer au‑dessus de la chute et tomber lentement. J’en restai bouche bée. Il tomba comme au ralenti — puis rebondit et repartit en chasse. Étrange ! Je l’ai observé autant que possible. Il semble avoir une flottabilité naturelle, comme s’il était plus léger que l’air, et pourtant il peut se plonger dans l’eau normalement — peut‑être une anomalie gravitationnelle locale ? Je ne sais pas, et il m’a encore échappé. La nuit tombe ; je dois abandonner. J’espère seulement qu’il ne flottera pas dans la gueule de quelque chose de plus féroce avant que je ne puisse l’attraper.",
          "Les dinos Lunar défient partiellement la gravité et se déplacent comme sur la lune. Sauts et rebonds en faible gravité !",
          { emphasis: "Pas d’effet visuel." }
        ]
      },
      {
        key: 'skeletal',
        name: 'Skeletal',
        paragraphs: [
          "On raconte que, sous la Blood Moon saisonnière, des spectres terrifiants marchent. Je n’y ai jamais cru. Mais encore une fois, j’ai dû réviser mes convictions. Apprivoiser cette bête fut d’une difficulté extrême. À peine un tiers de mes flèches tranquillisantes atteignaient leur cible, et il fallut bien plus que je ne l’aurais pensé… pour un rex normal. Mais ce n’est pas un rex normal. Il se tient debout, rugit, chasse et se bat férocement, tenu par une force inconnue : il n’y a pas un gramme de chair sur lui. C’est un musée vivant, une anomalie, une créature d’os.",
          "Vous avez peut‑être déjà vu des Skeletal lors de Fear Evolved. Les Shiny Skeletal sont différents : on peut les apprivoiser, et leur physiognomie unique fait que vous n’aurez jamais à les nourrir. Ils ne respirent pas non plus, et ne font pas leurs besoins — le rêve des soigneux. Les armes à distance sont moins efficaces sur eux, car la plupart des projectiles passent à travers.",
          "En raison de leur nature, seuls certains dinos peuvent être Skeletal : Trikes, Stegos, Brontos, Raptors, Carno, Rexes, Gigas, Quetzal, Wyvern, Jerboa, Dodo, Therizino, Thylacoleo, Spino, Titanoboa et Rock Drakes."
        ]
      },
      {
        key: 'taser',
        name: 'Taser',
        paragraphs: [
          "Les créatures des profondeurs ont souvent développé l’électricité comme défense ou attaque. Mais l’air est un mauvais conducteur ; projeter une décharge électrique pure sur la terre ferme devrait être prohibitif. Et pourtant… J’ai vu aujourd’hui un lystrosaurus, un de ces petits synapsides si communs, faire un spectacle. L’énergie crépitait autour de lui, peut‑être pour avertir des prédateurs — avertissement ignoré par trois dilophosaurs. Quand le premier attaqua, il fut non seulement repoussé par un choc, mais l’électricité rebondit en chaîne sur les deux autres. Ils s’enfuirent en confusion. Avec une fleur, je me suis fait un ami. Sparky vivra avec moi.",
          "Les dinos Taser ont développé une défense électrique naturelle et choquent régulièrement les assaillants, les étourdissant."
        ]
      },
      {
        key: 'rubber',
        name: 'Rubber',
        paragraphs: [
          "Boing ! Pendant des jours, j’ai pensé halluciner. Maintenant que j’ai compris la source du couinement étrange que j’entendais, je me demande encore si je ne rêve pas. Un pteranodon rôde, avec une étrange spirale de couleurs, rappelant ces balles rebondissantes que je collectionnais enfant. Lorsqu’il atterrit et marche, il couine, comme un amas de balles en caoutchouc frottant entre elles. Ou comme un pteranodon déguisé en pteranodon en caoutchouc. J’ai juré l’avoir entendu faire ‘boi‑oi‑oi‑oi‑oiiing’. Je dois l’attraper pour l’étudier… ou lancer une nouvelle collection.",
          "Les dinos Rubber ont un motif coloré unique et rebondissent comme une balle en caoutchouc ! Pas de dégâts de chute, rebonds, reflet partiel des attaques de mêlée — tout ce qu’on attend d’un dino rebondissant."
        ]
      },
      {
        key: 'psychotropic',
        name: 'Psychotropic',
        paragraphs: [
          "À quiconque tombera sur ces pages et lira jusqu’ici — un avertissement. Si vous croisez une créature, n’importe laquelle, dont le corps est traversé par une iridescence hypnotique et animée, un arc‑en‑ciel vivant d’une beauté étrange — ne la léchez pas. Vraiment. Ne le faites pas. Écoutez‑moi. Oh ma tête…",
          "Psychotropic est principalement une modification visuelle, avec quelques gags amusants. Méfiez‑vous surtout de leurs morsures. En bonus, ils produisent de la biotoxine dans leur inventaire."
        ]
      },
      {
        key: 'dazzling',
        name: 'Dazzling',
        paragraphs: [
          "Bien que les gens ici vivent dans des conditions variées et improvisées, on trouve des indices qu’une civilisation ancienne existait avant nous. À l’aube, je partis enquêter sur un éclat au sommet d’une falaise. Toute la journée, je grimpai vers une lumière scintillante. Un artefact, pensais‑je. En approchant, j’entendis un animal en détresse, invisible derrière l’éclat — et quand je fus proche, un flash si puissant me sonna et je faillis tomber. Ce n’était pas un artefact : c’était un stegosaurus, coincé sur un rebord. Sa peau était comme du cristal, renvoyant la lumière dans toutes les directions. L’éclair n’était pas dirigé vers moi mais vers un troodon, qui chancela et tomba. Il fallut beaucoup d’efforts pour le descendre, mais quelle créature fascinante ! Je l’appellerai Flash.",
          "Les dinos Dazzling sont brillants, colorés et iridescents. Leur design reflète la lumière de manière spectaculaire. Ils peuvent aveugler les attaquants pour s’échapper et sont naturellement immunisés aux radiations."
        ]
      },
      {
        key: 'radioactive',
        name: 'Radioactive',
        paragraphs: [
          "On pourrait croire que, dans un monde rempli de créatures préhistoriques, les gens cesseraient d’invoquer la sorcellerie… mais non. Aujourd’hui, un voisin m’a supplié de l’aider à trouver une explication scientifique : tout ce qui s’approchait d’un coin de leur maison tombait malade et mourait, au point que d’autres voisins voulaient les lyncher. J’ai trouvé la cause, et je l’ai ramenée à distance sûre. Je ne sais que faire. Le tuer serait prudent, mais je ne peux m’y résoudre — c’est trop fascinant.",
          "C’était un dilophosaur. Il s’était coincé entre un rocher et un mur, entouré de cadavres de dodos domestiques. Pour l’en sortir il fallait une logistique minutieuse, car il est enveloppé d’une diffusion miasmatique qui ronge tout autour. Je suis presque certain qu’il est radioactif — extrêmement. Rien que de rester près de lui, j’ai l’impression que mes entrailles fondent. Pourtant, lui ne semble pas malade. Je l’ai isolé dans un enclos de pierre, entouré de torches et de panneaux d’avertissement, et Gaunt — ce Rex sans chair — est prêt à dissuader les intrus. Il faut prévenir Hetty : si elle ne le sait pas, elle connaît sûrement quelqu’un capable de fabriquer une combinaison anti‑radiations. Je dois étudier cette créature… il doit y avoir un moyen d’exploiter ce pouvoir.",
          "Les dinos Radioactive sont dangereux mais très utiles. Leur pulsation radioactive augmente d’environ 3× la chance de mutation des bébés (ne se cumule pas avec d’autres bonus de mutation, sauf traits génétiques de mutation)."
        ]
      },
      {
        key: 'nightmare',
        name: 'Nightmare',
        paragraphs: [
          "Une nuit, j’ai croisé ce qui ressemblait à une ombre vivante, et cela me donne encore des cauchemars. Le monde est devenu plus froid à mesure que l’ombre avançait, et je pouvais distinguer ses yeux blancs dans l’obscurité. Je ne dormirai pas paisiblement de sitôt.",
          "Les dinos Nightmare sont entièrement noirs, à l’exception de leurs yeux blancs inquiétants. Ils aspirent la chaleur autour d’eux, vous donnant un frisson. Une fois apprivoisés, ils laissent parfois des perles noires."
        ]
      },
      {
        key: 'crystalline',
        name: 'Crystalline',
        paragraphs: [
          "Les dinos Crystalline sont faits de cristaux et de gemmes : dangereux mais fragiles. Souvent qualifiés de ‘canons de verre’, ils infligent plus de dégâts, mais en subissent également davantage. Lors d’attaques de mêlée, les dégâts peuvent être renvoyés à l’assaillant — et des éclats de cristal peuvent se détacher et tomber au sol."
        ]
      },
      {
        key: 'pygmy-colossal',
        name: 'Pygmy & Colossal',
        paragraphs: [
          "Le nanisme insulaire et le gigantisme sont des phénomènes bien connus dans la nature, mais les voir coexister dans un même écosystème est déconcertant — même pour moi. J’ai vu des stégosaures adultes de tailles radicalement différentes, d’un Pygmy Stegosaur jusqu’à des bêtes véritablement Colossal.",
          "Les Pygmys sont plus petits que la moyenne, mais compensent par une vitesse accrue pour s’échapper plus vite ! Les Colossal, eux, sont plus grands et plus forts (vie et dégâts de mêlée augmentés), mais plus lents et plus gourmands en endurance."
        ]
      },
      {
        key: 'tinies',
        name: 'Tinies (Bolstering, Hydrating, Invigorating, Obscured, Pyrethrous, Revitalizing, Serene)',
        paragraphs: [
          "Parmi toute la faune, peu de créatures éprouvent autant la patience que ces petits voleurs sous‑mordus : les pegomastax. J’ai dû les poursuivre bien des fois pour récupérer du matériel… et pourtant, je ne peux pas les haïr. Mon instinct serait de les chasser, mais ce n’est pas ma voie. J’ai choisi de les observer, et d’en apprivoiser quelques‑uns. J’en suis ravi : ils sont étonnamment attachants, et ramènent souvent des babioles.",
          "L’une d’entre eux est spéciale, toujours à mes côtés. Plus belle que les autres, avec des couleurs argent et or. Mais ce n’est pas tout : lorsqu’elle est sur mon épaule, je me sens plus calme et concentré. Et parlant d’épaule… Lors d’une sortie dans une grotte infestée de scorpions et d’araignées, un petit compsognathus vert émeraude nous suivit. Avec un peu de viande, il devint notre compagnon. Il insista pour venir, et je compris vite pourquoi : face à un nœud de scorpions, ils ne me remarquèrent même pas. Je les ai contournés sans être inquiété. Pyrethrin — j’ai choisi ce nom — me protège d’une manière étonnante.",
          "Les Shiny Tinies sont des variantes spéciales disponibles uniquement pour les Shoulder Pets."
        ],
        list: [
          "Bolstering — Réduit le poids des objets dans l’inventaire du joueur",
          "Hydrating — Réduit la consommation d’eau",
          "Invigorating — Restaure lentement l’endurance, même en mouvement ou en nageant",
          "Obscured — Vous êtes caché aux dinos sauvages, réduisant fortement l’aggro",
          "Pyrethrous — Le pesticide naturel de ces Shinies éloigne les insectes",
          "Revitalizing — Restaure lentement votre santé",
          "Serene — Une sérénité pure qui aide à se concentrer sur le craft"
        ]
      },
      {
        key: 'stats',
        name: 'Hardy, Stalwart, Inspired, Satiate, Hefty, Fierce',
        paragraphs: [
          "Ces dinos ont développé une force particulière dans une statistique précise, plus prononcée dans leurs gènes que chez d’autres dinos — ce qui les rend très recherchés pour l’élevage.",
          "Ils ont plus de chances d’obtenir de bonnes valeurs dans leur statistique favorisée — avant l’apprivoisement. Notez que ce n’est qu’une chance : il est probable qu’ils aient un bon jet, mais ce n’est pas garanti, puisque la distribution des statistiques reste aléatoire. Cela n’affecte que les niveaux sauvages initiaux ; le bonus d’apprivoisement reste entièrement aléatoire comme d’habitude."
        ],
        list: [
          "Hardy — Santé",
          "Stalwart — Endurance",
          "Inspired — Oxygène",
          "Satiate — Nourriture",
          "Hefty — Poids",
          "Fierce — Mêlée"
        ]
      }
    ],
    []
  );

  const handleImageChange = async (key, file) => {
    if (!file) return;
    try {
      setUploadingKey(key);
      const response = await shinyAPI.uploadImage(key, file);
      const url = response?.url;
      if (!url) return;
      setImages((prev) => ({
        ...prev,
        [key]: {
          url,
          name: file.name
        }
      }));
      showToast('Image Shiny sauvegardée.', 'success');
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.message ||
        'Erreur lors de l\'upload de l\'image.';
      console.error('Erreur upload image shiny:', error);
      showToast(message, 'error');
    } finally {
      setUploadingKey(null);
    }
  };

  return (
    <div className="guide-page">
      <Header />
      <main className="guide-page__content">
        <div className="guide-page__container">
          <h1 className="guide-page__title">
            <span className="guide-page__icon">✨</span>
            Guide des Shinys
          </h1>

          <div className="guide-page__intro">
            <p className="guide-page__intro-label">Extrait des notes d’un survivant inconnu</p>
            <p>
              Pour tout le temps que je peux passer à observer et cataloguer la faune de cet endroit étrange et
              merveilleux, je sais que je n’en viendrai jamais à bout, car il me suffit de tourner la tête pour
              tomber sur quelque chose de nouveau. Il m’apparaît clairement que les animaux de cet environnement
              possèdent des adaptations uniques, des caractéristiques spéciales qui les distinguent de leurs
              analogues de la préhistoire terrestre. Mais j’ai découvert des individus dotés de traits singuliers —
              des traits suffisamment constants pour mériter le nom de type, mais qui ne sont liés à aucun groupe
              de congénères, ni même à des espèces proches.
            </p>
            <p>
              Quel que soit le mécanisme qui pousse ces animaux à manifester des caractéristiques aussi étranges
              et parfois franchement surnaturelles, il ne semble pas limité par l’espèce ; il peut affecter des
              animaux très différents, apparemment au hasard. Est‑ce un virus capable de sauter d’une espèce à
              l’autre, réécrivant l’ADN pour imposer son schéma ? Ou un cryptosporidium aberrant, quelque entité
              entièrement autre, qui détourne et amplifie les corps qu’elle habite ? Avec les outils dont je dispose
              je ne le saurai peut‑être jamais, mais rien ne m’empêchera de deviner…
            </p>
          </div>

          <div className="guide-page__shiny-grid">
            {shinyTypes.map((type) => (
              <section key={type.key} className="guide-page__shiny-card">
                <div className="guide-page__shiny-media">
                  {images[type.key]?.url ? (
                    <img
                      src={images[type.key].url}
                      alt={type.name}
                      className="guide-page__shiny-image"
                    />
                  ) : (
                    <div className="guide-page__shiny-placeholder">
                      <span>Image</span>
                    </div>
                  )}

                  {user?.is_admin && (
                    <label className="guide-page__shiny-upload">
                      {uploadingKey === type.key
                        ? 'Upload en cours…'
                        : images[type.key]?.url
                        ? 'Changer l\'image'
                        : 'Ajouter une image'}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingKey === type.key}
                        onChange={(event) => handleImageChange(type.key, event.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>

                <div className="guide-page__shiny-content">
                  <h2 className="guide-page__shiny-title">{type.name}</h2>
                  {type.paragraphs?.map((paragraph, index) => {
                    if (typeof paragraph === 'string') {
                      return <p key={`${type.key}-p-${index}`}>{paragraph}</p>;
                    }

                    if (paragraph.highlight) {
                      return (
                        <p
                          key={`${type.key}-p-${index}`}
                          className="guide-page__shiny-highlight"
                        >
                          {paragraph.highlight}
                        </p>
                      );
                    }

                    return (
                      <p key={`${type.key}-p-${index}`} className="guide-page__shiny-emphasis">
                        <strong>{paragraph.emphasis}</strong>
                      </p>
                    );
                  })}
                  {type.list && (
                    <ul className="guide-page__shiny-list">
                      {type.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>

          <div className="guide-page__conclusion">
            <h2>Et pour conclure…</h2>
            <p>
              Et si ce n’était pas tout ? Les Shinys possèdent plus de 40 palettes de couleurs, qui apparaissent
              comme des noms sur les dinos Shiny. Certaines capacités listées ci‑dessus se combinent avec une couleur
              aléatoire, d’autres possèdent leurs propres couleurs.
            </p>
            <p>
              Si vous rencontrez un nom qui n’est pas listé ici, il s’agit probablement uniquement de sa coloration.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TutoShiny;
