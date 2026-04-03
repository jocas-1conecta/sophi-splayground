/* ══════════════════════════════════════════
   TUTTI FRUTTI — Pure Game Logic
   Validates answers against DB word bank
   ══════════════════════════════════════════ */

import { isWordValid } from '../services/tuttiFruttiService';

/**
 * Available letters (excluding Q, W, X, Y, Z, Ñ)
 */
export const AVAILABLE_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'V',
];

/**
 * Normalize a string for comparison
 */
export function normalizeAnswer(answer) {
  if (!answer) return '';
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Validate if an answer is valid for the given category and letter.
 * - 'valid'       → in the DB word bank, full points
 * - 'maybe_valid' → starts with letter but not in bank, half points
 * - 'invalid'     → doesn't start with the letter
 * - 'empty'       → no answer
 */
export function validateAnswer(answer, letter, categoryId) {
  if (!answer || answer.trim().length === 0) return 'empty';
  const normalized = normalizeAnswer(answer);
  if (!normalized.startsWith(letter.toLowerCase())) return 'invalid';

  // Check against DB word bank
  if (isWordValid(answer, categoryId, letter)) {
    return 'valid';
  }

  return 'maybe_valid';
}

/**
 * Score a single category
 */
export function scoreCategory(myAnswer, opponentAnswer, letter, categoryId) {
  const myValid = validateAnswer(myAnswer, letter, categoryId);
  const oppValid = validateAnswer(opponentAnswer, letter, categoryId);

  if (myValid === 'empty' || myValid === 'invalid') {
    return { myPoints: 0, myStatus: myValid };
  }

  // valid = full points, maybe_valid = half points
  const myMultiplier = myValid === 'valid' ? 1 : 0.5;

  if (oppValid === 'empty' || oppValid === 'invalid') {
    return {
      myPoints: Math.round(10 * myMultiplier),
      myStatus: myValid === 'valid' ? 'unique' : 'maybe_valid',
    };
  }

  // Both have some valid answer → compare
  const myNorm = normalizeAnswer(myAnswer);
  const oppNorm = normalizeAnswer(opponentAnswer);

  if (myNorm === oppNorm) {
    return {
      myPoints: Math.round(5 * myMultiplier),
      myStatus: 'shared',
    };
  }

  return {
    myPoints: Math.round(10 * myMultiplier),
    myStatus: myValid === 'valid' ? 'unique' : 'maybe_valid',
  };
}

/**
 * Score an entire round for both players
 */
export function scoreRound(p1Answers, p2Answers, letter, categories) {
  let p1Total = 0;
  let p2Total = 0;
  const details = [];

  for (const cat of categories) {
    const p1Ans = p1Answers[cat.id] || '';
    const p2Ans = p2Answers[cat.id] || '';

    const p1Result = scoreCategory(p1Ans, p2Ans, letter, cat.id);
    const p2Result = scoreCategory(p2Ans, p1Ans, letter, cat.id);

    p1Total += p1Result.myPoints;
    p2Total += p2Result.myPoints;

    details.push({
      categoryId: cat.id,
      p1Answer: p1Ans,
      p2Answer: p2Ans,
      p1Points: p1Result.myPoints,
      p2Points: p2Result.myPoints,
      p1Status: p1Result.myStatus,
      p2Status: p2Result.myStatus,
    });
  }

  return { p1Total, p2Total, details };
}

/**
 * Pick a random letter, excluding already used ones
 */
export function pickLetter(usedLetters = []) {
  const available = AVAILABLE_LETTERS.filter((l) => !usedLetters.includes(l));
  if (available.length === 0) return AVAILABLE_LETTERS[0];
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Determine overall match winner after all rounds
 */
export function determineMatchWinner(p1Total, p2Total) {
  if (p1Total > p2Total) return 'player1';
  if (p2Total > p1Total) return 'player2';
  return 'draw';
}

/* ── Fallback AI Answers (when DB is empty) ── */

const FALLBACK_AI = {
  nombre: {
    A: 'Ana', B: 'Beatriz', C: 'Carmen', D: 'Diana', E: 'Elena', F: 'Fernanda',
    G: 'Gabriela', H: 'Helena', I: 'Isabel', J: 'Julia', K: 'Karla', L: 'Laura',
    M: 'María', N: 'Natalia', O: 'Olivia', P: 'Paula', R: 'Rosa', S: 'Sofía',
    T: 'Teresa', U: 'Úrsula', V: 'Valentina',
  },
  animal: {
    A: 'Águila', B: 'Búfalo', C: 'Cocodrilo', D: 'Delfín', E: 'Elefante', F: 'Foca',
    G: 'Gato', H: 'Halcón', I: 'Iguana', J: 'Jaguar', K: 'Koala', L: 'León',
    M: 'Mono', N: 'Narval', O: 'Oso', P: 'Puma', R: 'Ratón', S: 'Serpiente',
    T: 'Tigre', U: 'Urraca', V: 'Víbora',
  },
  color: {
    A: 'Azul', B: 'Blanco', C: 'Celeste', D: 'Dorado', E: 'Esmeralda', F: 'Fucsia',
    G: 'Gris', H: '', I: 'Índigo', J: 'Jade', K: 'Kaki', L: 'Lila',
    M: 'Morado', N: 'Negro', O: 'Ocre', P: 'Plateado', R: 'Rojo', S: 'Salmón',
    T: 'Turquesa', U: '', V: 'Verde',
  },
  pais: {
    A: 'Argentina', B: 'Bolivia', C: 'Chile', D: 'Dinamarca', E: 'Ecuador', F: 'Francia',
    G: 'Guatemala', H: 'Honduras', I: 'Italia', J: 'Japón', K: 'Kenia', L: 'Líbano',
    M: 'México', N: 'Nicaragua', O: 'Omán', P: 'Perú', R: 'Rumania', S: 'Suecia',
    T: 'Turquía', U: 'Uruguay', V: 'Venezuela',
  },
  fruta: {
    A: 'Arándano', B: 'Banana', C: 'Cereza', D: 'Durazno', E: '', F: 'Frambuesa',
    G: 'Guayaba', H: 'Higo', I: '', J: '', K: 'Kiwi', L: 'Lima',
    M: 'Mango', N: 'Naranja', O: '', P: 'Piña', R: '', S: 'Sandía',
    T: 'Toronja', U: 'Uva', V: '',
  },
  objeto: {
    A: 'Anillo', B: 'Botella', C: 'Cuchara', D: 'Dado', E: 'Espejo', F: 'Florero',
    G: 'Gorra', H: 'Hamaca', I: 'Imán', J: 'Jarra', K: '', L: 'Lápiz',
    M: 'Maleta', N: '', O: 'Ollas', P: 'Paraguas', R: 'Reloj', S: 'Silla',
    T: 'Tijeras', U: '', V: 'Vaso',
  },
};

/**
 * Generate AI answers for a given letter (singleplayer mode)
 */
export function generateAiAnswers(letter, categories) {
  const answers = {};
  for (const cat of categories) {
    const bank = FALLBACK_AI[cat.id];
    const answer = bank?.[letter] || '';

    if (answer && Math.random() > 0.2) {
      answers[cat.id] = answer;
    } else {
      answers[cat.id] = '';
    }
  }
  return answers;
}
