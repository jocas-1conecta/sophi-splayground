/* ══════════════════════════════════════════
   RIDDLE BATTLE — Pure Game Logic
   No side effects, easy to test
   ══════════════════════════════════════════ */

/**
 * Normalize a string for comparison (remove accents, punctuation, etc.)
 */
function normalize(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s]/g, '')     // remove punctuation
    .replace(/\s+/g, ' ');           // normalize spaces
}

/**
 * Check if a user's answer matches the correct answer
 * Uses normalized string comparison with partial matching
 * @param {string} userAnswer
 * @param {string} correctAnswer
 * @returns {boolean}
 */
export function checkRiddleAnswer(userAnswer, correctAnswer) {
  if (!userAnswer || userAnswer.trim() === '') return false;

  const userNorm = normalize(userAnswer);
  const correctNorm = normalize(correctAnswer);

  // Exact match
  if (userNorm === correctNorm) return true;

  // Partial match: answer contains the correct answer or vice versa
  if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm)) return true;

  return false;
}

/**
 * Determine the winner of a single round
 * @param {{ answer: string, timeMs: number }|null} p1
 * @param {{ answer: string, timeMs: number }|null} p2
 * @param {string} correctAnswer
 * @returns {{ winner: 'player1'|'player2'|null, p1Correct: boolean, p2Correct: boolean }}
 */
export function determineRoundWinner(p1, p2, correctAnswer) {
  const p1Correct = p1 ? checkRiddleAnswer(p1.answer, correctAnswer) : false;
  const p2Correct = p2 ? checkRiddleAnswer(p2.answer, correctAnswer) : false;

  // Both wrong → no winner
  if (!p1Correct && !p2Correct) {
    return { winner: null, p1Correct, p2Correct };
  }

  // Only one correct
  if (p1Correct && !p2Correct) {
    return { winner: 'player1', p1Correct, p2Correct };
  }
  if (!p1Correct && p2Correct) {
    return { winner: 'player2', p1Correct, p2Correct };
  }

  // Both correct → faster wins
  const p1Time = p1?.timeMs ?? Infinity;
  const p2Time = p2?.timeMs ?? Infinity;

  if (p1Time < p2Time) return { winner: 'player1', p1Correct, p2Correct };
  if (p2Time < p1Time) return { winner: 'player2', p1Correct, p2Correct };

  // Exact same time → null (round doesn't count)
  return { winner: null, p1Correct, p2Correct };
}

/**
 * Check if someone has won the BO5 (3 round wins)
 * @param {number} p1Wins
 * @param {number} p2Wins
 * @returns {'player1'|'player2'|null}
 */
export function checkBO5Winner(p1Wins, p2Wins) {
  if (p1Wins >= 3) return 'player1';
  if (p2Wins >= 3) return 'player2';
  return null;
}

/**
 * Check if the match is over (someone has 3 wins or all rounds played)
 * @param {number} p1Wins
 * @param {number} p2Wins
 * @param {number} roundsPlayed
 * @returns {boolean}
 */
export function isMatchOver(p1Wins, p2Wins, roundsPlayed) {
  return checkBO5Winner(p1Wins, p2Wins) !== null || roundsPlayed >= 5;
}

/**
 * Get the difficulty label and stars
 * @param {number} difficulty
 * @returns {{ label: string, stars: string }}
 */
export function getDifficultyInfo(difficulty) {
  switch (difficulty) {
    case 1: return { label: 'Fácil', stars: '⭐' };
    case 2: return { label: 'Medio', stars: '⭐⭐' };
    case 3: return { label: 'Difícil', stars: '⭐⭐⭐' };
    default: return { label: 'Fácil', stars: '⭐' };
  }
}
