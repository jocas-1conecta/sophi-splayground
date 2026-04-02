import { create } from 'zustand';
import { isDemoMode } from '../services/supabase';
import { REWARDS_CATALOG, getRewardById } from '../constants/rewardsCatalog';

/**
 * Demo unlocked rewards (the user starts with a few)
 */
const DEMO_UNLOCKED = [
  { reward_id: 'badge_first_win', unlocked_at: new Date().toISOString() },
];

export const useRewardStore = create((set, get) => ({
  unlockedRewards: [],   // [{ reward_id, unlocked_at }]
  isLoading: false,

  /**
   * Fetch user's unlocked rewards
   */
  fetchRewards: async (userId) => {
    if (isDemoMode) {
      set({ unlockedRewards: DEMO_UNLOCKED, isLoading: false });
      return;
    }

    // Future: fetch from Supabase
    set({ isLoading: true });
    try {
      // const { data } = await supabase.from('user_rewards').select('*').eq('user_id', userId);
      set({ unlockedRewards: [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  /**
   * Check if a reward is unlocked
   */
  isUnlocked: (rewardId) => {
    return get().unlockedRewards.some((r) => r.reward_id === rewardId);
  },

  /**
   * Unlock a reward (spend points)
   * @returns {{ success: boolean, error?: string }}
   */
  unlockReward: (rewardId, currentPoints, deductPoints) => {
    const { unlockedRewards, isUnlocked } = get();
    const reward = getRewardById(rewardId);

    if (!reward) return { success: false, error: 'Recompensa no encontrada' };
    if (isUnlocked(rewardId)) return { success: false, error: 'Ya desbloqueada' };
    if (currentPoints < reward.cost_points) return { success: false, error: 'Puntos insuficientes' };

    // Add to unlocked list
    set({
      unlockedRewards: [
        ...unlockedRewards,
        { reward_id: rewardId, unlocked_at: new Date().toISOString() },
      ],
    });

    // Deduct points via profile store callback
    deductPoints(reward.cost_points);

    return { success: true, reward };
  },

  /**
   * Get all catalog items with unlock status
   */
  getCatalogWithStatus: () => {
    const { isUnlocked } = get();
    return REWARDS_CATALOG
      .filter((r) => r.is_active)
      .map((reward) => ({
        ...reward,
        unlocked: isUnlocked(reward.id),
      }));
  },

  clear: () => set({ unlockedRewards: [], isLoading: false }),
}));
