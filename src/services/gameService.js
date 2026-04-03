import { supabase, isDemoMode } from './supabase';

/* ── Demo Data ── */
const DEMO_GAME_SESSION = {
  id: 'demo-session-001',
  game_type: null,
  player1_id: 'demo-user-001',
  player2_id: null,
  status: 'playing',
  winner_id: null,
  game_state: null,
  metadata: null,
  started_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

/* ── Game Sessions ── */

export async function createGameSession(gameType, player1Id, player2Id) {
  if (isDemoMode) {
    const session = {
      ...DEMO_GAME_SESSION,
      id: 'session-' + Date.now(),
      game_type: gameType,
      player1_id: player1Id,
      player2_id: player2Id,
      status: 'waiting',
    };
    return session;
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .insert({
      game_type: gameType.replaceAll('_', '-'),
      player1_id: player1Id,
      player2_id: player2Id,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateGameSession(sessionId, updates) {
  if (isDemoMode) {
    return { id: sessionId, ...updates };
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getGameSession(sessionId) {
  if (isDemoMode) {
    return { ...DEMO_GAME_SESSION, id: sessionId };
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

/* ── Game Invitations ── */

export async function createInvitation(senderId, receiverId, gameType) {
  if (isDemoMode) {
    return {
      id: 'invite-' + Date.now(),
      sender_id: senderId,
      receiver_id: receiverId,
      game_type: gameType,
      status: 'pending',
      expires_at: new Date(Date.now() + 60000).toISOString(),
      created_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('game_invitations')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      game_type: gameType,
      status: 'pending',
      expires_at: new Date(Date.now() + 60000).toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function respondToInvitation(invitationId, status) {
  if (isDemoMode) {
    return { id: invitationId, status };
  }

  const { data, error } = await supabase
    .from('game_invitations')
    .update({ status })
    .eq('id', invitationId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/* ── Finalize Game ── */

export async function finalizeGame(sessionId, winnerId, gameState, metadata) {
  if (isDemoMode) {
    return {
      id: sessionId,
      status: 'completed',
      winner_id: winnerId,
      game_state: gameState,
      metadata,
      completed_at: new Date().toISOString(),
    };
  }

  const { data, error } = await supabase
    .from('game_sessions')
    .update({
      status: 'completed',
      winner_id: winnerId,
      game_state: gameState,
      metadata,
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
