# 📡 Módulo: Supabase Realtime

## Responsabilidad

Gestionar la comunicación en tiempo real entre jugadoras: presencia (online/offline), invitaciones de juego, sincronización de estado de juego, y chat rápido.

## Canales

### 1. `presence:lobby` — Quién está online

**Propósito:** Trackear qué jugadoras están activas para mostrar el indicador online/offline en la lista de amigas.

**Tipo:** Supabase Presence

**Lifecycle:**
```
Login → subscribe to presence:lobby → track({ user_id, display_name })
App visible → track (keep alive)
App hidden / logout → untrack()
```

**Eventos:**
- `sync` — Estado inicial + actualizaciones
- `join` — Una jugadora se conecta
- `leave` — Una jugadora se desconecta

**Datos tracked:**
```javascript
{
  user_id: 'uuid',
  display_name: 'Sofía',
  avatar_id: 'avatar_01',
  status: 'online' // 'online' | 'in_game'
}
```

---

### 2. `user:{user_id}` — Canal personal

**Propósito:** Recibir invitaciones de juego y notificaciones dirigidas a una jugadora específica.

**Tipo:** Supabase Broadcast

**Se suscribe al hacer login.** Cada jugadora escucha su propio canal.

**Mensajes que puede recibir:**

| type | Payload | Acción en UI |
|------|---------|-------------|
| `game_invite` | `{ from_id, from_name, game_type, session_id }` | Mostrar modal de invitación |
| `invite_accepted` | `{ session_id, by_name }` | Redirigir a sala de juego |
| `invite_declined` | `{ by_name }` | Mostrar toast "X declinó tu invitación" |
| `friend_request` | `{ from_id, from_name }` | Mostrar badge en tab de amigas |

---

### 3. `game:{session_id}` — Canal de partida

**Propósito:** Sincronizar el estado del juego entre las dos jugadoras durante una partida activa.

**Tipo:** Supabase Broadcast + Presence

**Se suscribe al entrar a una sala de juego.** Se desuscribe al salir.

#### Presence (detección de conexión)

```javascript
// Al entrar a la sala
channel.presence.track({ user_id, role: 'player1' | 'player2' })

// Eventos
channel.presence.on('leave', () => {
  // Oponente se desconectó → iniciar timer de 30s
})
```

#### Broadcast — Mensajes de juego

| type | Juego | Payload |
|------|-------|---------|
| `move` | Tic Tac Toe | `{ cell: 0-8, player: 'X' \| 'O' }` |
| `answers_submitted` | Tutti Frutti | `{ answers: { nombre: 'Ana', animal: 'Araña', ... } }` |
| `basta` | Tutti Frutti | `{ player_id }` (quien gritó ¡BASTA!) |
| `answer` | Riddle Battle | `{ riddle_id, answer: 'texto', time_ms: 4500 }` |
| `round_ready` | Todos | `{ player_id }` (listo para la siguiente ronda) |
| `quick_chat` | Todos | `{ phrase_id: 3, player_id }` |
| `game_over` | Todos | `{ winner_id, scores }` |

## Flujo de Conexión/Desconexión

```
Jugadora entra a sala
  ↓
subscribe to game:{session_id}
  ↓
presence.track({ user_id, role })
  ↓
Espera a que ambas jugadoras estén tracked
  ↓
Estado del juego: 'waiting' → 'playing'
  ↓
━━━ JUEGO EN CURSO ━━━
  ↓
Si una jugadora se desconecta:
  ↓
presence.leave event detectado por la otra jugadora
  ↓
Mostrar overlay: "Tu amiga se fue... esperando reconexión"
  ↓
Timer de 30 segundos
  ↓
├── Si reconecta → presence.track() → continuar partida
└── Si timeout → marcar partida como 'abandoned'
              → la jugadora conectada gana por default
              → UPDATE game_sessions SET status='abandoned', winner_id=connected_player
```

## Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `services/realtimeService.js` | Helpers: joinChannel, leaveChannel, broadcast, trackPresence |
| `hooks/usePresence.js` | Hook de presencia para lobby (online/offline) |
| `hooks/useGameRoom.js` | Hook de canal de juego (join/leave/broadcast) |
| `hooks/useQuickChat.js` | Hook de chat rápido (send/receive) |
| `hooks/useDisconnection.js` | Hook de manejo de desconexión |
| `stores/friendStore.js` | Almacena onlineUsers{} del presence |
| `stores/gameStore.js` | Almacena estado del juego desde broadcasts |

## Límites de Supabase Realtime

| Límite (Free Tier) | Valor |
|--------------------|-------|
| Conexiones simultáneas | 200 |
| Mensajes/segundo | 100 |
| Payload máximo | 64KB |
| Canales por conexión | 100 |

**Mitigaciones:**
- Cada jugadora tiene máximo 2-3 canales activos (lobby + user + game)
- Los payloads de juego son pequeños (< 1KB)
- Al salir de una partida, se desuscribe del canal de juego

## Futuras Mejoras

- [ ] Reconexión automática con state recovery
- [ ] Indicador de latencia (ping)
- [ ] Heartbeat custom para detección más rápida
- [ ] Spectator mode (observar partida de amigas)
