# ❌⭕ Módulo: 3 en Raya (Tic Tac Toe)

## Responsabilidad

Implementar la lógica y UI del juego clásico de 3 en Raya para dos jugadoras en tiempo real.

## Reglas del Juego

1. Tablero de 3×3 (9 celdas, indexadas 0-8)
2. Player 1 = ❌ (X), Player 2 = ⭕ (O)
3. Player 1 siempre empieza
4. Se alternan turnos
5. Gana la primera en colocar 3 en línea (horizontal, vertical o diagonal)
6. Si se llenan las 9 celdas sin ganadora → empate

## Representación del Tablero

```
Índices:          Estado ejemplo:
 0 | 1 | 2        X | O | X
───┼───┼───       ───┼───┼───
 3 | 4 | 5          | X | O
───┼───┼───       ───┼───┼───
 6 | 7 | 8        O |   | X
```

```javascript
// Array de 9 posiciones: null = vacío, 'X', 'O'
const board = ['X', 'O', 'X', null, 'X', 'O', 'O', null, 'X'];
```

## Combinaciones Ganadoras

```javascript
const WINNING_COMBOS = [
  [0, 1, 2], // fila superior
  [3, 4, 5], // fila media
  [6, 7, 8], // fila inferior
  [0, 3, 6], // columna izquierda
  [1, 4, 7], // columna central
  [2, 5, 8], // columna derecha
  [0, 4, 8], // diagonal \
  [2, 4, 6], // diagonal /
];
```

## Lógica Pura (`lib/ticTacToeLogic.js`)

```javascript
// Funciones sin side effects, fáciles de testear

checkWin(board)
  → { winner: 'X'|'O'|null, combo: [0,4,8]|null }

checkDraw(board)
  → boolean (true si todas las celdas llenas y nadie ganó)

isValidMove(board, cellIndex)
  → boolean (celda existe y está vacía)

makeMove(board, cellIndex, player)
  → newBoard (copia del board con el movimiento aplicado)

getGameResult(board)
  → 'X_wins' | 'O_wins' | 'draw' | 'in_progress'
```

## Flujo de una Partida

```
1. Setup
   Player 1 (X) = quien envió la invitación
   Player 2 (O) = quien aceptó
   Board = [null × 9]
   Current turn = 'X'

2. Turno
   → Es mi turno? (gameStore.isMyTurn)
   → Sí → Click en celda
     → isValidMove(board, cell)?
     → Sí → makeMove(board, cell, 'X')
     → broadcast({ type: 'move', cell, player: 'X' })
     → Actualizar board local
     → Cambiar turno

3. Recibir movimiento
   → Recibo broadcast { type: 'move', cell: 4, player: 'O' }
   → makeMove(board, 4, 'O')
   → Actualizar board local
   → Ahora es mi turno

4. Check resultado después de cada movimiento
   → checkWin(board)
   → Si hay ganadora → game over → animación de línea ganadora
   → Si no → checkDraw(board)
   → Si empate → game over → animación de empate
   → Si no → siguiente turno
```

## Sincronización Realtime

| Evento | Quién envía | Payload |
|--------|------------|---------|
| `move` | Jugadora activa | `{ cell: 0-8, player: 'X'\|'O' }` |
| `game_over` | Cualquiera que detecte el fin | `{ result: 'win'\|'draw', winner: 'X'\|'O'\|null, combo: [...] }` |

**Nota:** Ambas jugadoras ejecutan la misma lógica localmente. El broadcast sirve para sincronizar, no para validar. Si hay discrepancia (raro pero posible), se confía en el estado de Player 1.

## Puntaje

| Resultado | Ganadora | Perdedora |
|-----------|----------|-----------|
| Victoria | +10 pts | +1 pt |
| Empate | +3 pts | +3 pts |

## UI Components

| Componente | Propósito |
|-----------|-----------|
| `TicTacToePage.jsx` | Orquestador: setup, turnos, game over, puntos |
| `Board.jsx` | Grid 3×3 visual |
| `Cell.jsx` | Celda individual con animación al colocar X/O |

## Animaciones

- **Colocar pieza:** `popIn` (scale 0→1.1→1)
- **Línea ganadora:** highlight de las 3 celdas ganadoras con `pulse-glow`
- **Empate:** `shake` suave del tablero
- **Turno activo:** Indicador pulsante "Tu turno ✨" vs "Turno de {nombre}..."
- **Victoria:** Confetti burst 🎉

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `lib/ticTacToeLogic.js` | Lógica pura: checkWin, checkDraw, isValidMove, makeMove, getGameResult, getAiMove | ✅ |
| `pages/Games/TicTacToe/TicTacToePage.jsx` | Orquestador: turnos, AI delay, result overlay, play again | ✅ |
| `pages/Games/TicTacToe/Board.jsx` | Grid 3×3 con winning combo highlight | ✅ |
| `pages/Games/TicTacToe/Cell.jsx` | Celda con popIn, hover, active/disabled states | ✅ |
| `pages/Games/TicTacToe/TicTacToe.css` | Board responsive, pulse-cell, shake, result overlay, thinking dots | ✅ |

## Modo Demo (AI Opponent)

En demo mode, la jugadora juega contra una IA simple:
- **Delay de respuesta:** 600–1400ms aleatorio (“pensando”)
- **Prioridad de la IA:** 1. Ganar, 2. Bloquear, 3. Centro, 4. Esquina, 5. Random
- **Nombre:** "Luna ⭐" (hardcoded en demo)
- **Resultado:** Overlay con emoji flotante, puntos, y botones “Jugar de nuevo” / “Volver al lobby”

## Futuras Mejoras

- [ ] Tablero 4×4 como variante desbloqueble
- [ ] Animación de "pensando..." cuando es turno del oponente
- [ ] Replay del juego
- [ ] Undo/Redo (con consentimiento de ambas)
