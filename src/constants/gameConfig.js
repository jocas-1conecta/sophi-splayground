/* ── Game Configuration ── */

export const GAME_TYPES = {
  TIC_TAC_TOE: 'tic_tac_toe',
  TUTTI_FRUTTI: 'tutti_frutti',
  RIDDLE_BATTLE: 'riddle_battle',
};

export const GAME_INFO = {
  [GAME_TYPES.TIC_TAC_TOE]: {
    name: '3 en Raya',
    emoji: '❌⭕',
    description: '¡El clásico! Coloca 3 en línea para ganar.',
    color: 'var(--color-sky)',
    pointsWin: 10,
    pointsDraw: 3,
    pointsLose: 1,
  },
  [GAME_TYPES.TUTTI_FRUTTI]: {
    name: 'Tutti Frutti',
    emoji: '📝',
    description: '¡Piensa rápido! Completa las categorías con la letra elegida.',
    color: 'var(--color-peach)',
    pointsWin: 25,
    pointsDraw: 10,
    pointsLose: 5,
    timerSeconds: 90,
    roundsPerGame: 3, // BO3
    scoring: {
      unique: 10,    // respuesta única
      shared: 5,     // respuesta repetida con la oponente
      empty: 0,      // vacía o inválida
    },
  },
  [GAME_TYPES.RIDDLE_BATTLE]: {
    name: 'Batalla de Adivinanzas',
    emoji: '🧩',
    description: '¿Quién adivina más? ¡La primera en 3 gana!',
    color: 'var(--color-lilac)',
    pointsWin: 20,
    pointsDraw: 8,
    pointsLose: 3,
    roundsPerGame: 5, // BO5
    winsNeeded: 3,
    timerPerRiddle: 30,
  },
};

export const TUTTI_FRUTTI_CATEGORIES = [
  { id: 'nombre', label: 'Nombre', emoji: '👤' },
  { id: 'animal', label: 'Animal', emoji: '🐾' },
  { id: 'color', label: 'Color', emoji: '🎨' },
  { id: 'pais', label: 'País', emoji: '🌎' },
  { id: 'fruta', label: 'Fruta', emoji: '🍓' },
  { id: 'objeto', label: 'Objeto', emoji: '📦' },
];

export const INVITATION_TIMEOUT_MS = 60000; // 60 seconds
export const DISCONNECT_TIMEOUT_MS = 30000; // 30 seconds
export const FRIEND_CODE_LENGTH = 6;
