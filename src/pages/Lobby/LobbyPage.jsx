import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { GAME_INFO, GAME_TYPES } from '../../constants/gameConfig';
import { useAuthStore } from '../../stores/authStore';
import { useFriendStore } from '../../stores/friendStore';
import { useGameStore } from '../../stores/gameStore';
import Modal from '../../components/ui/Modal';
import './Lobby.css';

/* ── Game Card ── */
function GameCard({ type, info, isSelected, onSelect }) {
  return (
    <div
      className={`lobby-game-card card ${isSelected ? 'lobby-game-selected' : 'card-interactive'}`}
      onClick={() => onSelect(type)}
    >
      <div className="lobby-game-top">
        <span
          className="lobby-game-icon"
          style={{ '--game-color': info.color }}
        >
          {info.emoji}
        </span>
        <div className="lobby-game-header">
          <h3 className="lobby-game-title">{info.name}</h3>
          <p className="lobby-game-description">{info.description}</p>
        </div>
      </div>
      <div className="lobby-game-meta">
        <span className="badge badge-ghost">🏆 +{info.pointsWin} pts</span>
        {info.roundsPerGame && (
          <span className="badge badge-ghost">🔁 BO{info.roundsPerGame}</span>
        )}
        {info.timerSeconds && (
          <span className="badge badge-ghost">⏱ {info.timerSeconds}s</span>
        )}
        {info.timerPerRiddle && (
          <span className="badge badge-ghost">⏱ {info.timerPerRiddle}s/ronda</span>
        )}
      </div>
      {isSelected && (
        <div className="lobby-game-check animate-pop-in">✓ Seleccionado</div>
      )}
    </div>
  );
}

/* ── Friend Selector ── */
function FriendPicker({ friends, onlineUsers, onSelect, selectedId }) {
  const onlineFriends = friends.filter((f) => onlineUsers[f.id]);
  const offlineFriends = friends.filter((f) => !onlineUsers[f.id]);

  if (friends.length === 0) {
    return (
      <div className="lobby-no-friends">
        <span>🔍</span>
        <p>Agrega amigas para poder invitarlas a jugar</p>
      </div>
    );
  }

  return (
    <div className="friend-picker">
      {onlineFriends.length > 0 && (
        <div className="friend-picker-group">
          <span className="friend-picker-label">🟢 Online ({onlineFriends.length})</span>
          <div className="friend-picker-list">
            {onlineFriends.map((friend) => (
              <button
                key={friend.id}
                className={`friend-picker-item ${selectedId === friend.id ? 'selected' : ''}`}
                onClick={() => onSelect(friend)}
              >
                <div className="avatar-wrapper">
                  <div className="avatar avatar-sm">
                    {friend.display_name?.charAt(0) || '?'}
                  </div>
                  <span className="online-dot online" />
                </div>
                <span className="friend-picker-name">{friend.display_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {offlineFriends.length > 0 && (
        <div className="friend-picker-group">
          <span className="friend-picker-label">⚫ Offline ({offlineFriends.length})</span>
          <div className="friend-picker-list">
            {offlineFriends.map((friend) => (
              <button
                key={friend.id}
                className="friend-picker-item disabled"
                disabled
              >
                <div className="avatar-wrapper">
                  <div className="avatar avatar-sm avatar-muted">
                    {friend.display_name?.charAt(0) || '?'}
                  </div>
                  <span className="online-dot offline" />
                </div>
                <span className="friend-picker-name">{friend.display_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Waiting Modal ── */
function WaitingModal({ isOpen, friend, gameType, countdown, onCancel }) {
  const info = GAME_INFO[gameType];
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title="Esperando respuesta...">
      <div className="waiting-modal">
        <div className="waiting-avatar animate-pulse">
          <div className="avatar avatar-xl">
            {friend?.display_name?.charAt(0) || '?'}
          </div>
        </div>
        <p className="waiting-text">
          Esperando a que <strong>{friend?.display_name}</strong> acepte tu invitación a{' '}
          <strong>{info?.name}</strong>
        </p>
        <div className="waiting-timer">
          <div className="waiting-timer-bar">
            <div
              className="waiting-timer-fill"
              style={{ width: `${(countdown / 60) * 100}%` }}
            />
          </div>
          <span className="waiting-timer-text">{countdown}s</span>
        </div>
        <button className="btn btn-ghost" onClick={onCancel}>
          Cancelar invitación
        </button>
      </div>
    </Modal>
  );
}

/* ── Incoming Invite Modal ── */
function InviteModal({ isOpen, invitation, onAccept, onDecline }) {
  if (!invitation) return null;
  const info = GAME_INFO[invitation.game_type];

  return (
    <Modal isOpen={isOpen} onClose={onDecline} title="¡Te invitan a jugar! 🎮">
      <div className="invite-modal">
        <div className="invite-game-badge animate-pop-in">
          <span className="invite-game-emoji">{info?.emoji}</span>
          <span className="invite-game-name">{info?.name}</span>
        </div>
        <p className="invite-text">
          <strong>{invitation.from_name}</strong> quiere jugar contigo
        </p>
        <div className="invite-actions">
          <button className="btn btn-primary btn-full" onClick={onAccept}>
            ¡Vamos! 🎉
          </button>
          <button className="btn btn-ghost btn-full" onClick={onDecline}>
            Ahora no
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Main Lobby Page ── */
export default function LobbyPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { friends, onlineUsers, fetchAll } = useFriendStore();
  const {
    sendInvite,
    sentInvitation,
    inviteCountdown,
    cancelInvite,
    pendingInvitation,
    respondInvite,
    createGame,
  } = useGameStore();

  const [searchParams] = useSearchParams();
  const preselectedGame = searchParams.get('game');
  const validPreselect = preselectedGame && GAME_INFO[preselectedGame] ? preselectedGame : null;

  const [selectedGame, setSelectedGame] = useState(validPreselect);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [step, setStep] = useState(validPreselect ? 'friend' : 'game');

  // Load friends on mount
  useEffect(() => {
    if (user?.id) {
      fetchAll(user.id);
    }
  }, [user?.id, fetchAll]);

  // Invitation countdown timer
  useEffect(() => {
    if (!sentInvitation) return;
    const interval = setInterval(() => {
      const { inviteCountdown } = useGameStore.getState();
      if (inviteCountdown <= 1) {
        cancelInvite();
        clearInterval(interval);
      } else {
        useGameStore.setState({ inviteCountdown: inviteCountdown - 1 });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [sentInvitation, cancelInvite]);

  const handleSelectGame = (type) => {
    setSelectedGame(type);
    setStep('friend');
  };

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleInvite = async () => {
    if (!selectedGame || !selectedFriend || !user) return;
    try {
      await sendInvite(user.id, selectedFriend.id, selectedGame);
      // In demo mode, simulate acceptance after 2 seconds
      setTimeout(async () => {
        const { sentInvitation } = useGameStore.getState();
        if (sentInvitation) {
          const session = await createGame(
            selectedGame,
            user.id,
            selectedFriend.id
          );
          const gameSlug = selectedGame.replaceAll('_', '-');
          const targetUrl = `/game/${gameSlug}/${session.id}`;
          cancelInvite();
          // Use small delay to let state settle before navigating
          requestAnimationFrame(() => {
            navigate(targetUrl);
          });
        }
      }, 2000);
    } catch (err) {
      console.error('Failed to send invite:', err);
    }
  };

  const handleAcceptInvite = async () => {
    if (!pendingInvitation) return;
    try {
      await respondInvite(pendingInvitation.id, true);
      const session = await createGame(
        pendingInvitation.game_type,
        pendingInvitation.from_id,
        user.id
      );
      navigate(`/game/${pendingInvitation.game_type.replace('_', '-')}/${session.id}`);
    } catch (err) {
      console.error('Failed to accept invite:', err);
    }
  };

  const handleDeclineInvite = async () => {
    if (!pendingInvitation) return;
    await respondInvite(pendingInvitation.id, false);
  };

  return (
    <div className="lobby-page">
      {/* Header */}
      <div className="page-header animate-fade-in-up">
        <h2>🎮 {step === 'game' ? 'Elige un Juego' : 'Invita a una Amiga'}</h2>
        <p className="page-subtitle">
          {step === 'game'
            ? 'Selecciona un juego para empezar'
            : `Jugar ${GAME_INFO[selectedGame]?.name} con...`
          }
        </p>
      </div>

      {/* Step indicator */}
      <div className="lobby-steps animate-fade-in">
        <div className={`lobby-step ${step === 'game' ? 'active' : 'done'}`}>
          <span className="lobby-step-num">1</span>
          <span className="lobby-step-label">Juego</span>
        </div>
        <div className="lobby-step-line" />
        <div className={`lobby-step ${step === 'friend' ? 'active' : ''}`}>
          <span className="lobby-step-num">2</span>
          <span className="lobby-step-label">Amiga</span>
        </div>
      </div>

      {step === 'game' ? (
        /* ── Game Selection ── */
        <div className="lobby-games stagger-children">
          {Object.entries(GAME_INFO).map(([type, info]) => (
            <GameCard
              key={type}
              type={type}
              info={info}
              isSelected={selectedGame === type}
              onSelect={handleSelectGame}
            />
          ))}
        </div>
      ) : (
        /* ── Friend Selection ── */
        <div className="lobby-friend-step animate-fade-in-up">
          <button
            className="btn btn-ghost lobby-back-btn"
            onClick={() => setStep('game')}
          >
            ← Cambiar juego
          </button>

          <FriendPicker
            friends={friends}
            onlineUsers={onlineUsers}
            onSelect={handleSelectFriend}
            selectedId={selectedFriend?.id}
          />

          {selectedFriend && (
            <button
              className="btn btn-primary btn-full btn-lg lobby-invite-btn animate-pop-in"
              onClick={handleInvite}
            >
              Invitar a {selectedFriend.display_name} 💌
            </button>
          )}
        </div>
      )}

      {/* Waiting Modal */}
      <WaitingModal
        isOpen={!!sentInvitation}
        friend={selectedFriend}
        gameType={selectedGame}
        countdown={inviteCountdown}
        onCancel={cancelInvite}
      />

      {/* Incoming Invite Modal */}
      <InviteModal
        isOpen={!!pendingInvitation}
        invitation={pendingInvitation}
        onAccept={handleAcceptInvite}
        onDecline={handleDeclineInvite}
      />
    </div>
  );
}
