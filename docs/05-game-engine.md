# 🎯 Módulo: Game Engine (Infraestructura de Juegos)

## Responsabilidad

Gestionar el ciclo de vida de una partida: creación de sesión, invitación, aceptación, inicio, finalización y registro de resultados. Es la capa que conecta todos los juegos con Supabase.

## Modelo de Datos

### Tabla: `game_sessions`

```sql
game_sessions
├── id              UUID PK
├── game_type       TEXT ('tic_tac_toe' | 'tutti_frutti' | 'riddle_battle')
├── player1_id      UUID FK → profiles.id (quien creó la sala)
├── player2_id      UUID FK → profiles.id (quien aceptó la invitación)
├── status          TEXT ('waiting' | 'playing' | 'completed' | 'abandoned')
├── winner_id       UUID FK → profiles.id (nullable, null = empate)
├── game_state      JSONB (snapshot del estado final del juego)
├── metadata        JSONB (scores, rondas, detalles específicos del juego)
├── points_awarded  INTEGER (puntos otorgados al ganador)
├── started_at      TIMESTAMPTZ (cuando ambas jugadoras están listas)
├── completed_at    TIMESTAMPTZ
└── created_at      TIMESTAMPTZ
```

### Tabla: `game_invitations`

```sql
game_invitations
├── id              UUID PK
├── sender_id       UUID FK → profiles.id
├── receiver_id     UUID FK → profiles.id
├── game_type       TEXT
├── status          TEXT ('pending' | 'accepted' | 'declined' | 'expired')
├── expires_at      TIMESTAMPTZ (created_at + 60 seconds)
└── created_at      TIMESTAMPTZ
```

## Ciclo de Vida de una Partida

```
1. INVITACIÓN
   Jugadora A selecciona juego + selecciona amiga online
   → INSERT game_invitations (status='pending', expires_at=now()+60s)
   → Broadcast a user:{B.id} → { type: 'game_invite', ... }
   → A ve "Esperando respuesta..." con countdown 60s

2. RESPUESTA
   B recibe modal de invitación
   ├── Acepta:
   │   → UPDATE game_invitations SET status='accepted'
   │   → INSERT game_sessions (player1=A, player2=B, status='waiting')
   │   → Broadcast a user:{A.id} → { type: 'invite_accepted', session_id }
   │   → Ambas se suscriben a game:{session_id}
   │
   ├── Declina:
   │   → UPDATE game_invitations SET status='declined'
   │   → Broadcast a user:{A.id} → { type: 'invite_declined' }
   │   → A ve toast "B declinó tu invitación"
   │
   └── Expira (60s sin respuesta):
       → UPDATE game_invitations SET status='expired'
       → A ve toast "La invitación expiró"

3. SALA DE ESPERA
   Ambas jugadoras llegan al componente del juego
   → presence.track() en game:{session_id}
   → Cuando ambas están tracked → UPDATE game_sessions SET status='playing'
   → El juego comienza

4. EN JUEGO
   Los movimientos/respuestas se envían via Broadcast
   La lógica del juego se ejecuta en el cliente
   Ver módulos específicos: 07-tic-tac-toe, 08-tutti-frutti, 09-riddle-battle

5. FIN DE PARTIDA
   El juego determina el resultado:
   → UPDATE game_sessions SET status='completed', winner_id, completed_at
   → Calcular puntos según GAME_INFO[game_type].pointsWin/Draw/Lose
   → UPDATE profiles SET points += awarded, games_played += 1
   → Si winner: UPDATE profiles SET games_won += 1
   → Mostrar pantalla de resultados con animación

6. ABANDONO (Desconexión)
   → Detectado via presence.leave + timer 30s
   → UPDATE game_sessions SET status='abandoned', winner_id=connected_player
   → La jugadora conectada recibe los puntos de victoria
```

## Estado del Juego (`game_state` JSONB)

Cada juego almacena su estado final diferente:

**Tic Tac Toe:**
```json
{
  "board": ["X", "O", null, "X", null, "O", null, null, "X"],
  "current_turn": "X",
  "result": "win" // "win" | "draw"
}
```

**Tutti Frutti:**
```json
{
  "letter": "M",
  "rounds": [
    {
      "round": 1,
      "player1_answers": { "nombre": "María", "animal": "Mono" },
      "player2_answers": { "nombre": "Manuel", "animal": "Mariposa" },
      "player1_score": 15,
      "player2_score": 10
    }
  ],
  "total_scores": { "player1": 45, "player2": 35 }
}
```

**Riddle Battle:**
```json
{
  "riddles_used": ["uuid1", "uuid2", "uuid3"],
  "rounds": [
    {
      "riddle_id": "uuid1",
      "player1_answer": "sol",
      "player2_answer": "sol",
      "correct_answer": "sol",
      "player1_correct": true,
      "player2_correct": true,
      "player1_time_ms": 3200,
      "player2_time_ms": 5100,
      "round_winner": "player1_id" // más rápido
    }
  ],
  "final_score": { "player1": 3, "player2": 1 }
}
```

## Puntos por Juego

| Juego | Victoria | Empate | Derrota |
|-------|----------|--------|---------|
| Tic Tac Toe | 10 pts | 3 pts | 1 pt |
| Tutti Frutti | 25 pts | 10 pts | 5 pts |
| Riddle Battle | 20 pts | 8 pts | 3 pts |

## RLS (Row Level Security)

```sql
-- Ver: solo mis partidas
SELECT → (player1_id = auth.uid() OR player2_id = auth.uid())

-- Crear: yo soy player1
INSERT → WITH CHECK (player1_id = auth.uid())

-- Actualizar: cualquier jugador de la partida
UPDATE → USING (player1_id = auth.uid() OR player2_id = auth.uid())
```

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `services/gameService.js` | createGameSession, updateGameSession, createInvitation, respondToInvitation, finalizeGame | ✅ |
| `stores/gameStore.js` | currentSession, gameState, myRole, isMyTurn, scores, sentInvitation, pendingInvitation, quickChatMessages | ✅ |
| `pages/Lobby/LobbyPage.jsx` | Flujo 2 pasos: Seleccionar juego → Seleccionar amiga online → Enviar invitación | ✅ |
| `pages/Lobby/Lobby.css` | Steps indicator, game cards, friend picker, modales | ✅ |
| `pages/Games/GameLayout.jsx` | Layout compartido: header (salir, nombre, score) + QuickChat | ✅ |
| `pages/Games/GameLayout.css` | Sticky header, centered content, coming-soon placeholder | ✅ |
| `pages/Games/TicTacToe/TicTacToePage.jsx` | Placeholder con GameLayout (Fase 4) | ✅ |
| `pages/Games/TuttiFrutti/TuttiFruttiPage.jsx` | Placeholder con GameLayout (Fase 6) | ✅ |
| `pages/Games/RiddleBattle/RiddleBattlePage.jsx` | Placeholder con GameLayout (Fase 5) | ✅ |
| `components/game/QuickChat.jsx` | 12 frases, toggle FAB, bubble popup, grid picker | ✅ |
| `components/game/QuickChat.css` | Floating button, glassmorphism picker, pop-in bubbles | ✅ |
| `constants/gameConfig.js` | GAME_TYPES, GAME_INFO, timeouts, categorías | ✅ |
| `hooks/useGameRoom.js` | Canal Realtime de la sala | ⬜ Fase 4 |
| `hooks/useDisconnection.js` | Timer de desconexión | ⬜ Fase 4 |

## Modo Demo

Cuando `isDemoMode = true`:
- `createGameSession()` retorna un objeto session local sin DB
- `createInvitation()` retorna una invitación simulada
- En el Lobby, la aceptación se simula automáticamente después de 2 segundos
- Los juegos cargan su placeholder (GameLayout + "Próximamente")
- El QuickChat funciona localmente con bubbles y grid picker

## Flujo del Lobby (2 pasos)

```
Paso 1: Seleccionar Juego
  │ 3 cards: 3 en Raya, Tutti Frutti, Batalla de Adivinanzas
  │ Cada card muestra: emoji, nombre, descripción, puntos, timer/rondas
  └── Click → Avanza a Paso 2

Paso 2: Seleccionar Amiga
  │ 🟢 Online: amigas conectadas (seleccionables)
  │ ⚫ Offline: amigas desconectadas (disabled, grayed out)
  └── Click amiga + "Invitar" → Modal de espera con countdown 60s
       └── Demo: auto-acepta a los 2s → Navega a /game/{type}/{sessionId}
```

## Constantes del Game Engine (`constants/gameConfig.js`)

| Constante | Valor | Uso |
|-----------|-------|-----|
| `INVITATION_TIMEOUT_MS` | 60000 (60s) | Tiempo para aceptar invitación |
| `DISCONNECT_TIMEOUT_MS` | 30000 (30s) | Tiempo antes de dar abandono |
| `FRIEND_CODE_LENGTH` | 6 | Largo del Friend Code |
| `TUTTI_FRUTTI_CATEGORIES` | 6 categorías | Nombre, Animal, Color, País, Fruta, Objeto |

## Futuras Mejoras

- [ ] Revancha (botón "Jugar otra vez" al finalizar)
- [ ] Historial de partidas con replay
- [ ] Matchmaking aleatorio (buscar oponente random)
- [ ] Torneos entre amigas
- [ ] Estadísticas por juego (win rate de Tic Tac Toe vs Tutti Frutti)
