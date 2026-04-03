import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { ROUTES } from '../../constants/routes';
import { GAME_INFO, GAME_TYPES } from '../../constants/gameConfig';
import './HomePage.css';

export default function HomePage() {
  const { user } = useAuthStore();
  const { profile, fetchProfile } = useProfileStore();

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile]);

  const greeting = getGreeting();

  return (
    <div className="home-page">
      {/* Welcome Section */}
      <section className="home-welcome animate-fade-in-up">
        <h2 className="home-greeting">
          {greeting},{' '}
          <span className="text-gradient">
            {profile?.display_name || 'Jugadora'}
          </span>{' '}
          👋
        </h2>
        <p className="home-subtitle">¿Lista para jugar?</p>
      </section>

      {/* Quick Stats */}
      {profile && (
        <section className="home-stats stagger-children">
          <div className="home-stat-card card">
            <span className="home-stat-emoji">🎮</span>
            <span className="home-stat-value">{profile.games_played}</span>
            <span className="home-stat-label">Partidas</span>
          </div>
          <div className="home-stat-card card">
            <span className="home-stat-emoji">🏆</span>
            <span className="home-stat-value">{profile.games_won}</span>
            <span className="home-stat-label">Victorias</span>
          </div>
          <div className="home-stat-card card">
            <span className="home-stat-emoji">💎</span>
            <span className="home-stat-value">{profile.points}</span>
            <span className="home-stat-label">Puntos</span>
          </div>
        </section>
      )}

      {/* Games Preview */}
      <section className="home-games">
        <h3 className="home-section-title">🎯 Juegos Disponibles</h3>
        <div className="home-games-grid stagger-children">
          {Object.entries(GAME_INFO).map(([type, info]) => (
            <Link
              key={type}
              to={`${ROUTES.LOBBY}?game=${type}`}
              className="home-game-card card card-interactive"
            >
              <span className="home-game-emoji">{info.emoji}</span>
              <div className="home-game-info">
                <h4 className="home-game-name">{info.name}</h4>
                <p className="home-game-desc">{info.description}</p>
              </div>
              <span className="home-game-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Friend Code Card */}
      {profile && (
        <section className="home-friend-code animate-fade-in-up">
          <div className="card home-code-card">
            <p className="home-code-label">Tu código de amiga</p>
            <p className="home-code-value">{profile.friend_code}</p>
            <p className="home-code-hint">
              ¡Comparte este código para que te agreguen! 🤝
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return '¡Buenos días';
  if (hour < 18) return '¡Buenas tardes';
  return '¡Buenas noches';
}
