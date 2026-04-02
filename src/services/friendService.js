import { supabase, isDemoMode } from './supabase';

/* ── Demo Mode Data ── */
const DEMO_FRIENDS = [
  {
    id: 'friend-1',
    friendship_id: 'fs-1',
    username: 'luna_star',
    display_name: 'Luna ⭐',
    avatar_id: 'avatar_01',
    friend_code: 'LUN4S7',
    points: 230,
    games_played: 18,
    games_won: 11,
  },
  {
    id: 'friend-2',
    friendship_id: 'fs-2',
    username: 'valentina_gamer',
    display_name: 'Valentina',
    avatar_id: 'avatar_02',
    friend_code: 'V4L3N7',
    points: 180,
    games_played: 14,
    games_won: 8,
  },
  {
    id: 'friend-3',
    friendship_id: 'fs-3',
    username: 'camila_pro',
    display_name: 'Camila 🎮',
    avatar_id: 'avatar_03',
    friend_code: 'C4M1L4',
    points: 310,
    games_played: 25,
    games_won: 16,
  },
];

const DEMO_PENDING_RECEIVED = [
  {
    id: 'req-1',
    requester: {
      id: 'pending-user-1',
      username: 'sofia_cute',
      display_name: 'Sofía 🌸',
      avatar_id: 'avatar_04',
      friend_code: 'S0F14C',
    },
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
];

const DEMO_PENDING_SENT = [
  {
    id: 'req-2',
    addressee: {
      id: 'pending-user-2',
      username: 'mariana_magic',
      display_name: 'Mariana ✨',
      avatar_id: 'avatar_05',
      friend_code: 'M4R14N',
    },
    created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  },
];

const DEMO_SEARCH_RESULTS = {
  LUN4S7: { ...DEMO_FRIENDS[0] },
  V4L3N7: { ...DEMO_FRIENDS[1] },
  C4M1L4: { ...DEMO_FRIENDS[2] },
  S0F14C: { ...DEMO_PENDING_RECEIVED[0].requester },
  M4R14N: { ...DEMO_PENDING_SENT[0].addressee },
  // A code that can be "found" for testing add-friend flow
  T3ST99: {
    id: 'new-friend-1',
    username: 'isabella_new',
    display_name: 'Isabella 🦋',
    avatar_id: 'avatar_06',
    friend_code: 'T3ST99',
    points: 50,
    games_played: 3,
    games_won: 1,
  },
};

/* ── Service Functions ── */

/**
 * Get all accepted friends for the current user
 */
export async function getFriends(userId) {
  if (isDemoMode) {
    return DEMO_FRIENDS;
  }

  // Friends where I'm requester
  const { data: asRequester, error: err1 } = await supabase
    .from('friendships')
    .select(`
      id,
      addressee:profiles!friendships_addressee_id_fkey (
        id, username, display_name, avatar_id, friend_code, points, games_played, games_won
      )
    `)
    .eq('requester_id', userId)
    .eq('status', 'accepted');

  if (err1) throw err1;

  // Friends where I'm addressee
  const { data: asAddressee, error: err2 } = await supabase
    .from('friendships')
    .select(`
      id,
      requester:profiles!friendships_requester_id_fkey (
        id, username, display_name, avatar_id, friend_code, points, games_played, games_won
      )
    `)
    .eq('addressee_id', userId)
    .eq('status', 'accepted');

  if (err2) throw err2;

  // Normalize into a flat list
  const friends = [
    ...asRequester.map((r) => ({ friendship_id: r.id, ...r.addressee })),
    ...asAddressee.map((r) => ({ friendship_id: r.id, ...r.requester })),
  ];

  return friends;
}

/**
 * Get pending friend requests I've received
 */
export async function getPendingReceived(userId) {
  if (isDemoMode) {
    return DEMO_PENDING_RECEIVED;
  }

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      created_at,
      requester:profiles!friendships_requester_id_fkey (
        id, username, display_name, avatar_id, friend_code
      )
    `)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get pending friend requests I've sent
 */
export async function getPendingSent(userId) {
  if (isDemoMode) {
    return DEMO_PENDING_SENT;
  }

  const { data, error } = await supabase
    .from('friendships')
    .select(`
      id,
      created_at,
      addressee:profiles!friendships_addressee_id_fkey (
        id, username, display_name, avatar_id, friend_code
      )
    `)
    .eq('requester_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Send friend request by friend code
 */
export async function sendFriendRequest(myUserId, targetUserId) {
  if (isDemoMode) {
    // Simulate success
    return { id: 'req-new-' + Date.now(), status: 'pending' };
  }

  const { data, error } = await supabase
    .from('friendships')
    .insert({
      requester_id: myUserId,
      addressee_id: targetUserId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requestId) {
  if (isDemoMode) {
    return { id: requestId, status: 'accepted' };
  }

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requestId) {
  if (isDemoMode) {
    return { id: requestId, status: 'rejected' };
  }

  const { data, error } = await supabase
    .from('friendships')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Remove a friendship
 */
export async function removeFriendship(friendshipId) {
  if (isDemoMode) {
    return true;
  }

  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', friendshipId);

  if (error) throw error;
  return true;
}

/**
 * Check if a friendship already exists between two users
 */
export async function checkExistingFriendship(userId1, userId2) {
  if (isDemoMode) {
    const existing = DEMO_FRIENDS.find((f) => f.id === userId2);
    if (existing) return { exists: true, status: 'accepted' };
    const pending = DEMO_PENDING_SENT.find((p) => p.addressee.id === userId2);
    if (pending) return { exists: true, status: 'pending' };
    return { exists: false, status: null };
  }

  const { data, error } = await supabase
    .from('friendships')
    .select('id, status')
    .or(
      `and(requester_id.eq.${userId1},addressee_id.eq.${userId2}),` +
      `and(requester_id.eq.${userId2},addressee_id.eq.${userId1})`
    )
    .neq('status', 'rejected');

  if (error) throw error;

  if (data && data.length > 0) {
    return { exists: true, status: data[0].status };
  }
  return { exists: false, status: null };
}
