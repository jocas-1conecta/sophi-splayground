import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import { useRewardStore } from '../../stores/rewardStore';
import { REWARD_TYPES, RARITY_CONFIG, getRewardsByType } from '../../constants/rewardsCatalog';
import { showToast } from '../../components/feedback/Toast';
import { playSound } from '../../lib/audioManager';
import Modal from '../../components/ui/Modal';
import './Rewards.css';

const TABS = [
  { type: REWARD_TYPES.AVATAR, label: 'Avatares', emoji: '🎭' },
  { type: REWARD_TYPES.BADGE, label: 'Badges', emoji: '🏅' },
  { type: REWARD_TYPES.TITLE, label: 'Títulos', emoji: '✨' },
];

export default function RewardsPage() {
  const { user } = useAuthStore();
  const { profile, addLocalPoints } = useProfileStore();
  const { fetchRewards, isUnlocked, unlockReward } = useRewardStore();

  const [activeTab, setActiveTab] = useState(REWARD_TYPES.AVATAR);
  const [unlockModal, setUnlockModal] = useState(null); // reward being unlocked
  const [justUnlocked, setJustUnlocked] = useState(null); // celebration state

  useEffect(() => {
    if (user) fetchRewards(user.id);
  }, [user, fetchRewards]);

  const currentRewards = getRewardsByType(activeTab);
  const points = profile?.points || 0;

  const handleUnlock = (reward) => {
    if (isUnlocked(reward.id)) return;
    if (points < reward.cost_points) {
      showToast(`Necesitas ${reward.cost_points - points} puntos más`, 'error');
      return;
    }
    setUnlockModal(reward);
  };

  const confirmUnlock = () => {
    if (!unlockModal) return;

    const result = unlockReward(unlockModal.id, points, (cost) => {
      addLocalPoints(-cost);
    });

    if (result.success) {
      setJustUnlocked(result.reward);
      setUnlockModal(null);
      showToast(`¡Desbloqueaste: ${result.reward.name}! 🎉`, 'success');
      playSound('unlock');

      // Clear celebration after animation
      setTimeout(() => setJustUnlocked(null), 3000);
    } else {
      showToast(result.error, 'error');
      setUnlockModal(null);
    }
  };

  return (
    <div className="rewards-page">
      {/* Header */}
      <section className="rewards-header animate-fade-in-up">
        <h2 className="rewards-title">
          🏆 Tienda de Recompensas
        </h2>
        <div className="rewards-points-display">
          <span className="rewards-points-emoji">💎</span>
          <span className="rewards-points-value">{points}</span>
          <span className="rewards-points-label">puntos</span>
        </div>
      </section>

      {/* Tabs */}
      <nav className="rewards-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.type}
            className={`rewards-tab ${activeTab === tab.type ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.type)}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Rewards Grid */}
      <section className="rewards-grid stagger-children">
        {currentRewards.map((reward) => {
          const owned = isUnlocked(reward.id);
          const canAfford = points >= reward.cost_points;
          const isFree = reward.cost_points === 0;
          const rarityConfig = RARITY_CONFIG[reward.rarity];
          const isJustUnlocked = justUnlocked?.id === reward.id;

          return (
            <div
              key={reward.id}
              className={`reward-card card ${owned ? 'owned' : ''} ${isJustUnlocked ? 'just-unlocked' : ''}`}
              style={{ '--rarity-color': rarityConfig.color, '--rarity-glow': rarityConfig.glow }}
            >
              {/* Rarity badge */}
              <span className="reward-rarity-badge" style={{ background: rarityConfig.glow }}>
                {rarityConfig.label}
              </span>

              {/* Emoji / Icon */}
              <span className={`reward-emoji ${isJustUnlocked ? 'animate-pop-in' : ''}`}>
                {reward.emoji}
              </span>

              {/* Info */}
              <h4 className="reward-name">{reward.name}</h4>
              <p className="reward-description">{reward.description}</p>

              {/* Action */}
              {owned ? (
                <span className="reward-owned-badge">✅ Desbloqueada</span>
              ) : isFree ? (
                <span className="reward-auto-badge">🔒 Auto-otorgada</span>
              ) : (
                <button
                  className={`btn reward-unlock-btn ${canAfford ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => handleUnlock(reward)}
                  disabled={!canAfford}
                >
                  {canAfford ? '🔓 Desbloquear' : '🔒'} {reward.cost_points} pts
                </button>
              )}
            </div>
          );
        })}
      </section>

      {/* Unlock Confirmation Modal */}
      {unlockModal && (
        <Modal onClose={() => setUnlockModal(null)}>
          <div className="reward-confirm-modal">
            <span className="reward-confirm-emoji">{unlockModal.emoji}</span>
            <h3 className="reward-confirm-title">¿Desbloquear?</h3>
            <p className="reward-confirm-name">{unlockModal.name}</p>
            <p className="reward-confirm-cost">
              💎 {unlockModal.cost_points} puntos
            </p>
            <p className="reward-confirm-balance">
              Te quedarán: {points - unlockModal.cost_points} puntos
            </p>
            <div className="reward-confirm-actions">
              <button className="btn btn-primary btn-full" onClick={confirmUnlock}>
                ¡Sí, desbloquear! 🎉
              </button>
              <button className="btn btn-ghost btn-full" onClick={() => setUnlockModal(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Celebration overlay */}
      {justUnlocked && (
        <div className="reward-celebration">
          <div className="reward-celebration-content animate-pop-in">
            <span className="reward-celebration-emoji">{justUnlocked.emoji}</span>
            <span className="reward-celebration-sparkles">✨</span>
          </div>
        </div>
      )}
    </div>
  );
}
