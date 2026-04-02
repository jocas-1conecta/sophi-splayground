import { create } from 'zustand';
import { isDemoMode } from '../services/supabase';
import { DEMO_PROFILE } from './authStore';
import { getProfile, updateProfile } from '../services/profileService';

export const useProfileStore = create((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId) => {
    if (isDemoMode) {
      set({ profile: DEMO_PROFILE, isLoading: false });
      return DEMO_PROFILE;
    }

    try {
      set({ isLoading: true, error: null });
      const profile = await getProfile(userId);
      set({ profile, isLoading: false });
      return profile;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return null;
    }
  },

  updateProfile: async (userId, updates) => {
    if (isDemoMode) {
      const { profile } = get();
      const updated = { ...profile, ...updates };
      set({ profile: updated, isLoading: false });
      return { success: true };
    }

    try {
      set({ isLoading: true, error: null });
      const profile = await updateProfile(userId, updates);
      set({ profile, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  addLocalPoints: (points) => {
    const { profile } = get();
    if (profile) {
      set({
        profile: {
          ...profile,
          points: profile.points + points,
        },
      });
    }
  },

  incrementGamesPlayed: () => {
    const { profile } = get();
    if (profile) {
      set({
        profile: {
          ...profile,
          games_played: profile.games_played + 1,
        },
      });
    }
  },

  incrementGamesWon: () => {
    const { profile } = get();
    if (profile) {
      set({
        profile: {
          ...profile,
          games_won: profile.games_won + 1,
        },
      });
    }
  },

  clear: () => set({ profile: null, isLoading: false, error: null }),
}));
