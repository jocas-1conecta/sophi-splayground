# 📝 Módulo: Tutti Frutti (Basta / Stop)

## Responsabilidad

Implementar la lógica y UI del juego Tutti Frutti para dos jugadoras en tiempo real, con validación automática y reveal visual de respuestas.

## Reglas del Juego

1. Se juegan **3 rondas** (BO3 — Best of 3)
2. Al inicio de cada ronda, se selecciona una **letra aleatoria**
3. Las jugadoras deben llenar **6 categorías** con palabras que empiecen con esa letra
4. Tienen **90 segundos** para responder
5. Cualquiera puede gritar **¡BASTA!** para terminar la ronda antes
6. Las respuestas se validan **automáticamente**
7. Al final de las 3 rondas, gana quien acumuló más puntos

## Categorías (Fijas)

| ID | Categoría | Emoji |
|----|-----------|-------|
| nombre | Nombre | 👤 |
| animal | Animal | 🐾 |
| color | Color | 🎨 |
| pais | País | 🌎 |
| fruta | Fruta | 🍓 |
| objeto | Objeto | 📦 |

## Sistema de Puntaje por Ronda

| Situación | Puntos |
|-----------|--------|
| Respuesta **única** (la oponente no la tiene) | **10 pts** |
| Respuesta **compartida** (ambas escribieron lo mismo) | **5 pts** |
| Respuesta **vacía o inválida** | **0 pts** |

**Validación automática:**
- Se normaliza cada respuesta (lowercase, trim, remover acentos)
- Se verifica que la respuesta **empiece con la letra de la ronda**
- Se compara con la respuesta de la oponente para determinar si es única o compartida

```javascript
// Ejemplo de validación
function validateAnswer(answer, letter) {
  if (!answer || answer.trim().length === 0) return 'empty';
  const normalized = answer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!normalized.startsWith(letter.toLowerCase())) return 'invalid';
  return 'valid';
}

function scoreCategory(myAnswer, opponentAnswer, letter) {
  const myValid = validateAnswer(myAnswer, letter);
  const oppValid = validateAnswer(opponentAnswer, letter);

  if (myValid !== 'valid') return 0;
  if (oppValid !== 'valid') return 10; // oponente inválida/vacía → soy única
  
  // Ambas válidas → comparar
  const myNorm = normalize(myAnswer);
  const oppNorm = normalize(opponentAnswer);
  return myNorm === oppNorm ? 5 : 10; // iguales=5, diferentes=10
}
```

## Selección de Letra

**Letras excluidas:** Q, W, X, Y, Z, Ñ (difíciles de usar para todas las categorías)

**Letras disponibles:** A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, R, S, T, U, V

**Mecanismo:**
- Player 1 genera una letra aleatoria y la envía via broadcast
- Se muestra una animación de "ruleta de letras" (LetterSpinner) antes de revelar la letra seleccionada
- La misma letra no se repite en la misma partida

## Flujo de una Ronda

```
1. SELECCIÓN DE LETRA
   Player 1 genera letra → broadcast { type: 'round_start', letter: 'M', round: 1 }
   → LetterSpinner animation (2 segundos)
   → Letra revelada: "¡La letra es M! 🎯"

2. LLENADO
   Timer de 90 segundos visible para ambas
   Cada jugadora llena su grid de 6 categorías
   ├── Si una jugadora termina antes: puede presionar ¡BASTA!
   │   → broadcast { type: 'basta', player_id }
   │   → Timer se reduce a 10 segundos para la otra
   └── Si el timer llega a 0: auto-submit

3. SUBMIT
   Al terminar (basta o timer):
   → broadcast { type: 'answers_submitted', answers: { nombre: 'María', ... } }
   → Esperar a que ambas envíen respuestas

4. REVEAL VISUAL (Feature principal de UX)
   Cuando ambas respuestas están disponibles:
   → Revelar respuestas una categoría a la vez
   → Para cada categoría:
      a. Mostrar la categoría (ej: "🐾 Animal")
      b. Mostrar respuesta de Player 1 (slide in left)
      c. Mostrar respuesta de Player 2 (slide in right)
      d. Validar y mostrar puntaje:
         ├── ✅ Única → +10 (glow verde)
         ├── 🤝 Compartida → +5 (glow amarillo)
         └── ❌ Inválida/vacía → +0 (glow rojo)
      e. Pausa de 1.5 segundos
      f. Siguiente categoría
   
   → Mostrar subtotal de la ronda
   → Si quedan rondas → "Siguiente ronda en 3... 2... 1..."

5. FIN DE PARTIDA
   Después de 3 rondas:
   → Sumar puntajes de todas las rondas
   → Quien tenga más puntos totales gana
   → Si empate → la ronda con más puntos individuales desempata
   → Pantalla de resultados con confetti
```

## Sincronización Realtime

| Evento | Quién envía | Payload |
|--------|------------|---------|
| `round_start` | Player 1 | `{ round: 1, letter: 'M' }` |
| `basta` | Cualquiera | `{ player_id }` |
| `answers_submitted` | Ambas | `{ answers: { nombre: 'X', animal: 'X', ... } }` |
| `round_result` | Player 1 | `{ scores: { p1: 35, p2: 25 }, round: 1 }` |
| `game_over` | Player 1 | `{ winner_id, total: { p1: 90, p2: 75 } }` |

## Puntaje de Partida

| Resultado | Ganadora | Perdedora |
|-----------|----------|-----------|
| Victoria | +25 pts | +5 pts |
| Empate | +10 pts | +10 pts |

## UI Components

| Componente | Propósito |
|-----------|-----------|
| `TuttiFruttiPage.jsx` | Orquestador de rondas y fases |
| `LetterSpinner.jsx` | Animación de ruleta para seleccionar letra |
| `AnswerGrid.jsx` | Grid de 6 categorías con inputs |
| `RevealPhase.jsx` | Reveal visual uno a uno con animaciones |
| `TuttiFrutti.css` | Estilos |

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `lib/tuttiFruttiLogic.js` | validateAnswer, scoreCategory, scoreRound, pickLetter, generateAiAnswers | ✅ |
| `constants/gameConfig.js` | TUTTI_FRUTTI_CATEGORIES, timer, scoring rules | ✅ |
| `pages/Games/TuttiFrutti/TuttiFruttiPage.jsx` | Orquestador BO3: letter spin, filling, basta, reveal, game over | ✅ |
| `pages/Games/TuttiFrutti/LetterSpinner.jsx` | Animación de ruleta de letras (~1.6s spin) | ✅ |
| `pages/Games/TuttiFrutti/AnswerGrid.jsx` | 6 categorías con inputs y letter hint | ✅ |
| `pages/Games/TuttiFrutti/RevealPhase.jsx` | Reveal uno por uno con colores: unique/shared/invalid | ✅ |
| `pages/Games/TuttiFrutti/TuttiFrutti.css` | Spinner, grid, basta button, reveal cards, result overlay | ✅ |

## Modo Demo (AI Opponent)

- **AI answer bank:** Respuestas pre-definidas para las 21 letras × 6 categorías
- **AI fill rate:** ~80% (deja ~20% vacío para parecer realista)
- **Nombre:** "Luna ⭐" (hardcoded en demo)
- **Scoring:** Automático al enviar, con reveal categoría por categoría

## Edge Cases

- **Misma respuesta con diferente mayúscula/acento:** Se normalizan para comparar (María = maria)
- **Respuesta no empieza con la letra:** 0 puntos
- **Ambas vacías en una categoría:** 0-0 (ninguna gana nada)
- **Desconexión durante llenado:** Respuestas vacías se envían automáticamente
- **¡BASTA! spam:** Solo se puede presionar una vez por ronda

## Futuras Mejoras

- [ ] Categorías personalizables (las jugadoras eligen)
- [ ] Más rondas (BO5 como opción)
- [ ] Diccionario de validación (verificar que la palabra existe)
- [ ] "Golden Letter" — Letra difícil que da el doble de puntos
- [ ] Historial de mejores respuestas
