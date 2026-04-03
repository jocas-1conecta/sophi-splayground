import { useState, useEffect, useMemo, useCallback } from 'react';
import { addWordToBank } from '../../../services/tuttiFruttiService';
import './TuttiFrutti.css';

const STATUS_CONFIG = {
  unique: { icon: '✅', label: '+10', className: 'unique' },
  shared: { icon: '🤝', label: '+5', className: 'shared' },
  maybe_valid: { icon: '🤔', label: '+5', className: 'shared' },
  invalid: { icon: '❌', label: '+0', className: 'invalid' },
  empty: { icon: '➖', label: '+0', className: 'empty' },
};

/**
 * Collect all maybe_valid words from the round details.
 * Returns an array of { key, answer, categoryId, player } objects.
 */
function collectMaybeValidWords(details) {
  const items = [];
  for (const d of details) {
    if (d.p1Status === 'maybe_valid' && d.p1Answer) {
      items.push({ key: `p1_${d.categoryId}`, answer: d.p1Answer, categoryId: d.categoryId, player: 'p1' });
    }
    if (d.p2Status === 'maybe_valid' && d.p2Answer) {
      items.push({ key: `p2_${d.categoryId}`, answer: d.p2Answer, categoryId: d.categoryId, player: 'p2' });
    }
  }
  return items;
}

export default function RevealPhase({
  details,
  categories,
  p1Total,
  p2Total,
  p1Name,
  p2Name,
  currentLetter,
  isMultiplayer,
  onComplete,
  onVote,
  opponentVotes,
  onScoreUpdate,
}) {
  const [revealIndex, setRevealIndex] = useState(-1);
  const [showTotal, setShowTotal] = useState(false);
  const [votingPhase, setVotingPhase] = useState(false);
  const [myVotes, setMyVotes] = useState({});      // { key: true/false }
  const [votingDone, setVotingDone] = useState(false);
  const [adjustedP1, setAdjustedP1] = useState(p1Total);
  const [adjustedP2, setAdjustedP2] = useState(p2Total);
  const [adjustedDetails, setAdjustedDetails] = useState(details);

  const maybeWords = useMemo(() => collectMaybeValidWords(details), [details]);
  const hasMaybeWords = maybeWords.length > 0;

  // Step 1: Reveal answers one by one
  useEffect(() => {
    if (votingPhase || showTotal) return;
    if (revealIndex < details.length - 1) {
      const timer = setTimeout(() => setRevealIndex((i) => i + 1), 1500);
      return () => clearTimeout(timer);
    } else if (revealIndex === details.length - 1 && !votingPhase) {
      // All revealed → enter voting if there are maybe_valid words
      const timer = setTimeout(() => {
        if (hasMaybeWords) {
          setVotingPhase(true);
        } else {
          setShowTotal(true);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [revealIndex, details.length, votingPhase, showTotal, hasMaybeWords]);

  // Step 2: Auto-complete in singleplayer (AI always approves)
  useEffect(() => {
    if (!votingPhase || isMultiplayer) return;
    // In singleplayer, AI auto-approves all words
    const aiVotes = {};
    maybeWords.forEach((w) => { aiVotes[w.key] = true; });
    // Small delay for UX, then auto-submit
    const timer = setTimeout(() => {
      processVoteResults(myVotes, aiVotes);
    }, 500);
    return () => clearTimeout(timer);
  }, [votingPhase, isMultiplayer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 3: Check if both players voted in multiplayer
  useEffect(() => {
    if (!votingPhase || !isMultiplayer || votingDone) return;

    const myDone = maybeWords.every((w) => myVotes[w.key] !== undefined);
    const oppDone = opponentVotes && maybeWords.every((w) => opponentVotes[w.key] !== undefined);

    if (myDone && oppDone) {
      processVoteResults(myVotes, opponentVotes);
    }
  }, [myVotes, opponentVotes, votingPhase, votingDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Process final results after voting
  const processVoteResults = useCallback((votes1, votes2) => {
    setVotingDone(true);

    let newP1 = p1Total;
    let newP2 = p2Total;
    const newDetails = details.map((d) => ({ ...d }));

    for (const word of maybeWords) {
      const bothApprove = votes1[word.key] === true && votes2[word.key] === true;

      if (bothApprove) {
        // Save word to DB
        addWordToBank(word.categoryId, currentLetter, word.answer);

        // Update scores: maybe_valid was 5pts, upgrade to 10pts (+5 bonus)
        const detailIdx = newDetails.findIndex((d) => d.categoryId === word.categoryId);
        if (detailIdx === -1) continue;

        if (word.player === 'p1') {
          newDetails[detailIdx].p1Status = 'unique';
          newDetails[detailIdx].p1Points = 10;
          newP1 += 5; // bonus
        } else {
          newDetails[detailIdx].p2Status = 'unique';
          newDetails[detailIdx].p2Points = 10;
          newP2 += 5; // bonus
        }
      }
    }

    setAdjustedDetails(newDetails);
    setAdjustedP1(newP1);
    setAdjustedP2(newP2);

    // Notify parent of updated scores
    if (onScoreUpdate && (newP1 !== p1Total || newP2 !== p2Total)) {
      onScoreUpdate(newP1, newP2);
    }

    // Brief delay then show total
    setTimeout(() => {
      setVotingPhase(false);
      setShowTotal(true);
    }, 1200);
  }, [details, p1Total, p2Total, maybeWords, currentLetter, onScoreUpdate]);

  // Step 4: onComplete after total shown
  useEffect(() => {
    if (showTotal) {
      const timer = setTimeout(() => onComplete?.(), 2500);
      return () => clearTimeout(timer);
    }
  }, [showTotal, onComplete]);

  // Handle my vote
  const handleVote = (wordKey, approve) => {
    setMyVotes((prev) => ({ ...prev, [wordKey]: approve }));
    // Broadcast vote to opponent
    if (isMultiplayer && onVote) {
      onVote(wordKey, approve);
    }
  };

  const getCategoryInfo = (catId) => {
    return categories.find((c) => c.id === catId) || { emoji: '❓', label: catId };
  };

  const displayDetails = votingDone ? adjustedDetails : details;
  const displayP1 = votingDone ? adjustedP1 : p1Total;
  const displayP2 = votingDone ? adjustedP2 : p2Total;

  return (
    <div className="tf-reveal">
      <h3 className="tf-reveal-title animate-fade-in">
        {votingPhase ? '¿Aceptar palabras? 🗳️' : 'Comparando respuestas...'}
      </h3>

      <div className="tf-reveal-list">
        {displayDetails.map((detail, idx) => {
          if (idx > revealIndex && !votingPhase && !showTotal) return null;
          const cat = getCategoryInfo(detail.categoryId);
          const p1Cfg = STATUS_CONFIG[detail.p1Status] || STATUS_CONFIG.empty;
          const p2Cfg = STATUS_CONFIG[detail.p2Status] || STATUS_CONFIG.empty;

          // Find maybe_valid words for this category
          const p1Maybe = maybeWords.find((w) => w.key === `p1_${detail.categoryId}`);
          const p2Maybe = maybeWords.find((w) => w.key === `p2_${detail.categoryId}`);

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

              {/* Voting UI for maybe_valid words */}
              {votingPhase && !votingDone && (p1Maybe || p2Maybe) && (
                <div className="tf-vote-section">
                  {[p1Maybe, p2Maybe].filter(Boolean).map((w) => (
                    <div key={w.key} className="tf-vote-item">
                      <span className="tf-vote-word">
                        ¿&quot;{w.answer}&quot; es válida?
                      </span>
                      {myVotes[w.key] === undefined ? (
                        <div className="tf-vote-buttons">
                          <button
                            className="tf-vote-btn tf-vote-yes"
                            onClick={() => handleVote(w.key, true)}
                          >
                            👍 Sí
                          </button>
                          <button
                            className="tf-vote-btn tf-vote-no"
                            onClick={() => handleVote(w.key, false)}
                          >
                            👎 No
                          </button>
                        </div>
                      ) : (
                        <span className="tf-vote-sent">
                          {myVotes[w.key] ? '✅ Aprobada' : '❌ Rechazada'}
                          {isMultiplayer && !opponentVotes?.[w.key] !== undefined &&
                            <span className="tf-vote-waiting"> (esperando...)</span>
                          }
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Post-vote result badges */}
              {votingDone && (p1Maybe || p2Maybe) && (
                <div className="tf-vote-result">
                  {[p1Maybe, p2Maybe].filter(Boolean).map((w) => {
                    const approved = myVotes[w.key] === true &&
                      (isMultiplayer ? opponentVotes?.[w.key] === true : true);
                    return (
                      <span key={w.key} className={`tf-vote-result-badge ${approved ? 'approved' : 'rejected'}`}>
                        {approved ? `✅ "${w.answer}" agregada al diccionario!` : `❌ "${w.answer}" no fue aceptada`}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Voting waiting message */}
      {votingPhase && !votingDone && isMultiplayer &&
        maybeWords.every((w) => myVotes[w.key] !== undefined) && (
        <div className="tf-vote-waiting-msg animate-fade-in">
          <span className="tf-vote-waiting-emoji">⏳</span>
          <p>Esperando el voto de tu oponente...</p>
        </div>
      )}

      {/* Round total */}
      {showTotal && (
        <div className="tf-reveal-total animate-pop-in">
          <div className="tf-reveal-total-player">
            <span className="tf-reveal-total-name">{p1Name}</span>
            <span className="tf-reveal-total-score">{displayP1}</span>
          </div>
          <span className="tf-reveal-total-dash">—</span>
          <div className="tf-reveal-total-player">
            <span className="tf-reveal-total-name">{p2Name}</span>
            <span className="tf-reveal-total-score">{displayP2}</span>
          </div>
        </div>
      )}
    </div>
  );
}
