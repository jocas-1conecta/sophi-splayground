import { supabase, isDemoMode } from './supabase';

/* Demo search results */
const DEMO_PROFILES = {
  T3ST99: {
    id: 'new-friend-1',
    username: 'isabella_new',
    display_name: 'Isabella 🦋',
    avatar_id: 'avatar_06',
    friend_code: 'T3ST99',
  },
  LUN4S7: {
    id: 'friend-1',
    username: 'luna_star',
    display_name: 'Luna ⭐',
    avatar_id: 'avatar_01',
    friend_code: 'LUN4S7',
  },
};

export async function getProfile(userId) {
  if (isDemoMode) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Profile exists — return it
  if (data) return data;

  // Profile doesn't exist (trigger failed) — create it
  if (error && error.code === 'PGRST116') {
    return await ensureProfile(userId);
  }

  if (error) throw error;
  return data;
}

/**
 * Fallback: create profile from client if the DB trigger didn't fire
 */
async function ensureProfile(userId) {
  // Get user metadata for display_name
  const { data: { user } } = await supabase.auth.getUser();
  const displayName = user?.user_metadata?.display_name || 'Jugadora';
  const username = 'player_' + userId.substring(0, 8);
  const friendCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: displayName,
      username: username,
      friend_code: friendCode,
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('ensureProfile failed:', error);
    return null;
  }
  return data;
}

export async function updateProfile(userId, updates) {
  if (isDemoMode) return { id: userId, ...updates };
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function searchByFriendCode(friendCode) {
  if (isDemoMode) {
    const code = friendCode.toUpperCase();
    return DEMO_PROFILES[code] || null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, avatar_id, friend_code')
    .eq('friend_code', friendCode.toUpperCase())
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function addPoints(userId, points) {
  const { data, error } = await supabase.rpc('add_points', {
    p_user_id: userId,
    p_points: points,
  });
  if (error) throw error;
  return data;
}
