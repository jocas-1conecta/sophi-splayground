import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAME_TYPES, GAME_INFO, TUTTI_FRUTTI_CATEGORIES } from '../../../constants/gameConfig';
import {
  pickLetter,
  scoreRound,
  determineMatchWinner,
  generateAiAnswers,
} from '../../../lib/tuttiFruttiLogic';
import { loadValidWords } from '../../../services/tuttiFruttiService';
import { useAuthStore } from '../../../stores/authStore';
import { useGameStore } from '../../../stores/gameStore';
import { useProfileStore } from '../../../stores/profileStore';
import { useMatchHistoryStore } from '../../../stores/matchHistoryStore';
import { playSound } from '../../../lib/audioManager';
import { joinGameChannel, sendGameEvent, leaveGameChannel } from '../../../services/gameChannelService';
import GameLayout from '../GameLayout';
import LetterSpinner from './LetterSpinner';
import AnswerGrid from './AnswerGrid';
import RevealPhase from './RevealPhase';
import './TuttiFrutti.css';

const GAME_TYPE = GAME_TYPES.TUTTI_FRUTTI;
const INFO = GAME_INFO[GAME_TYPE];
const TIMER_SECONDS = INFO.timerSeconds;
const TOTAL_ROUNDS = INFO.roundsPerGame;

const PHASE = {
  LETTER_SPIN: 'letter_spin',
  FILLING: 'filling',
  BASTA_COUNTDOWN: 'basta_countdown',
  WAITING: 'waiting',
  REVEAL: 'reveal',
  GAME_OVER: 'game_over',
};

const emptyAnswers = () => {
  const a = {};
  TUTTI_FRUTTI_CATEGORIES.forEach((c) => (a[c.id] = ''));
  return a;
};

export default function TuttiFruttiPage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const { currentSession, setScores } = useGameStore();
  const { addLocalPoints, incrementGamesPlayed, incrementGamesWon } = useProfileStore();
  const { addMatch } = useMatchHistoryStore();

  const isMultiplayer = !!currentSession?.player2_id;
  const isPlayer1 = isMultiplayer ? currentSession?.player1_id === user?.id : true;

  // Load valid words from DB on mount
  useEffect(() => {
    loadValidWords();
  }, []);

  // Match state
  const [currentRound, setCurrentRound] = useState(0);
  const [usedLetters, setUsedLetters] = useState([]);
  const [currentLetter, setCurrentLetter] = useState('');
  const [phase, setPhase] = useState(PHASE.LETTER_SPIN);

  // Round state
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [answers, setAnswers] = useState(emptyAnswers());
  const [bastaPressed, setBastaPressed] = useState(false);
  const [roundDetails, setRoundDetails] = useState(null);
  const [roundP1, setRoundP1] = useState(0);
  const [roundP2, setRoundP2] = useState(0);

  // Multiplayer state
  const [opponentAnswers, setOpponentAnswers] = useState(null);
  const [mySubmitted, setMySubmitted] = useState(false);

  // Match scores
  const [totalP1, setTotalP1] = useState(0);
  const [totalP2, setTotalP2] = useState(0);
  const [roundHistory, setRoundHistory] = useState([]);

  const timerRef = useRef(null);
  const opponentName = isMultiplayer ? 'Oponente' : 'Luna ⭐';

  // ── Multiplayer channel ──
  useEffect(() => {
    if (!isMultiplayer || !sessionId || !user?.id) return;

    const cleanup = joinGameChannel(sessionId, user.id, (type, data) => {
      if (type === 'letter') {
        setCurrentLetter(data.letter);
      } else if (type === 'basta') {
        setBastaPressed(true);
        clearInterval(timerRef.current);
        setPhase(PHASE.BASTA_COUNTDOWN);
        setTimer(10);
        playSound('basta');
      } else if (type === 'submit_answers') {
        setOpponentAnswers(data.answers);
      }
    });

    return cleanup;
  }, [isMultiplayer, sessionId, user?.id]);

  // ── Pick letter for current round ──
  useEffect(() => {
    if (phase === PHASE.LETTER_SPIN) {
      if (isMultiplayer && isPlayer1) {
        const letter = pickLetter(usedLetters);
        setCurrentLetter(letter);
        sendGameEvent('letter', { letter }, user.id);
      } else if (!isMultiplayer) {
        const letter = pickLetter(usedLetters);
        setCurrentLetter(letter);
      }
      // Player2 waits for the 'letter' event
    }
  }, [phase, usedLetters, isMultiplayer, isPlayer1]);

  // ── Timer countdown ──
  useEffect(() => {
    if (phase !== PHASE.FILLING && phase !== PHASE.BASTA_COUNTDOWN) return;

    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLetterRevealed = useCallback(() => {
    setPhase(PHASE.FILLING);
    setTimer(TIMER_SECONDS);
  }, []);

  // ── BASTA! button ──
  const handleBasta = useCallback(() => {
    if (bastaPressed) return;
    setBastaPressed(true);
    clearInterval(timerRef.current);
    playSound('basta');

    if (isMultiplayer) {
      sendGameEvent('basta', {}, user.id);
    }

    setPhase(PHASE.BASTA_COUNTDOWN);
    setTimer(10);
  }, [bastaPressed, isMultiplayer, user?.id]);

  // ── Evaluate round: check if both players submitted (multiplayer) ──
  useEffect(() => {
    if (!isMultiplayer || !mySubmitted || !opponentAnswers) return;

    const myAns = isPlayer1 ? answers : opponentAnswers;
    const theirAns = isPlayer1 ? opponentAnswers : answers;

    const result = scoreRound(myAns, theirAns, currentLetter, TUTTI_FRUTTI_CATEGORIES);

    setRoundDetails(result.details);
    setRoundP1(result.p1Total);
    setRoundP2(result.p2Total);

    setRoundHistory((prev) => [...prev, {
      round: currentRound + 1,
      letter: currentLetter,
      p1: result.p1Total,
      p2: result.p2Total,
    }]);

    setPhase(PHASE.REVEAL);
    playSound('reveal');
  }, [mySubmitted, opponentAnswers, isMultiplayer]);

  // ── Time's up → evaluate ──
  const handleTimeUp = useCallback(() => {
    clearInterval(timerRef.current);

    if (isMultiplayer) {
      // Submit my answers to opponent
      if (!mySubmitted) {
        setMySubmitted(true);
        sendGameEvent('submit_answers', { answers }, user.id);
      }
      setPhase(PHASE.WAITING);
    } else {
      // Singleplayer: AI answers
      setPhase(PHASE.WAITING);
      setTimeout(() => {
        const aiAnswers = generateAiAnswers(currentLetter, TUTTI_FRUTTI_CATEGORIES);
        const result = scoreRound(answers, aiAnswers, currentLetter, TUTTI_FRUTTI_CATEGORIES);

        setRoundDetails(result.details);
        setRoundP1(result.p1Total);
        setRoundP2(result.p2Total);

        setRoundHistory((prev) => [...prev, {
          round: currentRound + 1,
          letter: currentLetter,
          p1: result.p1Total,
          p2: result.p2Total,
        }]);

        setPhase(PHASE.REVEAL);
        playSound('reveal');
      }, 800);
    }
  }, [answers, currentLetter, currentRound, isMultiplayer, mySubmitted, user?.id]);

  const handleSubmit = useCallback(() => {
    clearInterval(timerRef.current);
    handleTimeUp();
  }, [handleTimeUp]);

  // ── Reveal complete → next round or game over ──
  const handleRevealComplete = useCallback(() => {
    const newTotalP1 = totalP1 + roundP1;
    const newTotalP2 = totalP2 + roundP2;
    setTotalP1(newTotalP1);
    setTotalP2(newTotalP2);

    if (currentRound + 1 >= TOTAL_ROUNDS) {
      setPhase(PHASE.GAME_OVER);
    } else {
      setCurrentRound((r) => r + 1);
      setUsedLetters((prev) => [...prev, currentLetter]);
      setAnswers(emptyAnswers());
      setBastaPressed(false);
      setRoundDetails(null);
      setMySubmitted(false);
      setOpponentAnswers(null);
      setPhase(PHASE.LETTER_SPIN);
    }
  }, [currentRound, currentLetter, totalP1, totalP2, roundP1, roundP2]);

  const pointsAwarded = useRef(false);

  useEffect(() => {
    if (phase !== PHASE.GAME_OVER || pointsAwarded.current) return;

    const fP1 = totalP1 + roundP1;
    const fP2 = totalP2 + roundP2;
    setScores({ player1: fP1, player2: fP2 });

    const winner = determineMatchWinner(fP1, fP2);
    let result, pts;
    if (winner === 'player1') {
      result = 'win';
      pts = INFO.pointsWin;
      incrementGamesWon();
      playSound('win');
    } else if (winner === 'draw') {
      result = 'draw';
      pts = INFO.pointsDraw;
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
      scores: { player1: fP1, player2: fP2 },
    });
    pointsAwarded.current = true;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => leaveGameChannel();
  }, []);

  const handlePlayAgain = () => {
    setCurrentRound(0);
    setUsedLetters([]);
    setCurrentLetter('');
    setPhase(PHASE.LETTER_SPIN);
    setTimer(TIMER_SECONDS);
    setAnswers(emptyAnswers());
    setBastaPressed(false);
    setRoundDetails(null);
    setTotalP1(0);
    setTotalP2(0);
    setRoundHistory([]);
    setMySubmitted(false);
    setOpponentAnswers(null);
    pointsAwarded.current = false;
  };

  const finalP1 = totalP1 + (phase === PHASE.GAME_OVER ? roundP1 : 0);
  const finalP2 = totalP2 + (phase === PHASE.GAME_OVER ? roundP2 : 0);
  const matchResult = determineMatchWinner(finalP1, finalP2);
  const iWon = matchResult === 'player1';

  return (
    <GameLayout gameType={GAME_TYPE}>
      <div className="tf-container">
        <div className="tf-round-info">
          <span className="tf-round-badge animate-fade-in">
            Ronda {Math.min(currentRound + 1, TOTAL_ROUNDS)} de {TOTAL_ROUNDS}
          </span>
          {(phase === PHASE.FILLING || phase === PHASE.BASTA_COUNTDOWN) && (
            <span className="tf-round-letter">Letra: <strong>{currentLetter}</strong></span>
          )}
        </div>

        <div className="tf-cumulative-score">
          <span className="tf-cs-name">Tú</span>
          <span className="tf-cs-score">{totalP1}</span>
          <span className="tf-cs-dash">—</span>
          <span className="tf-cs-score">{totalP2}</span>
          <span className="tf-cs-name">{opponentName}</span>
        </div>

        {phase === PHASE.LETTER_SPIN && (
          <LetterSpinner
            targetLetter={currentLetter}
            onComplete={handleLetterRevealed}
          />
        )}

        {(phase === PHASE.FILLING || phase === PHASE.BASTA_COUNTDOWN) && (
          <>
            <div className={`tf-timer ${timer <= 10 ? 'danger' : ''} ${phase === PHASE.BASTA_COUNTDOWN ? 'basta-mode' : ''}`}>
              <span className="tf-timer-num">{timer}</span>
              <span className="tf-timer-label">
                {phase === PHASE.BASTA_COUNTDOWN ? '¡BASTA! ⏰' : 'segundos'}
              </span>
            </div>

            <AnswerGrid
              letter={currentLetter}
              answers={answers}
              onChange={setAnswers}
              disabled={false}
            />

            <div className="tf-actions">
              {!bastaPressed && (
                <button className="btn tf-basta-btn" onClick={handleBasta}>
                  ¡BASTA! 🛑
                </button>
              )}
              <button className="btn btn-primary btn-full" onClick={handleSubmit}>
                Enviar respuestas ✅
              </button>
            </div>
          </>
        )}

        {phase === PHASE.WAITING && (
          <div className="tf-waiting animate-fade-in">
            <span className="tf-waiting-emoji">📝</span>
            <p>{isMultiplayer ? `Esperando a ${opponentName}...` : 'Comparando respuestas...'}</p>
          </div>
        )}

        {phase === PHASE.REVEAL && roundDetails && (
          <RevealPhase
            details={roundDetails}
            categories={TUTTI_FRUTTI_CATEGORIES}
            p1Total={roundP1}
            p2Total={roundP2}
            p1Name="Tú"
            p2Name={opponentName}
            onComplete={handleRevealComplete}
          />
        )}

        {phase === PHASE.GAME_OVER && (
          <div className="tf-result-overlay animate-fade-in">
            <div className="tf-result-card animate-pop-in">
              <span className="tf-result-emoji">
                {iWon ? '🏆' : matchResult === 'draw' ? '🤝' : '😊'}
              </span>
              <h2 className="tf-result-title">
                {iWon ? '¡Ganaste!' : matchResult === 'draw' ? '¡Empate!' : `${opponentName} ganó`}
              </h2>

              <div className="tf-result-rounds">
                {roundHistory.map((rh) => (
                  <div key={rh.round} className="tf-result-round-row">
                    <span className="tf-rr-label">R{rh.round} ({rh.letter})</span>
                    <span className={`tf-rr-score ${rh.p1 > rh.p2 ? 'winner' : ''}`}>{rh.p1}</span>
                    <span className="tf-rr-dash">—</span>
                    <span className={`tf-rr-score ${rh.p2 > rh.p1 ? 'winner' : ''}`}>{rh.p2}</span>
                  </div>
                ))}
                <div className="tf-result-round-row tf-result-total-row">
                  <span className="tf-rr-label">Total</span>
                  <span className={`tf-rr-score total ${finalP1 >= finalP2 ? 'winner' : ''}`}>{finalP1}</span>
                  <span className="tf-rr-dash">—</span>
                  <span className={`tf-rr-score total ${finalP2 >= finalP1 ? 'winner' : ''}`}>{finalP2}</span>
                </div>
              </div>

              <p className="tf-result-points">
                {iWon ? `+${INFO.pointsWin} puntos` : matchResult === 'draw' ? `+${INFO.pointsDraw} puntos` : `+${INFO.pointsLose} puntos`}
              </p>

              <div className="tf-result-actions">
                {!isMultiplayer && (
                  <button className="btn btn-primary btn-full" onClick={handlePlayAgain}>
                    Jugar de nuevo 🔄
                  </button>
                )}
                <button className="btn btn-ghost btn-full" onClick={() => { leaveGameChannel(); navigate('/lobby'); }}>
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
