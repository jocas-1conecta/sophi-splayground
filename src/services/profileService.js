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
  if (error) throw error;
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
