import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { useRewardStore } from '../../stores/rewardStore';
import { ROUTES } from '../../constants/routes';
import { showToast } from '../../components/feedback/Toast';
import './Profile.css';

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const { profile, fetchProfile, updateProfile } = useProfileStore();
  const { unlockedRewards, fetchRewards } = useRewardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (user && !profile) {
      fetchProfile(user.id);
    }
    if (user) {
      fetchRewards(user.id);
    }
  }, [user, profile, fetchProfile, fetchRewards]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setUsername(profile.username);
    }
  }, [profile]);

  async function handleSave() {
    const result = await updateProfile(user.id, {
      display_name: displayName.trim(),
      username: username.trim().toLowerCase(),
    });
    if (result.success) {
      showToast('¡Perfil actualizado! ✨', 'success');
      setIsEditing(false);
    } else {
      showToast(result.error || 'Error al guardar', 'error');
    }
  }

  if (!profile) {
    return (
      <div className="profile-loading">
        <span className="animate-spin">⏳</span> Cargando perfil...
      </div>
    );
  }

  const winRate =
    profile.games_played > 0
      ? Math.round((profile.games_won / profile.games_played) * 100)
      : 0;

  return (
    <div className="profile-page">
      {/* Avatar & Name */}
      <section className="profile-hero animate-fade-in-up">
        <div className="avatar avatar-xl">
          {profile.display_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h2 className="profile-name">{profile.display_name}</h2>
        <p className="profile-username">@{profile.username}</p>
        <div className="profile-code-badge badge badge-ghost">
          🔗 {profile.friend_code}
        </div>
      </section>

      {/* Stats */}
      <section className="profile-stats-grid stagger-children">
        <div className="card profile-stat">
          <span className="profile-stat-value text-gradient">{profile.points}</span>
          <span className="profile-stat-label">💎 Puntos</span>
        </div>
        <div className="card profile-stat">
          <span className="profile-stat-value">{profile.games_played}</span>
          <span className="profile-stat-label">🎮 Partidas</span>
        </div>
        <div className="card profile-stat">
          <span className="profile-stat-value">{profile.games_won}</span>
          <span className="profile-stat-label">🏆 Victorias</span>
        </div>
        <div className="card profile-stat">
          <span className="profile-stat-value">{winRate}%</span>
          <span className="profile-stat-label">📊 Win Rate</span>
        </div>
      </section>

      {/* Match History Link */}
      <Link to={ROUTES.HISTORY} className="profile-history-link card animate-fade-in-up">
        <span>📜</span>
        <span>Ver Historial de Partidas</span>
        <span className="profile-history-arrow">→</span>
      </Link>

      {/* My Rewards Preview */}
      <section className="profile-rewards-section card animate-fade-in-up">
        <h3 className="profile-section-title">🏆 Mis Recompensas</h3>
        {unlockedRewards.length > 0 ? (
          <div className="profile-rewards-preview">
            <p className="profile-rewards-count">
              {unlockedRewards.length} desbloqueada{unlockedRewards.length !== 1 ? 's' : ''}
            </p>
          </div>
        ) : (
          <p className="profile-rewards-empty">Aún no has desbloqueado recompensas</p>
        )}
        <Link to={ROUTES.REWARDS} className="btn btn-primary btn-full">
          Ir a la Tienda 🛍️
        </Link>
      </section>

      {/* Edit Profile */}
      <section className="profile-edit-section card animate-fade-in-up">
        <h3 className="profile-section-title">✏️ Editar Perfil</h3>

        {isEditing ? (
          <div className="profile-edit-form">
            <div className="input-group">
              <label className="input-label" htmlFor="edit-display-name">
                Nombre
              </label>
              <input
                id="edit-display-name"
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={30}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="edit-username">
                Usuario
              </label>
              <input
                id="edit-username"
                className="input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
              />
              <span className="input-hint">Solo letras, números y guiones bajos</span>
            </div>
            <div className="profile-edit-actions">
              <button className="btn btn-primary" onClick={handleSave}>
                Guardar ✅
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            className="btn btn-ghost btn-full"
            onClick={() => setIsEditing(true)}
          >
            Editar mi perfil ✏️
          </button>
        )}
      </section>

      {/* Sign Out */}
      <button className="btn btn-ghost btn-full profile-signout" onClick={signOut}>
        Cerrar Sesión 👋
      </button>
    </div>
  );
}
