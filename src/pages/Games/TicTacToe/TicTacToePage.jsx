import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GAME_TYPES, GAME_INFO } from '../../../constants/gameConfig';
import { useAuthStore } from '../../../stores/authStore';
import { useGameStore } from '../../../stores/gameStore';
import { useProfileStore } from '../../../stores/profileStore';
import { useMatchHistoryStore } from '../../../stores/matchHistoryStore';
import { playSound } from '../../../lib/audioManager';
import {
  createEmptyBoard,
  makeMove,
  checkWin,
  checkDraw,
  isValidMove,
  getAiMove,
} from '../../../lib/ticTacToeLogic';
import { joinGameChannel, sendGameEvent, leaveGameChannel } from '../../../services/gameChannelService';
import GameLayout from '../GameLayout';
import Board from './Board';
import './TicTacToe.css';

const GAME_TYPE = GAME_TYPES.TIC_TAC_TOE;
const INFO = GAME_INFO[GAME_TYPE];

const PHASE = {
  PLAYING: 'playing',
  WIN: 'win',
  DRAW: 'draw',
};

export default function TicTacToePage() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { user } = useAuthStore();
  const { currentSession, setScores } = useGameStore();
  const { addLocalPoints, incrementGamesPlayed, incrementGamesWon } = useProfileStore();
  const { addMatch } = useMatchHistoryStore();
  const pointsAwarded = useRef(false);

  const [board, setBoard] = useState(createEmptyBoard());
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [phase, setPhase] = useState(PHASE.PLAYING);
  const [winData, setWinData] = useState(null);
  const [moveCount, setMoveCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const aiThinking = useRef(false);

  // Determine role from session
  const isMultiplayer = !!currentSession?.player2_id;
  const isPlayer1 = currentSession?.player1_id === user?.id;
  const myPiece = isPlayer1 ? 'X' : 'O';
  const opponentPiece = isPlayer1 ? 'O' : 'X';
  const opponentName = isMultiplayer ? 'Oponente' : 'Luna ⭐';

  // Player1 (X) always starts
  useEffect(() => {
    setIsMyTurn(isPlayer1);
  }, [isPlayer1]);

  // ── Multiplayer: join channel ──
  useEffect(() => {
    if (!isMultiplayer || !sessionId || !user?.id) return;

    const cleanup = joinGameChannel(sessionId, user.id, (type, data) => {
      if (type === 'move') {
        // Opponent made a move
        setBoard((prevBoard) => {
          const newBoard = makeMove(prevBoard, data.cellIndex, data.piece);

          // Check result after opponent's move
          const { winner, combo } = checkWin(newBoard);
          if (winner) {
            setWinData({ winner, combo });
            setPhase(PHASE.WIN);
          } else if (checkDraw(newBoard)) {
            setPhase(PHASE.DRAW);
          } else {
            setIsMyTurn(true);
          }

          return newBoard;
        });
        setMoveCount((c) => c + 1);
        playSound('move');
      }
    });

    return cleanup;
  }, [isMultiplayer, sessionId, user?.id]);

  // Handle player move
  const handleCellClick = useCallback(
    (cellIndex) => {
      if (phase !== PHASE.PLAYING || !isMyTurn) return;
      if (!isValidMove(board, cellIndex)) return;

      const newBoard = makeMove(board, cellIndex, myPiece);
      setBoard(newBoard);
      setMoveCount((c) => c + 1);
      playSound('move');

      // Send move to opponent
      if (isMultiplayer) {
        sendGameEvent('move', { cellIndex, piece: myPiece }, user.id);
      }

      // Check result
      const { winner, combo } = checkWin(newBoard);
      if (winner) {
        setWinData({ winner, combo });
        setPhase(PHASE.WIN);
        return;
      }
      if (checkDraw(newBoard)) {
        setPhase(PHASE.DRAW);
        return;
      }

      setIsMyTurn(false);
    },
    [board, phase, isMyTurn, myPiece, isMultiplayer, user?.id]
  );

  // AI opponent move (only in singleplayer)
  useEffect(() => {
    if (isMultiplayer) return;
    if (phase !== PHASE.PLAYING || isMyTurn || aiThinking.current) return;

    aiThinking.current = true;
    const delay = 600 + Math.random() * 800;

    const timer = setTimeout(() => {
      const aiCell = getAiMove(board, opponentPiece);
      if (aiCell === undefined || aiCell === null) {
        aiThinking.current = false;
        return;
      }

      const newBoard = makeMove(board, aiCell, opponentPiece);
      setBoard(newBoard);
      setMoveCount((c) => c + 1);

      const { winner, combo } = checkWin(newBoard);
      if (winner) {
        setWinData({ winner, combo });
        setPhase(PHASE.WIN);
        aiThinking.current = false;
        return;
      }
      if (checkDraw(newBoard)) {
        setPhase(PHASE.DRAW);
        aiThinking.current = false;
        return;
      }

      setIsMyTurn(true);
      aiThinking.current = false;
    }, delay);

    return () => {
      clearTimeout(timer);
      aiThinking.current = false;
    };
  }, [board, phase, isMyTurn, opponentPiece, isMultiplayer]);

  // Show result screen after game ends
  useEffect(() => {
    if (phase === PHASE.PLAYING) return;
    const timer = setTimeout(() => setShowResult(true), 1200);
    return () => clearTimeout(timer);
  }, [phase]);

  // Update scores + award points + record match
  useEffect(() => {
    if (phase === PHASE.PLAYING || pointsAwarded.current) return;

    let result, pts;
    if (phase === PHASE.WIN && winData) {
      if (winData.winner === myPiece) {
        setScores({ player1: 1, player2: 0 });
        result = 'win';
        pts = INFO.pointsWin;
        incrementGamesWon();
        playSound('win');
      } else {
        setScores({ player1: 0, player2: 1 });
        result = 'lose';
        pts = INFO.pointsLose;
        playSound('lose');
      }
    } else if (phase === PHASE.DRAW) {
      setScores({ player1: 0, player2: 0 });
      result = 'draw';
      pts = INFO.pointsDraw;
      playSound('draw');
    }

    if (result) {
      addLocalPoints(pts);
      incrementGamesPlayed();
      addMatch({
        game_type: GAME_TYPE,
        opponent_name: opponentName,
        result,
        points_earned: pts,
        scores: phase === PHASE.WIN
          ? { player1: winData?.winner === myPiece ? 1 : 0, player2: winData?.winner === myPiece ? 0 : 1 }
          : { player1: 0, player2: 0 },
      });
      pointsAwarded.current = true;
    }
  }, [phase, winData, myPiece, setScores]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => leaveGameChannel();
  }, []);

  const getResultMessage = () => {
    if (phase === PHASE.WIN) {
      return winData?.winner === myPiece
        ? '¡Ganaste! 🎉'
        : `${opponentName} ganó 😊`;
    }
    return '¡Empate! 🤝';
  };

  const getResultPoints = () => {
    if (phase === PHASE.WIN) {
      return winData?.winner === myPiece
        ? `+${INFO.pointsWin} puntos`
        : `+${INFO.pointsLose} punto`;
    }
    return `+${INFO.pointsDraw} puntos`;
  };

  const handlePlayAgain = () => {
    setBoard(createEmptyBoard());
    setIsMyTurn(isPlayer1);
    setPhase(PHASE.PLAYING);
    setWinData(null);
    setMoveCount(0);
    setShowResult(false);
    pointsAwarded.current = false;
  };

  const handleGoLobby = () => {
    leaveGameChannel();
    navigate('/lobby');
  };

  return (
    <GameLayout gameType={GAME_TYPE}>
      <div className="ttt-container">
        {/* Turn indicator */}
        <div className="ttt-turn-indicator">
          {phase === PHASE.PLAYING ? (
            isMyTurn ? (
              <div className="ttt-turn ttt-turn-mine animate-fade-in">
                <span className="ttt-turn-emoji">✨</span>
                <span>¡Tu turno!</span>
                <span className="ttt-turn-piece">{myPiece === 'X' ? '❌' : '⭕'}</span>
              </div>
            ) : (
              <div className="ttt-turn ttt-turn-opponent animate-fade-in">
                <span className="ttt-turn-dots">
                  <span>●</span><span>●</span><span>●</span>
                </span>
                <span>{opponentName} está pensando...</span>
              </div>
            )
          ) : (
            <div className={`ttt-turn ttt-turn-result animate-pop-in ${
              phase === PHASE.WIN && winData?.winner === myPiece ? 'ttt-turn-win' : ''
            }`}>
              <span>{getResultMessage()}</span>
            </div>
          )}
        </div>

        {/* Board */}
        <div className={`ttt-board-wrapper ${phase === PHASE.DRAW ? 'ttt-shake' : ''}`}>
          <Board
            board={board}
            winningCombo={winData?.combo}
            isMyTurn={isMyTurn && phase === PHASE.PLAYING}
            onCellClick={handleCellClick}
          />
        </div>

        {/* Player labels */}
        <div className="ttt-players">
          <div className={`ttt-player ${isMyTurn && phase === PHASE.PLAYING ? 'active' : ''}`}>
            <span className="ttt-player-piece">{myPiece === 'X' ? '❌' : '⭕'}</span>
            <span className="ttt-player-name">Tú</span>
          </div>
          <span className="ttt-vs">VS</span>
          <div className={`ttt-player ${!isMyTurn && phase === PHASE.PLAYING ? 'active' : ''}`}>
            <span className="ttt-player-piece">{opponentPiece === 'X' ? '❌' : '⭕'}</span>
            <span className="ttt-player-name">{opponentName}</span>
          </div>
        </div>

        {/* Result overlay */}
        {showResult && (
          <div className="ttt-result-overlay animate-fade-in">
            <div className="ttt-result-card animate-pop-in">
              <span className="ttt-result-emoji">
                {phase === PHASE.WIN && winData?.winner === myPiece
                  ? '🎉'
                  : phase === PHASE.WIN
                  ? '😊'
                  : '🤝'}
              </span>
              <h2 className="ttt-result-title">{getResultMessage()}</h2>
              <p className="ttt-result-points">{getResultPoints()}</p>
              <div className="ttt-result-actions">
                {!isMultiplayer && (
                  <button className="btn btn-primary btn-full" onClick={handlePlayAgain}>
                    Jugar de nuevo 🔄
                  </button>
                )}
                <button className="btn btn-ghost btn-full" onClick={handleGoLobby}>
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
