/* ══════════════════════════════════════════
   RIDDLE BANK — Demo Mode Data
   30+ adivinanzas organizadas por categoría
   ══════════════════════════════════════════ */

export const RIDDLE_CATEGORIES = [
  { id: 1, name: 'Animales', emoji: '🐾' },
  { id: 2, name: 'Naturaleza', emoji: '🌿' },
  { id: 3, name: 'Comida', emoji: '🍕' },
  { id: 4, name: 'Objetos', emoji: '📦' },
  { id: 5, name: 'Ciencia', emoji: '🔬' },
];

export const RIDDLE_BANK = [
  // ── Animales ──
  {
    id: 'r-01', category_id: 1, difficulty: 1,
    question: 'Tengo orejas largas, rabo cortito, corro y salto muy ligerito. ¿Qué soy?',
    answer: 'conejo',
    hint: 'Le gustan las zanahorias',
  },
  {
    id: 'r-02', category_id: 1, difficulty: 1,
    question: 'Vuelo sin alas, silbo sin boca, pego sin manos, ¿y tú ni me tocas?',
    answer: 'viento',
    hint: 'No es un animal, pero se mueve como uno',
  },
  {
    id: 'r-03', category_id: 1, difficulty: 2,
    question: 'Tiene ojos y no ve, tiene agua y no la bebe, tiene carne y no la come. ¿Qué es?',
    answer: 'coco',
    hint: 'Es una fruta tropical',
  },
  {
    id: 'r-04', category_id: 1, difficulty: 1,
    question: 'Soy chiquito, puedo nadar, vivo en el agua dulce o en el mar. ¿Qué soy?',
    answer: 'pez',
    hint: 'Tiene aletas',
  },
  {
    id: 'r-05', category_id: 1, difficulty: 2,
    question: 'Lenta dicen que es, porque solo asoma la cabeza, las patas y los pies. ¿Qué es?',
    answer: 'tortuga',
    hint: 'Tiene caparazón',
  },
  {
    id: 'r-06', category_id: 1, difficulty: 1,
    question: 'Tiene alas pero no vuela, tiene patas pero no camina. ¿Qué es?',
    answer: 'pinguino',
    hint: 'Vive en el frío',
  },

  // ── Naturaleza ──
  {
    id: 'r-07', category_id: 2, difficulty: 1,
    question: 'Soy blanca como la nieve, me formo en las nubes y caigo del cielo. ¿Qué soy?',
    answer: 'nieve',
    hint: 'Cae en invierno',
  },
  {
    id: 'r-08', category_id: 2, difficulty: 1,
    question: 'Sale todos los días, da luz y calor, y por la noche se esconde. ¿Qué es?',
    answer: 'sol',
    hint: 'Es una estrella',
  },
  {
    id: 'r-09', category_id: 2, difficulty: 2,
    question: 'No soy ave, pero vuelo; a veces brillo, a veces trueno. ¿Qué soy?',
    answer: 'rayo',
    hint: 'Aparece en las tormentas',
  },
  {
    id: 'r-10', category_id: 2, difficulty: 1,
    question: 'Después de la lluvia, con colores me visto. ¿Qué soy?',
    answer: 'arcoiris',
    hint: 'Tiene 7 colores',
  },
  {
    id: 'r-11', category_id: 2, difficulty: 2,
    question: 'Tiene raíces invisibles, es más alta que los árboles, sube y sube y nunca crece. ¿Qué es?',
    answer: 'montaña',
    hint: 'Es de piedra',
  },
  {
    id: 'r-12', category_id: 2, difficulty: 1,
    question: 'De noche llego sin que me llamen, de día me voy sin que me echen. ¿Qué soy?',
    answer: 'luna',
    hint: 'Brilla por la noche',
  },

  // ── Comida ──
  {
    id: 'r-13', category_id: 3, difficulty: 1,
    question: 'Oro parece, plata no es. ¿Qué es?',
    answer: 'platano',
    hint: 'Es amarillo',
  },
  {
    id: 'r-14', category_id: 3, difficulty: 1,
    question: 'Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera. ¿Qué es?',
    answer: 'pera',
    hint: 'Es una fruta',
  },
  {
    id: 'r-15', category_id: 3, difficulty: 2,
    question: 'Agua pasa por mi casa, cate de mi corazón. ¿Qué es?',
    answer: 'aguacate',
    hint: 'Es verde y cremoso',
  },
  {
    id: 'r-16', category_id: 3, difficulty: 1,
    question: 'Roja por fuera, blanca por dentro, con semillitas y dulce sabor. ¿Qué es?',
    answer: 'fresa',
    hint: 'Es una fruta pequeña',
  },
  {
    id: 'r-17', category_id: 3, difficulty: 2,
    question: 'Tengo dientes y no muerdo, me usan en la cocina a diario. ¿Qué soy?',
    answer: 'ajo',
    hint: 'Tiene un olor fuerte',
  },
  {
    id: 'r-18', category_id: 3, difficulty: 1,
    question: 'Una cajita redonda, blanca como el jazmín, que se abre y se cierra y no tiene chapa ni candado. ¿Qué es?',
    answer: 'huevo',
    hint: 'Sale de la gallina',
  },

  // ── Objetos ──
  {
    id: 'r-19', category_id: 4, difficulty: 1,
    question: 'Tengo hojas y no soy árbol, tengo lomo y no soy caballo. ¿Qué soy?',
    answer: 'libro',
    hint: 'Se lee',
  },
  {
    id: 'r-20', category_id: 4, difficulty: 1,
    question: 'Tengo agujas y no coso, tengo números y no soy calculadora. ¿Qué soy?',
    answer: 'reloj',
    hint: 'Da la hora',
  },
  {
    id: 'r-21', category_id: 4, difficulty: 2,
    question: 'Siempre me veo mojada, pero nunca me mojo. ¿Qué soy?',
    answer: 'lengua',
    hint: 'La tienes en la boca',
  },
  {
    id: 'r-22', category_id: 4, difficulty: 1,
    question: 'No tengo patas y corro, no tengo ojos y lloro. ¿Qué soy?',
    answer: 'nube',
    hint: 'Está en el cielo',
  },
  {
    id: 'r-23', category_id: 4, difficulty: 2,
    question: 'Tiene cuello y no tiene cabeza, tiene brazos y no tiene manos. ¿Qué es?',
    answer: 'camisa',
    hint: 'Es ropa',
  },
  {
    id: 'r-24', category_id: 4, difficulty: 1,
    question: 'Te la digo y te la repito, te la vuelvo a decir. ¿Qué es?',
    answer: 'tela',
    hint: 'Lee la primera frase otra vez',
  },

  // ── Ciencia ──
  {
    id: 'r-25', category_id: 5, difficulty: 1,
    question: '¿De qué color es un espejo?',
    answer: 'verde',
    hint: 'Piensa en el vidrio',
  },
  {
    id: 'r-26', category_id: 5, difficulty: 2,
    question: '¿Cuántos planetas tiene nuestro sistema solar?',
    answer: 'ocho',
    hint: 'Plutón ya no cuenta',
  },
  {
    id: 'r-27', category_id: 5, difficulty: 1,
    question: '¿Cuál es el planeta más grande del sistema solar?',
    answer: 'jupiter',
    hint: 'Es un gigante gaseoso',
  },
  {
    id: 'r-28', category_id: 5, difficulty: 2,
    question: '¿Qué gas respiramos para vivir?',
    answer: 'oxigeno',
    hint: 'Lo producen los árboles',
  },
  {
    id: 'r-29', category_id: 5, difficulty: 1,
    question: '¿Cuántos huesos tiene el cuerpo humano adulto?',
    answer: '206',
    hint: 'Es un número entre 200 y 210',
  },
  {
    id: 'r-30', category_id: 5, difficulty: 2,
    question: '¿Cuál es el animal más grande del mundo?',
    answer: 'ballena azul',
    hint: 'Vive en el mar',
  },
];

/**
 * Get N random riddles (like the RPC function but for demo mode)
 * @param {number} count
 * @param {string[]} excludeIds - IDs to exclude
 * @returns {Array}
 */
export function getRandomRiddles(count = 5, excludeIds = []) {
  const available = RIDDLE_BANK.filter((r) => !excludeIds.includes(r.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get category info by ID
 */
export function getCategoryById(categoryId) {
  return RIDDLE_CATEGORIES.find((c) => c.id === categoryId) || RIDDLE_CATEGORIES[0];
}
