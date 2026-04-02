# 🧩 Módulo: Batalla de Adivinanzas (Riddle Battle)

## Responsabilidad

Implementar un juego competitivo de adivinanzas para dos jugadoras en formato Best of 5 (BO5), con adivinanzas dinámicas consumidas desde la base de datos.

## Reglas del Juego

1. Se juegan **5 rondas** máximo (BO5)
2. La primera en ganar **3 rondas** gana la partida
3. Cada ronda presenta **la misma adivinanza** a ambas jugadoras
4. Las jugadoras tienen **30 segundos** para responder
5. Si una responde correctamente primero, gana la ronda
6. Si ambas responden correctamente, gana la **más rápida**
7. Si ninguna acierta, la ronda es **empate** (no cuenta)
8. Las adivinanzas se obtienen dinámicamente de la base de datos (no hardcodeadas)

## Modelo de Datos

### Tabla: `riddle_categories`

```sql
riddle_categories
├── id          SERIAL PK
├── name        TEXT UNIQUE (e.g. 'Animales', 'Naturaleza')
├── emoji       TEXT (e.g. '🐾', '🌿')
└── sort_order  INTEGER
```

### Tabla: `riddles`

```sql
riddles
├── id              UUID PK
├── category_id     INTEGER FK → riddle_categories.id
├── question        TEXT (la adivinanza)
├── answer          TEXT (la respuesta correcta)
├── hint            TEXT (pista opcional, nullable)
├── difficulty      INTEGER (1=fácil, 2=medio, 3=difícil)
├── is_active       BOOLEAN (default: true)
└── created_at      TIMESTAMPTZ
```

### Función RPC: `get_random_riddles`

```sql
get_random_riddles(
  p_count INTEGER DEFAULT 5,
  p_category_id INTEGER DEFAULT NULL, -- null = cualquier categoría
  p_difficulty INTEGER DEFAULT NULL,  -- null = cualquier dificultad
  p_exclude_ids UUID[] DEFAULT '{}'   -- excluir ya usadas
)
RETURNS SETOF riddles
```

**Propósito:** Obtener N adivinanzas aleatorias, opcionalmente filtradas por categoría y dificultad, excluyendo las ya usadas en la sesión actual.

## Flujo de una Partida BO5

```
1. SETUP
   Player 1 llama a get_random_riddles(5) → obtiene 5 adivinanzas
   → broadcast { type: 'riddles_loaded', riddle_ids: [...] }
   → Ambas jugadoras tienen las mismas 5 adivinanzas
   Score: P1 = 0, P2 = 0

2. RONDA N (repetir hasta alguien tenga 3 wins)
   
   a. MOSTRAR ADIVINANZA
      → Reveal de categoría + dificultad
      → "🐾 Animales • ⭐ Fácil"
      → Mostrar la pregunta con animación
      → Timer de 30 segundos inicia
   
   b. RESPONDER
      → Cada jugadora escribe su respuesta y presiona "Enviar"
      → broadcast { type: 'answer', riddle_id, answer, time_ms }
      → UI muestra "Esperando a tu oponente..." si la otra no ha respondido
      
      Si timer llega a 0 sin responder:
      → Se envía respuesta vacía automáticamente
   
   c. EVALUATE
      Cuando ambas respuestas están:
      → Comparar con la respuesta correcta (normalizada)
      → Determinar ganadora de la ronda:
         ├── Solo una acertó → ella gana la ronda
         ├── Ambas acertaron → gana la más rápida (time_ms menor)
         ├── Ambas fallaron → ronda anulada (no cuenta)
         └── Empate exacto en tiempo → ambas ganan 0.5
      
   d. REVEAL
      → Mostrar la respuesta correcta
      → Mostrar quién acertó/falló con animación
      → Actualizar ScoreTracker (○○○ vs ○○○ → ●○○ vs ○○○)
      → Pausa de 3 segundos
   
   e. CHECK FIN
      ├── Alguien tiene 3 wins? → GAME OVER
      └── No → siguiente ronda

3. GAME OVER
   → Pantalla de victoria/derrota
   → Guardar resultado en game_sessions
   → Asignar puntos
```

## Validación de Respuestas

```javascript
function checkRiddleAnswer(userAnswer, correctAnswer) {
  if (!userAnswer || userAnswer.trim() === '') return false;
  
  const normalize = (s) => s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remover acentos
    .replace(/[^a-z0-9\s]/g, '')     // remover puntuación
    .replace(/\s+/g, ' ');           // normalizar espacios
  
  const userNorm = normalize(userAnswer);
  const correctNorm = normalize(correctAnswer);
  
  // Coincidencia exacta
  if (userNorm === correctNorm) return true;
  
  // Coincidencia parcial: si la respuesta contiene la respuesta correcta
  if (userNorm.includes(correctNorm) || correctNorm.includes(userNorm)) return true;
  
  return false;
}
```

## Score Tracker Visual (BO5)

```
Ronda:     1   2   3   4   5
Player 1:  ●   ○   ●   ●       ← GANA (3 victorias)
Player 2:  ○   ●   ○   ○

● = ronda ganada
○ = ronda perdida
─ = ronda aún no jugada
```

## Sincronización Realtime

| Evento | Quién envía | Payload |
|--------|------------|---------|
| `riddles_loaded` | Player 1 | `{ riddle_ids: [uuid, ...] }` |
| `round_start` | Player 1 | `{ round: 1, riddle_id: uuid }` |
| `answer` | Ambas | `{ riddle_id, answer: 'text', time_ms: 4500 }` |
| `round_result` | Player 1 | `{ winner: player_id\|null, correct: 'answer' }` |
| `game_over` | Player 1 | `{ winner_id, score: { p1: 3, p2: 1 } }` |

## Puntaje de Partida

| Resultado | Ganadora | Perdedora |
|-----------|----------|-----------|
| Victoria | +20 pts | +3 pts |
| Empate | +8 pts | +8 pts |

## Datos de Ejemplo (Seed)

```sql
-- Categorías
INSERT INTO riddle_categories (name, emoji, sort_order) VALUES
('Animales', '🐾', 1),
('Naturaleza', '🌿', 2),
('Comida', '🍕', 3),
('Objetos', '📦', 4),
('Ciencia', '🔬', 5);

-- Adivinanzas ejemplo
INSERT INTO riddles (category_id, question, answer, difficulty) VALUES
(1, 'Tengo patas y no camino, tengo plumas y no vuelo, tengo cara y no soy persona. ¿Qué soy?', 'reloj', 1),
(1, 'Tiene ojos y no ve, tiene agua y no la bebe, tiene carne y no la come. ¿Qué es?', 'coco', 2),
(2, 'Soy blanca como la nieve, me formo en las nubes y caigo del cielo. ¿Qué soy?', 'nieve', 1),
(3, 'Oro parece, plata no es. ¿Qué es?', 'platano', 1);
-- (Se necesitan 30-50 adivinanzas para buena variedad)
```

## UI Components

| Componente | Propósito |
|-----------|-----------|
| `RiddleBattlePage.jsx` | Orquestador BO5 |
| `RiddleCard.jsx` | Muestra la adivinanza con categoría y dificultad |
| `AnswerInput.jsx` | Input con timer circular |
| `ScoreTracker.jsx` | Marcador visual BO5 (●○○ vs ○○○) |
| `RiddleBattle.css` | Estilos |

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `lib/riddleBattleLogic.js` | checkRiddleAnswer, determineRoundWinner, checkBO5Winner, isMatchOver | ✅ |
| `constants/riddleBank.js` | 30 adivinanzas en 5 categorías, getRandomRiddles() | ✅ |
| `pages/Games/RiddleBattle/RiddleBattlePage.jsx` | Orquestador BO5: countdown, timer, AI, reveal, game over | ✅ |
| `pages/Games/RiddleBattle/RiddleCard.jsx` | Riddle con badges categoría + dificultad, hint, answer reveal | ✅ |
| `pages/Games/RiddleBattle/ScoreTracker.jsx` | Marcador visual BO5 (●○○ vs ○○○) | ✅ |
| `pages/Games/RiddleBattle/RiddleBattle.css` | SVG timer ring, reveal cards, result overlay | ✅ |

## Modo Demo (AI Opponent)

- **AI accuracy:** ~55% de probabilidad de responder correctamente
- **AI speed:** 3-25s aleatorio
- **Pista:** Se muestra a los 15 segundos restantes
- **Nombre:** "Luna ⭐" (hardcoded en demo)

## Edge Cases

- **Ambas aciertan con el mismo tiempo (ms exacto):** Empate de ronda (no cuenta)
- **Solo queda 1 ronda y ambas tienen 2 wins:** Esa ronda es "la final"
- **No hay suficientes adivinanzas en la DB:** Mostrar error antes de empezar
- **Desconexión durante ronda:** Timer corre, respuesta vacía = pierde la ronda

## Futuras Mejoras

- [ ] Selección de categoría antes de empezar (ambas eligen)
- [ ] Selección de dificultad (fácil, medio, difícil, mixto)
- [ ] "Hint system" — Pedir pista por 5 puntos
- [ ] Contribuir adivinanzas propias (moderación previa)
- [ ] Leaderboard de "mejor adivinadora"
- [ ] Modo "Blitz" — 10 adivinanzas, 10 segundos cada una
