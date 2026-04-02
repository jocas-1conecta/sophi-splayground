import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GAME_TYPES, GAME_INFO } from '../../../constants/gameConfig';
import { getRandomRiddles } from '../../../constants/riddleBank';
import {
  checkRiddleAnswer,
  determineRoundWinner,
  checkBO5Winner,
  isMatchOver,
} from '../../../lib/riddleBattleLogic';
import { useAuthStore } from '../../../stores/authStore';
import { useGameStore } from '../../../stores/gameStore';
import { useProfileStore } from '../../../stores/profileStore';
import { useMatchHistoryStore } from '../../../stores/matchHistoryStore';
import { playSound } from '../../../lib/audioManager';
import GameLayout from '../GameLayout';
import ScoreTracker from './ScoreTracker';
import RiddleCard from './RiddleCard';
import './RiddleBattle.css';

const GAME_TYPE = GAME_TYPES.RIDDLE_BATTLE;
const INFO = GAME_INFO[GAME_TYPE];
const TIMER_SECONDS = INFO.timerPerRiddle; // 30s
const WINS_NEEDED = INFO.winsNeeded; // 3
const MAX_ROUNDS = INFO.roundsPerGame; // 5

// Game phases for each round
const PHASE = {
  COUNTDOWN: 'countdown',  // 3-2-1 before round
  ANSWERING: 'answering',  // Player is typing answer
  WAITING: 'waiting',      // Waiting for opponent
  REVEAL: 'reveal',        // Show who won the round
  GAME_OVER: 'game_over',  // Match finished
};

export default function RiddleBattlePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { setScores } = useGameStore();
  const { addLocalPoints, incrementGamesPlayed, incrementGamesWon } = useProfileStore();
  const { addMatch } = useMatchHistoryStore();
  const pointsAwarded = useRef(false);

  // Game state
  const [riddles, setRiddles] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [phase, setPhase] = useState(PHASE.COUNTDOWN);
  const [countdown, setCountdown] = useState(3);

  // Scores
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);

  // Round state
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [answer, setAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerTimeMs, setAnswerTimeMs] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Refs
  const roundStartTime = useRef(Date.now());
  const timerInterval = useRef(null);
  const inputRef = useRef(null);

  const opponentName = 'Luna ⭐';

  // ── Load riddles on mount ──
  useEffect(() => {
    const loaded = getRandomRiddles(MAX_ROUNDS);
    setRiddles(loaded);
  }, []);

  // ── Countdown (3-2-1) ──
  useEffect(() => {
    if (phase !== PHASE.COUNTDOWN) return;

    if (countdown <= 0) {
      setPhase(PHASE.ANSWERING);
      roundStartTime.current = Date.now();
      setTimer(TIMER_SECONDS);
      return;
    }

    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // ── Answer timer ──
  useEffect(() => {
    if (phase !== PHASE.ANSWERING) return;

    timerInterval.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          // Time's up — auto-submit empty
          clearInterval(timerInterval.current);
          handleSubmitAnswer('', TIMER_SECONDS * 1000);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);

    return () => clearInterval(timerInterval.current);
  }, [phase, currentRound]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Show hint at 15s ──
  useEffect(() => {
    if (phase === PHASE.ANSWERING && timer <= 15 && !showHint) {
      setShowHint(true);
    }
    if (phase === PHASE.ANSWERING && timer <= 10 && timer > 0) {
      playSound('countdown');
    }
  }, [phase, timer, showHint]);

  // ── Submit answer ──
  const handleSubmitAnswer = useCallback((submittedAnswer, timeMs) => {
    if (answerSubmitted) return;

    const finalAnswer = submittedAnswer ?? answer;
    const finalTime = timeMs ?? (Date.now() - roundStartTime.current);

    setAnswerSubmitted(true);
    setAnswerTimeMs(finalTime);
    clearInterval(timerInterval.current);

    setPhase(PHASE.WAITING);

    // Simulate AI response after 0.8-2s
    const aiDelay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const currentRiddle = riddles[currentRound];
      if (!currentRiddle) return;

      // AI answers correctly ~55% of the time, with random speed
      const aiCorrectChance = Math.random();
      const aiAnswer = aiCorrectChance < 0.55 ? currentRiddle.answer : 'no sé';
      const aiTime = 3000 + Math.random() * (TIMER_SECONDS * 1000 - 5000); // 3-25s

      // Determine round winner
      const result = determineRoundWinner(
        { answer: finalAnswer, timeMs: finalTime },
        { answer: aiAnswer, timeMs: aiTime },
        currentRiddle.answer
      );

      setRoundResult({
        ...result,
        myAnswer: finalAnswer,
        aiAnswer: aiAnswer,
        myTime: finalTime,
        aiTime: aiTime,
      });

      // Update wins
      let newP1 = p1Wins;
      let newP2 = p2Wins;

      if (result.winner === 'player1') {
        newP1 = p1Wins + 1;
        setP1Wins(newP1);
      } else if (result.winner === 'player2') {
        newP2 = p2Wins + 1;
        setP2Wins(newP2);
      }

      setPhase(PHASE.REVEAL);

      // Sound feedback
      if (result.winner === 'player1') playSound('correct');
      else if (result.winner === 'player2') playSound('wrong');

      // After reveal, check if match is over
      setTimeout(() => {
        if (isMatchOver(newP1, newP2, currentRound + 1)) {
          setPhase(PHASE.GAME_OVER);
        } else {
          // Next round
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          resetRound();
        }
      }, 3000);
    }, aiDelay);
  }, [answer, answerSubmitted, currentRound, riddles, p1Wins, p2Wins]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetRound = () => {
    setPhase(PHASE.COUNTDOWN);
    setCountdown(3);
    setTimer(TIMER_SECONDS);
    setAnswer('');
    setAnswerSubmitted(false);
    setAnswerTimeMs(null);
    setRoundResult(null);
    setShowHint(false);
  };

  const handleSubmitClick = () => {
    if (!answer.trim()) return;
    handleSubmitAnswer(answer, Date.now() - roundStartTime.current);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmitClick();
  };

  // ── Update scores + award points ──
  useEffect(() => {
    if (phase !== PHASE.GAME_OVER || pointsAwarded.current) return;

    setScores({ player1: p1Wins, player2: p2Wins });

    const winner = checkBO5Winner(p1Wins, p2Wins);
    let result, pts;
    if (!winner || winner === 'draw') {
      result = 'draw';
      pts = INFO.pointsDraw;
    } else if (winner === 'player1') {
      result = 'win';
      pts = INFO.pointsWin;
      incrementGamesWon();
      playSound('win');
    } else {
      result = 'lose';
      pts = INFO.pointsLose;
      playSound('lose');
    }

    addLocalPoints(pts);
    incrementGamesPlayed();
    addMatch({
      game_type: GAME_TYPE,
      opponent_name: opponentName,
      result,
      points_earned: pts,
      scores: { player1: p1Wins, player2: p2Wins },
    });
    pointsAwarded.current = true;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const matchWinner = checkBO5Winner(p1Wins, p2Wins);
  const iWon = matchWinner === 'player1';
  const currentRiddle = riddles[currentRound];

  const getResultMessage = () => {
    if (!matchWinner) return `¡Empate ${p1Wins}-${p2Wins}! 🤝`;
    return iWon ? '¡Ganaste la batalla! 🎉' : `${opponentName} ganó 😊`;
  };

  const getResultPoints = () => {
    if (!matchWinner || matchWinner === 'draw') return `+${INFO.pointsDraw} puntos`;
    return iWon ? `+${INFO.pointsWin} puntos` : `+${INFO.pointsLose} puntos`;
  };

  const handlePlayAgain = () => {
    const loaded = getRandomRiddles(MAX_ROUNDS);
    setRiddles(loaded);
    setCurrentRound(0);
    setP1Wins(0);
    setP2Wins(0);
    resetRound();
    pointsAwarded.current = false;
  };

  if (riddles.length === 0) {
    return (
      <GameLayout gameType={GAME_TYPE}>
        <div className="rb-loading animate-pulse">
          <span>🧩</span>
          <p>Cargando adivinanzas...</p>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout gameType={GAME_TYPE}>
      <div className="rb-container">
        {/* Score tracker */}
        <ScoreTracker
          p1Wins={p1Wins}
          p2Wins={p2Wins}
          currentRound={currentRound}
          totalRounds={MAX_ROUNDS}
          p1Name="Tú"
          p2Name={opponentName}
        />

        {/* Round indicator */}
        <div className="rb-round-badge animate-fade-in">
          <span>Ronda {Math.min(currentRound + 1, MAX_ROUNDS)} de {MAX_ROUNDS}</span>
        </div>

        {/* ── COUNTDOWN ── */}
        {phase === PHASE.COUNTDOWN && (
          <div className="rb-countdown animate-pop-in" key={`cd-${countdown}`}>
            <span className="rb-countdown-num">{countdown || '¡Ya!'}</span>
          </div>
        )}

        {/* ── ANSWERING ── */}
        {(phase === PHASE.ANSWERING || phase === PHASE.WAITING) && (
          <>
            {/* Timer ring */}
            <div className="rb-timer">
              <svg className="rb-timer-svg" viewBox="0 0 100 100">
                <circle className="rb-timer-bg" cx="50" cy="50" r="45" />
                <circle
                  className="rb-timer-fill"
                  cx="50" cy="50" r="45"
                  style={{
                    strokeDasharray: 283,
                    strokeDashoffset: 283 - (283 * timer) / TIMER_SECONDS,
                  }}
                />
              </svg>
              <span className={`rb-timer-text ${timer <= 10 ? 'danger' : ''}`}>
                {timer}
              </span>
            </div>

            {/* Riddle card */}
            <RiddleCard riddle={currentRiddle} showHint={showHint} showAnswer={false} />

            {/* Answer input */}
            {phase === PHASE.ANSWERING ? (
              <div className="rb-answer-area animate-fade-in-up">
                <div className="rb-input-row">
                  <input
                    ref={inputRef}
                    className="input rb-answer-input"
                    type="text"
                    placeholder="Tu respuesta..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    maxLength={50}
                  />
                  <button
                    className="btn btn-primary rb-submit-btn"
                    onClick={handleSubmitClick}
                    disabled={!answer.trim()}
                  >
                    Enviar
                  </button>
                </div>
              </div>
            ) : (
              <div className="rb-waiting animate-fade-in">
                <span className="rb-waiting-dots"><span>●</span><span>●</span><span>●</span></span>
                <span>Esperando a {opponentName}...</span>
              </div>
            )}
          </>
        )}

        {/* ── REVEAL ── */}
        {phase === PHASE.REVEAL && roundResult && (
          <div className="rb-reveal animate-fade-in-up">
            <RiddleCard riddle={currentRiddle} showAnswer={true} showHint={false} />

            <div className="rb-reveal-results">
              {/* My result */}
              <div className={`rb-reveal-player ${roundResult.p1Correct ? 'correct' : 'wrong'}`}>
                <span className="rb-reveal-icon">{roundResult.p1Correct ? '✅' : '❌'}</span>
                <span className="rb-reveal-name">Tú</span>
                <span className="rb-reveal-answer">
                  {roundResult.myAnswer || '(sin respuesta)'}
                </span>
                {roundResult.p1Correct && (
                  <span className="rb-reveal-time">{(roundResult.myTime / 1000).toFixed(1)}s</span>
                )}
              </div>

              {/* AI result */}
              <div className={`rb-reveal-player ${roundResult.p2Correct ? 'correct' : 'wrong'}`}>
                <span className="rb-reveal-icon">{roundResult.p2Correct ? '✅' : '❌'}</span>
                <span className="rb-reveal-name">{opponentName}</span>
                <span className="rb-reveal-answer">
                  {roundResult.aiAnswer || '(sin respuesta)'}
                </span>
                {roundResult.p2Correct && (
                  <span className="rb-reveal-time">{(roundResult.aiTime / 1000).toFixed(1)}s</span>
                )}
              </div>
            </div>

            {/* Round winner */}
            <div className="rb-reveal-winner animate-pop-in">
              {roundResult.winner === 'player1'
                ? '🎉 ¡Ganaste la ronda!'
                : roundResult.winner === 'player2'
                ? `${opponentName} gana la ronda`
                : '🤷 Nadie acertó — ¡Ronda anulada!'
              }
            </div>
          </div>
        )}

        {/* ── GAME OVER ── */}
        {phase === PHASE.GAME_OVER && (
          <div className="rb-result-overlay animate-fade-in">
            <div className="rb-result-card animate-pop-in">
              <span className="rb-result-emoji">
                {iWon ? '🏆' : matchWinner ? '😊' : '🤝'}
              </span>
              <h2 className="rb-result-title">{getResultMessage()}</h2>
              <div className="rb-result-score">
                <span className="rb-score-final">{p1Wins}</span>
                <span className="rb-score-dash">—</span>
                <span className="rb-score-final">{p2Wins}</span>
              </div>
              <p className="rb-result-points">{getResultPoints()}</p>
              <div className="rb-result-actions">
                <button className="btn btn-primary btn-full" onClick={handlePlayAgain}>
                  Jugar de nuevo 🔄
                </button>
                <button className="btn btn-ghost btn-full" onClick={() => navigate('/lobby')}>
                  Volver al lobby
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
