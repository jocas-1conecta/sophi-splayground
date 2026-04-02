/* ══════════════════════════════════════════
   REWARDS CATALOG — Demo Data
   All rewards available in the game
   ══════════════════════════════════════════ */

export const REWARD_TYPES = {
  AVATAR: 'avatar',
  BADGE: 'badge',
  TITLE: 'title',
};

export const RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
};

export const RARITY_CONFIG = {
  [RARITY.COMMON]: {
    label: 'Común',
    color: 'var(--color-accent)',
    glow: 'rgba(163, 217, 165, 0.3)',
  },
  [RARITY.RARE]: {
    label: 'Raro',
    color: 'var(--color-primary)',
    glow: 'rgba(196, 167, 231, 0.4)',
  },
  [RARITY.EPIC]: {
    label: 'Épico',
    color: 'var(--color-secondary)',
    glow: 'rgba(235, 111, 146, 0.5)',
  },
};

/**
 * Full rewards catalog
 */
export const REWARDS_CATALOG = [
  // ── Avatars ──
  {
    id: 'avatar_cat_star',
    name: 'Gatita Estrella',
    description: '¡Un gatito brillante que te acompaña!',
    type: REWARD_TYPES.AVATAR,
    cost_points: 50,
    rarity: RARITY.COMMON,
    emoji: '🐱',
    is_active: true,
  },
  {
    id: 'avatar_unicorn',
    name: 'Unicornio Arcoíris',
    description: 'Mágico y colorido, ¡como tú!',
    type: REWARD_TYPES.AVATAR,
    cost_points: 100,
    rarity: RARITY.COMMON,
    emoji: '🦄',
    is_active: true,
  },
  {
    id: 'avatar_mermaid',
    name: 'Sirena Mágica',
    description: 'De las profundidades del mar... ¡a ganar!',
    type: REWARD_TYPES.AVATAR,
    cost_points: 200,
    rarity: RARITY.RARE,
    emoji: '🧜‍♀️',
    is_active: true,
  },
  {
    id: 'avatar_astronaut',
    name: 'Astronauta Cool',
    description: '¡Explorando las estrellas!',
    type: REWARD_TYPES.AVATAR,
    cost_points: 300,
    rarity: RARITY.RARE,
    emoji: '👩‍🚀',
    is_active: true,
  },
  {
    id: 'avatar_crystal_dragon',
    name: 'Dragona de Cristal',
    description: 'Poderosa y deslumbrante 🔥',
    type: REWARD_TYPES.AVATAR,
    cost_points: 500,
    rarity: RARITY.EPIC,
    emoji: '🐉',
    is_active: true,
  },
  {
    id: 'avatar_gamer_princess',
    name: 'Princesa Gamer',
    description: 'La reina de todos los juegos 👑',
    type: REWARD_TYPES.AVATAR,
    cost_points: 750,
    rarity: RARITY.EPIC,
    emoji: '👸',
    is_active: true,
  },

  // ── Badges ──
  {
    id: 'badge_first_win',
    name: 'Primera Victoria',
    description: '¡Ganaste tu primera partida!',
    type: REWARD_TYPES.BADGE,
    cost_points: 0,
    rarity: RARITY.COMMON,
    emoji: '🥇',
    is_active: true,
    auto_condition: 'first_win',
  },
  {
    id: 'badge_streak_5',
    name: 'Racha de 5',
    description: '¡5 victorias seguidas! Imparable.',
    type: REWARD_TYPES.BADGE,
    cost_points: 0,
    rarity: RARITY.RARE,
    emoji: '🔥',
    is_active: true,
    auto_condition: 'win_streak_5',
  },
  {
    id: 'badge_brain',
    name: 'Cerebrito',
    description: 'Ganaste 10 Batallas de Adivinanzas.',
    type: REWARD_TYPES.BADGE,
    cost_points: 0,
    rarity: RARITY.RARE,
    emoji: '🧠',
    is_active: true,
    auto_condition: 'riddle_wins_10',
  },
  {
    id: 'badge_popular',
    name: 'Amiga Popular',
    description: '¡Tienes 10 amigas!',
    type: REWARD_TYPES.BADGE,
    cost_points: 0,
    rarity: RARITY.EPIC,
    emoji: '💖',
    is_active: true,
    auto_condition: 'friends_10',
  },

  // ── Titles ──
  {
    id: 'title_star',
    name: 'Estrella',
    description: 'Brilla con tu propio nombre.',
    type: REWARD_TYPES.TITLE,
    cost_points: 100,
    rarity: RARITY.COMMON,
    emoji: '⭐',
    is_active: true,
    title_display: '⭐ Estrella',
  },
  {
    id: 'title_champion',
    name: 'Campeona',
    description: 'Un título digno de una ganadora.',
    type: REWARD_TYPES.TITLE,
    cost_points: 250,
    rarity: RARITY.RARE,
    emoji: '🏆',
    is_active: true,
    title_display: '🏆 Campeona',
  },
  {
    id: 'title_legend',
    name: 'Leyenda',
    description: 'Solo las mejores llegan aquí.',
    type: REWARD_TYPES.TITLE,
    cost_points: 500,
    rarity: RARITY.EPIC,
    emoji: '🌟',
    is_active: true,
    title_display: '🌟 Leyenda',
  },
];

/**
 * Get rewards by type
 */
export function getRewardsByType(type) {
  return REWARDS_CATALOG.filter((r) => r.type === type && r.is_active);
}

/**
 * Get purchasable rewards (cost > 0)
 */
export function getPurchasableRewards() {
  return REWARDS_CATALOG.filter((r) => r.cost_points > 0 && r.is_active);
}

/**
 * Get a single reward by ID
 */
export function getRewardById(id) {
  return REWARDS_CATALOG.find((r) => r.id === id);
}
