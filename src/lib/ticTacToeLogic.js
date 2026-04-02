/* ══════════════════════════════════════════
   TIC TAC TOE — Pure Game Logic
   No side effects, easy to test
   ══════════════════════════════════════════ */

/**
 * All 8 possible winning combinations (indices 0-8)
 */
export const WINNING_COMBOS = [
  [0, 1, 2], // row top
  [3, 4, 5], // row mid
  [6, 7, 8], // row bottom
  [0, 3, 6], // col left
  [1, 4, 7], // col center
  [2, 5, 8], // col right
  [0, 4, 8], // diagonal \
  [2, 4, 6], // diagonal /
];

/**
 * Creates an empty board
 * @returns {Array<null>} 9-cell empty board
 */
export function createEmptyBoard() {
  return Array(9).fill(null);
}

/**
 * Checks if there's a winner
 * @param {Array} board - 9-cell board
 * @returns {{ winner: 'X'|'O'|null, combo: number[]|null }}
 */
export function checkWin(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return { winner: null, combo: null };
}

/**
 * Checks if the game is a draw (board full, no winner)
 * @param {Array} board
 * @returns {boolean}
 */
export function checkDraw(board) {
  const { winner } = checkWin(board);
  if (winner) return false;
  return board.every((cell) => cell !== null);
}

/**
 * Validates if a move is legal
 * @param {Array} board
 * @param {number} cellIndex - 0-8
 * @returns {boolean}
 */
export function isValidMove(board, cellIndex) {
  return cellIndex >= 0 && cellIndex <= 8 && board[cellIndex] === null;
}

/**
 * Makes a move and returns a NEW board (immutable)
 * @param {Array} board
 * @param {number} cellIndex
 * @param {'X'|'O'} player
 * @returns {Array} new board
 */
export function makeMove(board, cellIndex, player) {
  if (!isValidMove(board, cellIndex)) return board;
  const newBoard = [...board];
  newBoard[cellIndex] = player;
  return newBoard;
}

/**
 * Gets the full game result
 * @param {Array} board
 * @returns {'X_wins'|'O_wins'|'draw'|'in_progress'}
 */
export function getGameResult(board) {
  const { winner } = checkWin(board);
  if (winner === 'X') return 'X_wins';
  if (winner === 'O') return 'O_wins';
  if (checkDraw(board)) return 'draw';
  return 'in_progress';
}

/**
 * Gets whose turn it is based on the board state
 * @param {Array} board
 * @returns {'X'|'O'}
 */
export function getCurrentTurn(board) {
  const xCount = board.filter((c) => c === 'X').length;
  const oCount = board.filter((c) => c === 'O').length;
  return xCount <= oCount ? 'X' : 'O';
}

/* ── Demo AI (simple) ── */

/**
 * Basic AI for demo mode — picks the best available move
 * Priority: 1. Win, 2. Block opponent, 3. Center, 4. Corners, 5. Random
 * @param {Array} board
 * @param {'X'|'O'} aiPlayer
 * @returns {number} cell index
 */
export function getAiMove(board, aiPlayer) {
  const opponent = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Can AI win?
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const test = makeMove(board, i, aiPlayer);
      if (checkWin(test).winner === aiPlayer) return i;
    }
  }

  // 2. Must block opponent?
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const test = makeMove(board, i, opponent);
      if (checkWin(test).winner === opponent) return i;
    }
  }

  // 3. Take center
  if (board[4] === null) return 4;

  // 4. Take a corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Any available cell
  const available = board.map((cell, i) => (cell === null ? i : -1)).filter((i) => i !== -1);
  return available[Math.floor(Math.random() * available.length)];
}
