// Stats des dinosaures ARK
export const baseStats = [
  { id: 'health', name: 'Vie', icon: '❤️', color: '#ff2a6d' },
  { id: 'stamina', name: 'Énergie', icon: '⚡', color: '#ffeb3b' },
  { id: 'oxygen', name: 'Oxygène', icon: '💨', color: '#00f0ff' },
  { id: 'food', name: 'Food', icon: '🍖', color: '#ff6b35' },
  { id: 'weight', name: 'Poids', icon: '⚖️', color: '#9e9e9e' },
  { id: 'damage', name: 'Attaque', icon: '⚔️', color: '#b842ff' }
];

// Stats spéciales pour certaines créatures
export const specialStats = [
  { id: 'crafting', name: 'Craft', icon: '🔨', color: '#39ff14', creatures: ['Helicoprion', 'Gacha'] }
];

// Vérifier si une créature a une stat spéciale
export const hasSpecialStat = (creatureName, statId) => {
  const specialStat = specialStats.find(stat => stat.id === statId);
  return specialStat?.creatures?.includes(creatureName) || false;
};

// Vérifier si une créature doit ignorer l'oxygène (aquatiques)
export const shouldIgnoreOxygen = (typeIds, types) => {
  // Si le dino est aquatique (id: 3), on ignore l'oxygène
  return typeIds?.includes(3);
};

// Calculer le niveau d'un dinosaure à partir de ses stats
// Niveau = somme de tous les points de stats + 1
export const calculateLevel = (stats, species, isAquatic = false) => {
  if (!stats) return 1;

  let total = 0;

  // Ajouter toutes les stats de base
  baseStats.forEach(stat => {
    // Ignorer l'oxygène pour les dinos aquatiques
    if (stat.id === 'oxygen' && isAquatic) return;

    const value = parseInt(stats[stat.id]) || 0;
    total += value;
  });

  // Ajouter la stat crafting pour Helicoprion et Gacha
  if ((species === 'Helicoprion' || species === 'Gacha') && stats.crafting) {
    total += parseInt(stats.crafting) || 0;
  }

  // Niveau = total des points + 1
  return total + 1;
};

// Calculer le niveau total avec mutations
export const calculateTotalLevel = (baseStats, mutatedStats, species, isAquatic = false) => {
  const baseLevel = calculateLevel(baseStats, species, isAquatic);
  const mutationPoints = calculateLevel(mutatedStats, species, isAquatic) - 1; // -1 car on ne veut que les points, pas le niveau
  return baseLevel + mutationPoints;
};

export default baseStats;
