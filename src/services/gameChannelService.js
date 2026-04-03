import { supabase, isDemoMode } from './supabase';

let currentChannel = null;

/**
 * Join a Broadcast channel for a game session.
 * Both players subscribe to the same channel.
 *
 * @param {string} sessionId - Game session UUID
 * @param {string} userId - Current user's ID
 * @param {function} onEvent - Callback for received events: (type, payload) => void
 * @returns {function} cleanup function
 */
export function joinGameChannel(sessionId, userId, onEvent) {
  if (isDemoMode || !supabase) return () => {};

  // Leave previous channel if any
  leaveGameChannel();

  const channelName = `game:${sessionId}`;
  currentChannel = supabase.channel(channelName);

  currentChannel
    .on('broadcast', { event: 'game_event' }, ({ payload }) => {
      // Don't process own events
      if (payload.senderId === userId) return;
      onEvent(payload.type, payload.data);
    })
    .subscribe();

  return () => leaveGameChannel();
}

/**
 * Send a game event to the other player via Broadcast.
 *
 * @param {string} type - Event type (e.g. 'move', 'submit_answers', 'basta')
 * @param {object} data - Event payload
 * @param {string} senderId - Current user's ID (to filter own messages)
 */
export function sendGameEvent(type, data, senderId) {
  if (!currentChannel) return;
  currentChannel.send({
    type: 'broadcast',
    event: 'game_event',
    payload: { type, data, senderId },
  });
}

/**
 * Leave the current game channel.
 */
export function leaveGameChannel() {
  if (currentChannel) {
    supabase?.removeChannel(currentChannel);
    currentChannel = null;
  }
}
