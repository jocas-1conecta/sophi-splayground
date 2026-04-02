import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useGameStore } from '../../stores/gameStore';
import { GAME_INFO } from '../../constants/gameConfig';
import QuickChat from '../../components/game/QuickChat';
import './GameLayout.css';

export default function GameLayout({ gameType, children }) {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const { currentSession, scores, leaveGame } = useGameStore();
  const info = GAME_INFO[gameType];

  const handleLeave = () => {
    leaveGame();
    navigate('/lobby');
  };

  return (
    <div className="game-layout">
      {/* Game Header */}
      <div className="game-header">
        <button className="btn btn-ghost btn-sm" onClick={handleLeave}>
          ← Salir
        </button>
        <div className="game-header-center">
          <span className="game-header-emoji">{info?.emoji}</span>
          <span className="game-header-name">{info?.name}</span>
        </div>
        <div className="game-header-score">
          <span className="game-score-value">{scores.player1}</span>
          <span className="game-score-divider">—</span>
          <span className="game-score-value">{scores.player2}</span>
        </div>
      </div>

      {/* Game Content */}
      <div className="game-content">
        {children}
      </div>

      {/* Quick Chat */}
      <QuickChat myPlayerId={user?.id} />
    </div>
  );
}
