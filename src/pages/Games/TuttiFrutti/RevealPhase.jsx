import { useState, useEffect } from 'react';
import './TuttiFrutti.css';

const STATUS_CONFIG = {
  unique: { icon: '✅', label: '+10', className: 'unique' },
  shared: { icon: '🤝', label: '+5', className: 'shared' },
  invalid: { icon: '❌', label: '+0', className: 'invalid' },
  empty: { icon: '➖', label: '+0', className: 'empty' },
};

export default function RevealPhase({ details, categories, p1Total, p2Total, p1Name, p2Name, onComplete }) {
  const [revealIndex, setRevealIndex] = useState(-1);
  const [showTotal, setShowTotal] = useState(false);

  useEffect(() => {
    if (revealIndex < details.length - 1) {
      const timer = setTimeout(() => setRevealIndex((i) => i + 1), 1500);
      return () => clearTimeout(timer);
    } else if (revealIndex === details.length - 1) {
      // All revealed → show total
      const timer = setTimeout(() => setShowTotal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [revealIndex, details.length]);

  useEffect(() => {
    if (showTotal) {
      const timer = setTimeout(() => onComplete?.(), 2500);
      return () => clearTimeout(timer);
    }
  }, [showTotal, onComplete]);

  const getCategoryInfo = (catId) => {
    return categories.find((c) => c.id === catId) || { emoji: '❓', label: catId };
  };

  return (
    <div className="tf-reveal">
      <h3 className="tf-reveal-title animate-fade-in">Comparando respuestas...</h3>

      <div className="tf-reveal-list">
        {details.map((detail, idx) => {
          if (idx > revealIndex) return null;
          const cat = getCategoryInfo(detail.categoryId);
          const p1Cfg = STATUS_CONFIG[detail.p1Status] || STATUS_CONFIG.empty;
          const p2Cfg = STATUS_CONFIG[detail.p2Status] || STATUS_CONFIG.empty;

          return (
            <div key={detail.categoryId} className="tf-reveal-row animate-fade-in-up">
              <div className="tf-reveal-category">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </div>

              <div className="tf-reveal-answers">
                {/* Player 1 */}
                <div className={`tf-reveal-answer tf-reveal-${p1Cfg.className}`}>
                  <span className="tf-reveal-text">
                    {detail.p1Answer || '—'}
                  </span>
                  <span className="tf-reveal-badge">
                    {p1Cfg.icon} {p1Cfg.label}
                  </span>
                </div>

                {/* Player 2 */}
                <div className={`tf-reveal-answer tf-reveal-${p2Cfg.className}`}>
                  <span className="tf-reveal-text">
                    {detail.p2Answer || '—'}
                  </span>
                  <span className="tf-reveal-badge">
                    {p2Cfg.icon} {p2Cfg.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Round total */}
      {showTotal && (
        <div className="tf-reveal-total animate-pop-in">
          <div className="tf-reveal-total-player">
            <span className="tf-reveal-total-name">{p1Name}</span>
            <span className="tf-reveal-total-score">{p1Total}</span>
          </div>
          <span className="tf-reveal-total-dash">—</span>
          <div className="tf-reveal-total-player">
            <span className="tf-reveal-total-name">{p2Name}</span>
            <span className="tf-reveal-total-score">{p2Total}</span>
          </div>
        </div>
      )}
    </div>
  );
}
