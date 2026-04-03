import { supabase, isDemoMode } from './supabase';

let presenceChannel = null;

/**
 * Track user presence (online/offline).
 * Call on login, cleanup on logout.
 */
export function startPresence(userId) {
  if (isDemoMode || !supabase || presenceChannel) return;

  presenceChannel = supabase.channel('online-users', {
    config: { presence: { key: userId } },
  });

  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      const onlineIds = {};
      Object.keys(state).forEach((key) => {
        onlineIds[key] = true;
      });

      // Update friendStore
      import('../stores/friendStore').then(({ useFriendStore }) => {
        useFriendStore.getState().setOnlineUsers(onlineIds);
      });
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ user_id: userId, online_at: new Date().toISOString() });
      }
    });
}

/**
 * Stop tracking presence (called on logout)
 */
export function stopPresence() {
  if (presenceChannel) {
    presenceChannel.untrack();
    supabase.removeChannel(presenceChannel);
    presenceChannel = null;
  }
}
