import { create } from 'zustand';
import {
  getFriends,
  getPendingReceived,
  getPendingSent,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriendship,
  checkExistingFriendship,
} from '../services/friendService';
import { searchByFriendCode } from '../services/profileService';

export const useFriendStore = create((set, get) => ({
  friends: [],
  pendingReceived: [],
  pendingSent: [],
  onlineUsers: {},
  isLoading: false,
  error: null,

  /* ── Fetch all data ── */
  fetchAll: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const [friends, received, sent] = await Promise.all([
        getFriends(userId),
        getPendingReceived(userId),
        getPendingSent(userId),
      ]);
      set({
        friends,
        pendingReceived: received,
        pendingSent: sent,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  /* ── Search by Friend Code ── */
  searchByCode: async (code) => {
    try {
      const profile = await searchByFriendCode(code);
      return profile;
    } catch (err) {
      throw err;
    }
  },

  /* ── Send request ── */
  sendRequest: async (myUserId, targetUserId) => {
    try {
      // Check if already exists
      const { exists, status } = await checkExistingFriendship(myUserId, targetUserId);
      if (exists) {
        if (status === 'accepted') throw new Error('¡Ya son amigas! 👯');
        if (status === 'pending') throw new Error('Ya hay una solicitud pendiente');
      }
      const result = await sendFriendRequest(myUserId, targetUserId);
      // Refresh sent list
      const sent = await getPendingSent(myUserId);
      set({ pendingSent: sent });
      return result;
    } catch (err) {
      throw err;
    }
  },

  /* ── Accept request ── */
  acceptRequest: async (requestId, userId) => {
    try {
      await acceptFriendRequest(requestId);
      // Refresh all lists
      const [friends, received] = await Promise.all([
        getFriends(userId),
        getPendingReceived(userId),
      ]);
      set({ friends, pendingReceived: received });
    } catch (err) {
      set({ error: err.message });
    }
  },

  /* ── Reject request ── */
  rejectRequest: async (requestId, userId) => {
    try {
      await rejectFriendRequest(requestId);
      const { pendingReceived } = get();
      set({
        pendingReceived: pendingReceived.filter((r) => r.id !== requestId),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  /* ── Remove friend ── */
  removeFriend: async (friendshipId, userId) => {
    try {
      await removeFriendship(friendshipId);
      const { friends } = get();
      set({
        friends: friends.filter((f) => f.friendship_id !== friendshipId),
      });
    } catch (err) {
      set({ error: err.message });
    }
  },

  /* ── Online/offline ── */
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  updateOnlineStatus: (userId, isOnline) => {
    const { onlineUsers } = get();
    set({ onlineUsers: { ...onlineUsers, [userId]: isOnline } });
  },

  /* ── Utility ── */
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
  clear: () =>
    set({
      friends: [],
      pendingReceived: [],
      pendingSent: [],
      onlineUsers: {},
      isLoading: false,
      error: null,
    }),
}));
