import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { supabase, isDemoMode } from '../../services/supabase';
import { GAME_INFO } from '../../constants/gameConfig';
import Modal from './Modal';

/**
 * Global listener for game invitations via Supabase Realtime.
 * Shows a modal when someone invites you to play.
 */
export default function GameInviteListener() {
  const { user } = useAuthStore();
  const { createGame, cancelInvite, sentInvitation } = useGameStore();
  const navigate = useNavigate();
  const [invite, setInvite] = useState(null);

  useEffect(() => {
    if (!user?.id || isDemoMode || !supabase) return;

    const channel = supabase
      .channel('game-invites')
      // Someone invited me
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_invitations',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const inv = payload.new;
          if (inv.status !== 'pending') return;

          // Fetch sender name
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', inv.sender_id)
            .single();

          setInvite({
            id: inv.id,
            senderId: inv.sender_id,
            senderName: sender?.display_name || 'Alguien',
            gameType: inv.game_type,
          });
        }
      )
      // My sent invitation was accepted
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_invitations',
          filter: `sender_id=eq.${user.id}`,
        },
        async (payload) => {
          const inv = payload.new;
          if (inv.status === 'accepted') {
            // Create game session and navigate
            try {
              const session = await createGame(inv.game_type, user.id, inv.receiver_id);
              cancelInvite();
              const gameSlug = inv.game_type.replaceAll('_', '-');
              navigate(`/game/${gameSlug}/${session.id}`);
            } catch (err) {
              console.error('Failed to start game after accept:', err);
            }
          } else if (inv.status === 'declined') {
            cancelInvite();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, navigate, createGame, cancelInvite]);

  const handleAccept = useCallback(async () => {
    if (!invite) return;
    try {
      // Update invitation status
      await supabase
        .from('game_invitations')
        .update({ status: 'accepted' })
        .eq('id', invite.id);

      // Create game session (inviter is player1)
      const session = await createGame(invite.gameType, invite.senderId, user.id);
      setInvite(null);
      const gameSlug = invite.gameType.replaceAll('_', '-');
      navigate(`/game/${gameSlug}/${session.id}`);
    } catch (err) {
      console.error('Failed to accept invite:', err);
    }
  }, [invite, user?.id, createGame, navigate]);

  const handleDecline = useCallback(async () => {
    if (!invite) return;
    await supabase
      .from('game_invitations')
      .update({ status: 'declined' })
      .eq('id', invite.id);
    setInvite(null);
  }, [invite]);

  if (!invite) return null;

  const info = GAME_INFO[invite.gameType];

  return (
    <Modal isOpen={true} onClose={handleDecline} title="¡Te invitan a jugar! 🎮">
      <div className="invite-modal">
        <div className="invite-game-badge animate-pop-in">
          <span className="invite-game-emoji">{info?.emoji}</span>
          <span className="invite-game-name">{info?.name}</span>
        </div>
        <p className="invite-text">
          <strong>{invite.senderName}</strong> quiere jugar contigo
        </p>
        <div className="invite-actions">
          <button className="btn btn-primary btn-full" onClick={handleAccept}>
            ¡Vamos! 🎉
          </button>
          <button className="btn btn-ghost btn-full" onClick={handleDecline}>
            Ahora no
          </button>
        </div>
      </div>
    </Modal>
  );
}
