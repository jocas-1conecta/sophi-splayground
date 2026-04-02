/* ══════════════════════════════════════════
   TUTTI FRUTTI — Pure Game Logic
   No side effects, easy to test
   ══════════════════════════════════════════ */

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
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/\s+/g, ' ');
}

/**
 * Validate if an answer starts with the given letter
 * @returns {'valid'|'invalid'|'empty'}
 */
export function validateAnswer(answer, letter) {
  if (!answer || answer.trim().length === 0) return 'empty';
  const normalized = normalizeAnswer(answer);
  if (!normalized.startsWith(letter.toLowerCase())) return 'invalid';
  return 'valid';
}

/**
 * Score a single category
 * @param {string} myAnswer
 * @param {string} opponentAnswer
 * @param {string} letter
 * @returns {{ myPoints: number, myStatus: string }}
 */
export function scoreCategory(myAnswer, opponentAnswer, letter) {
  const myValid = validateAnswer(myAnswer, letter);
  const oppValid = validateAnswer(opponentAnswer, letter);

  if (myValid !== 'valid') {
    return { myPoints: 0, myStatus: myValid }; // 'empty' or 'invalid'
  }

  if (oppValid !== 'valid') {
    return { myPoints: 10, myStatus: 'unique' }; // opponent empty/invalid → I'm unique
  }

  // Both valid → compare
  const myNorm = normalizeAnswer(myAnswer);
  const oppNorm = normalizeAnswer(opponentAnswer);

  if (myNorm === oppNorm) {
    return { myPoints: 5, myStatus: 'shared' }; // same answer
  }

  return { myPoints: 10, myStatus: 'unique' }; // different → unique
}

/**
 * Score an entire round for both players
 * @param {Object} p1Answers - { nombre: 'X', animal: 'X', ... }
 * @param {Object} p2Answers - { nombre: 'X', animal: 'X', ... }
 * @param {string} letter
 * @param {Array} categories - [{ id: 'nombre', ... }]
 * @returns {{ p1Total: number, p2Total: number, details: Array }}
 */
export function scoreRound(p1Answers, p2Answers, letter, categories) {
  let p1Total = 0;
  let p2Total = 0;
  const details = [];

  for (const cat of categories) {
    const p1Ans = p1Answers[cat.id] || '';
    const p2Ans = p2Answers[cat.id] || '';

    const p1Result = scoreCategory(p1Ans, p2Ans, letter);
    const p2Result = scoreCategory(p2Ans, p1Ans, letter);

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
 * @param {string[]} usedLetters
 * @returns {string}
 */
export function pickLetter(usedLetters = []) {
  const available = AVAILABLE_LETTERS.filter((l) => !usedLetters.includes(l));
  if (available.length === 0) return AVAILABLE_LETTERS[0]; // fallback
  return available[Math.floor(Math.random() * available.length)];
}

/**
 * Determine overall match winner after all rounds
 * @param {number} p1Total
 * @param {number} p2Total
 * @returns {'player1'|'player2'|'draw'}
 */
export function determineMatchWinner(p1Total, p2Total) {
  if (p1Total > p2Total) return 'player1';
  if (p2Total > p1Total) return 'player2';
  return 'draw';
}

/* ── Demo AI Answers ── */

const AI_ANSWER_BANK = {
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
 * Generate AI answers for a given letter (demo mode)
 * AI answers ~75% of categories (leaves some empty to simulate thinking)
 * @param {string} letter
 * @param {Array} categories
 * @returns {Object} { nombre: 'X', animal: 'X', ... }
 */
export function generateAiAnswers(letter, categories) {
  const answers = {};
  for (const cat of categories) {
    const bank = AI_ANSWER_BANK[cat.id];
    const answer = bank?.[letter] || '';

    // AI leaves ~20% blank to seem realistic
    if (answer && Math.random() > 0.2) {
      answers[cat.id] = answer;
    } else {
      answers[cat.id] = '';
    }
  }
  return answers;
}
