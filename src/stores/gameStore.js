import { create } from 'zustand';
import {
  createGameSession,
  updateGameSession,
  finalizeGame,
  createInvitation,
  respondToInvitation,
} from '../services/gameService';
import { GAME_INFO } from '../constants/gameConfig';

export const useGameStore = create((set, get) => ({
  /* ── State ── */
  currentSession: null,      // { id, game_type, player1_id, player2_id, status, ... }
  gameState: null,            // Game-specific state (board, answers, riddles, etc.)
  myRole: null,               // 'player1' | 'player2'
  isMyTurn: false,
  scores: { player1: 0, player2: 0 },
  quickChatMessages: [],      // [{ phrase_id, player_id, timestamp }]

  // Invitation flow
  pendingInvitation: null,    // Incoming invitation to show in modal
  sentInvitation: null,       // Outgoing invitation waiting for response
  inviteCountdown: 0,         // Seconds remaining for invitation

  isLoading: false,
  error: null,

  /* ── Create & Start Game ── */
  createGame: async (gameType, player1Id, player2Id) => {
    set({ isLoading: true, error: null });
    try {
      const session = await createGameSession(gameType, player1Id, player2Id);
      set({
        currentSession: session,
        myRole: 'player1',
        isMyTurn: true,
        gameState: null,
        scores: { player1: 0, player2: 0 },
        quickChatMessages: [],
        isLoading: false,
      });
      return session;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  joinGame: (session, myUserId) => {
    const role = session.player1_id === myUserId ? 'player1' : 'player2';
    set({
      currentSession: session,
      myRole: role,
      isMyTurn: role === 'player1', // Player 1 always starts
      gameState: null,
      scores: { player1: 0, player2: 0 },
      quickChatMessages: [],
    });
  },

  /* ── Game State Updates ── */
  setGameState: (gameState) => set({ gameState }),
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  setScores: (scores) => set({ scores }),

  updateSessionStatus: async (status) => {
    const { currentSession } = get();
    if (!currentSession) return;
    try {
      await updateGameSession(currentSession.id, { status });
      set({ currentSession: { ...currentSession, status } });
    } catch (err) {
      console.error('Failed to update session status:', err);
    }
  },

  /* ── Finalize ── */
  endGame: async (winnerId, gameState, metadata) => {
    const { currentSession } = get();
    if (!currentSession) return null;
    try {
      const result = await finalizeGame(
        currentSession.id,
        winnerId,
        gameState,
        metadata
      );
      set({ currentSession: { ...currentSession, ...result } });
      return result;
    } catch (err) {
      console.error('Failed to finalize game:', err);
      return null;
    }
  },

  /* ── Invitation Flow ── */
  sendInvite: async (senderId, receiverId, gameType) => {
    try {
      const invitation = await createInvitation(senderId, receiverId, gameType);
      set({ sentInvitation: invitation, inviteCountdown: 60 });
      return invitation;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  receiveInvite: (invitation) => {
    set({ pendingInvitation: invitation });
  },

  respondInvite: async (invitationId, accept) => {
    try {
      const status = accept ? 'accepted' : 'declined';
      await respondToInvitation(invitationId, status);
      set({ pendingInvitation: null });
      return status;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  cancelInvite: () => {
    set({ sentInvitation: null, inviteCountdown: 0 });
  },

  dismissInvite: () => {
    set({ pendingInvitation: null });
  },

  /* ── Quick Chat ── */
  addQuickChatMessage: (message) => {
    const { quickChatMessages } = get();
    const updated = [...quickChatMessages, { ...message, timestamp: Date.now() }];
    // Keep only last 20 messages
    set({ quickChatMessages: updated.slice(-20) });
  },

  /* ── Points Calculation ── */
  getPointsForResult: (gameType, result) => {
    const info = GAME_INFO[gameType];
    if (!info) return 0;
    switch (result) {
      case 'win': return info.pointsWin;
      case 'draw': return info.pointsDraw;
      case 'lose': return info.pointsLose;
      default: return 0;
    }
  },

  /* ── Cleanup ── */
  leaveGame: () => {
    set({
      currentSession: null,
      gameState: null,
      myRole: null,
      isMyTurn: false,
      scores: { player1: 0, player2: 0 },
      quickChatMessages: [],
      pendingInvitation: null,
      sentInvitation: null,
      inviteCountdown: 0,
      error: null,
    });
  },

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
