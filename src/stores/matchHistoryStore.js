import { create } from 'zustand';

const STORAGE_KEY = 'sophis_match_history';

/**
 * Load history from localStorage
 */
function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save history to localStorage
 */
function saveHistory(matches) {
  try {
    // Keep only last 100
    const trimmed = matches.slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // localStorage full — ignore silently
  }
}

/**
 * Format relative time in Spanish
 */
export function relativeTime(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return new Date(isoDate).toLocaleDateString('es');
}

export const useMatchHistoryStore = create((set, get) => ({
  matches: loadHistory(),

  /**
   * Add a match to history
   * @param {{ game_type, opponent_name, result, points_earned, scores }} match
   */
  addMatch: (match) => {
    const entry = {
      id: 'match-' + Date.now(),
      played_at: new Date().toISOString(),
      ...match,
    };
    const updated = [entry, ...get().matches];
    set({ matches: updated });
    saveHistory(updated);
    return entry;
  },

  /**
   * Get history, optionally filtered by game type
   */
  getFiltered: (gameType) => {
    const { matches } = get();
    if (!gameType || gameType === 'all') return matches;
    return matches.filter((m) => m.game_type === gameType);
  },

  /**
   * Get stats by game type
   */
  getStats: (gameType) => {
    const filtered = get().getFiltered(gameType);
    return {
      total: filtered.length,
      wins: filtered.filter((m) => m.result === 'win').length,
      draws: filtered.filter((m) => m.result === 'draw').length,
      losses: filtered.filter((m) => m.result === 'lose').length,
      totalPoints: filtered.reduce((sum, m) => sum + (m.points_earned || 0), 0),
    };
  },

  clear: () => {
    set({ matches: [] });
    localStorage.removeItem(STORAGE_KEY);
  },
}));
