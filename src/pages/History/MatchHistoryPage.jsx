import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMatchHistoryStore, relativeTime } from '../../stores/matchHistoryStore';
import { GAME_TYPES, GAME_INFO } from '../../constants/gameConfig';
import { ROUTES } from '../../constants/routes';
import './MatchHistory.css';

const FILTERS = [
  { id: 'all', label: 'Todos', emoji: '📜' },
  { id: GAME_TYPES.TIC_TAC_TOE, label: '3 en Raya', emoji: '❌' },
  { id: GAME_TYPES.RIDDLE_BATTLE, label: 'Adivinanzas', emoji: '🧩' },
  { id: GAME_TYPES.TUTTI_FRUTTI, label: 'Tutti Frutti', emoji: '📝' },
];

const RESULT_CONFIG = {
  win: { label: '¡Victoria!', emoji: '🏆', class: 'result-win' },
  draw: { label: 'Empate', emoji: '🤝', class: 'result-draw' },
  lose: { label: 'Derrota', emoji: '💔', class: 'result-lose' },
};

export default function MatchHistoryPage() {
  const { getFiltered, getStats } = useMatchHistoryStore();
  const [filter, setFilter] = useState('all');

  const matches = getFiltered(filter);
  const stats = getStats(filter);

  return (
    <div className="history-page">
      {/* Header */}
      <section className="history-header animate-fade-in-up">
        <h2 className="history-title">📜 Historial de Partidas</h2>

        {/* Quick Stats */}
        <div className="history-quick-stats">
          <div className="history-qs">
            <span className="history-qs-value">{stats.total}</span>
            <span className="history-qs-label">Jugadas</span>
          </div>
          <div className="history-qs win">
            <span className="history-qs-value">{stats.wins}</span>
            <span className="history-qs-label">Victorias</span>
          </div>
          <div className="history-qs draw">
            <span className="history-qs-value">{stats.draws}</span>
            <span className="history-qs-label">Empates</span>
          </div>
          <div className="history-qs lose">
            <span className="history-qs-value">{stats.losses}</span>
            <span className="history-qs-label">Derrotas</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <nav className="history-filters">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`history-filter ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            <span>{f.emoji}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </nav>

      {/* Match List */}
      {matches.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <span className="empty-state-emoji">🎮</span>
          <h3 className="empty-state-title">Sin partidas aún</h3>
          <p className="empty-state-description">
            ¡Ve al lobby y juega tu primera partida!
          </p>
          <Link to={ROUTES.LOBBY} className="btn btn-primary">
            Ir a jugar 🎮
          </Link>
        </div>
      ) : (
        <section className="history-list stagger-children">
          {matches.map((match) => {
            const gameInfo = GAME_INFO[match.game_type];
            const rc = RESULT_CONFIG[match.result] || RESULT_CONFIG.draw;

            return (
              <div
                key={match.id}
                className={`history-card card ${rc.class}`}
              >
                <div className="history-card-left">
                  <span className="history-card-emoji">{gameInfo?.emoji || '🎮'}</span>
                </div>

                <div className="history-card-center">
                  <span className="history-card-game">{gameInfo?.name || match.game_type}</span>
                  <span className="history-card-opponent">vs {match.opponent_name}</span>
                  <span className="history-card-time">{relativeTime(match.played_at)}</span>
                </div>

                <div className="history-card-right">
                  <span className="history-card-result-emoji">{rc.emoji}</span>
                  <span className="history-card-result-label">{rc.label}</span>
                  <span className="history-card-points">+{match.points_earned} pts</span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Total points earned */}
      {matches.length > 0 && (
        <div className="history-total-points animate-fade-in-up">
          💎 Total ganado: <strong>{stats.totalPoints} puntos</strong>
        </div>
      )}
    </div>
  );
}
