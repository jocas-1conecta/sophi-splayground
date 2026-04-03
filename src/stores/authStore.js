import { create } from 'zustand';
import { isDemoMode } from '../services/supabase';
import {
  signIn as authSignIn,
  signUp as authSignUp,
  signOut as authSignOut,
  signInWithGoogle as authSignInWithGoogle,
  getSession,
  onAuthStateChange,
} from '../services/authService';

// Demo user for when Supabase is not configured
const DEMO_USER = {
  id: 'demo-user-001',
  email: 'demo@sophis.play',
};

const DEMO_PROFILE = {
  id: 'demo-user-001',
  username: 'demo_player',
  display_name: 'Jugadora Demo',
  avatar_id: 'avatar_01',
  points: 150,
  games_played: 12,
  games_won: 7,
  friend_code: 'DEMO01',
  created_at: new Date().toISOString(),
};

export const useAuthStore = create((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  init: async () => {
    // Demo mode: auto-login with demo user
    if (isDemoMode) {
      set({
        user: DEMO_USER,
        session: { user: DEMO_USER },
        isLoading: false,
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const session = await getSession();
      set({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });

      onAuthStateChange((session) => {
        set({
          user: session?.user ?? null,
          session,
        });
      });
    } catch (error) {
      console.error('Auth init error:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  signIn: async (email, password) => {
    if (isDemoMode) {
      set({ user: DEMO_USER, session: { user: DEMO_USER }, isLoading: false });
      return { success: true };
    }

    try {
      set({ isLoading: true, error: null });
      const { user, session } = await authSignIn(email, password);
      set({ user, session, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signUp: async (email, password, displayName) => {
    if (isDemoMode) {
      set({ user: DEMO_USER, session: { user: DEMO_USER }, isLoading: false });
      return { success: true };
    }

    try {
      set({ isLoading: true, error: null });
      const { user, session } = await authSignUp(email, password, displayName);
      // Small delay to let DB trigger create the profile
      await new Promise((r) => setTimeout(r, 500));
      set({ user, session, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signInWithGoogle: async () => {
    if (isDemoMode) {
      set({ user: DEMO_USER, session: { user: DEMO_USER }, isLoading: false });
      return { success: true };
    }

    try {
      set({ isLoading: true, error: null });
      await authSignInWithGoogle();
      // OAuth redirects — session will be picked up by onAuthStateChange
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  signOut: async () => {
    if (isDemoMode) {
      set({ user: null, session: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      await authSignOut();
      // Clear all stores
      const { useProfileStore } = await import('./profileStore');
      useProfileStore.getState().clear();
      set({ user: null, session: null, isLoading: false });
    } catch (error) {
      // Force clear even on error
      set({ user: null, session: null, isLoading: false, error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));

export { DEMO_PROFILE };
