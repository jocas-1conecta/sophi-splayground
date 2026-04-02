# 👯 Módulo: Sistema de Amistades

## Responsabilidad

Gestionar las relaciones de amistad entre jugadoras: enviar solicitudes, aceptar/rechazar, listar amigas, y eliminar amistades.

## Modelo de Datos

### Tabla: `friendships`

```sql
friendships
├── id              UUID PK
├── requester_id    UUID FK → profiles.id (quien envía la solicitud)
├── addressee_id    UUID FK → profiles.id (quien la recibe)
├── status          TEXT ('pending' | 'accepted' | 'rejected')
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ
```

**Constraints:**
- `UNIQUE (requester_id, addressee_id)` — No duplicar la misma solicitud
- `CHECK (requester_id != addressee_id)` — No puedes agregarte a ti misma

## Flujo: Agregar Amiga

```
Jugadora A tiene el Friend Code de Jugadora B
  ↓
A ingresa el código "X4K2M9" en FriendsPage
  ↓
Frontend busca perfil: SELECT FROM profiles WHERE friend_code = 'X4K2M9'
  ↓
Si existe → Muestra nombre + avatar de B, botón "Enviar Solicitud"
  ↓
A confirma → INSERT INTO friendships (requester_id=A, addressee_id=B, status='pending')
  ↓
B ve la solicitud en su lista de "Solicitudes Pendientes"
  ↓
B puede: 
  ├── Aceptar → UPDATE friendships SET status='accepted'
  └── Rechazar → UPDATE friendships SET status='rejected'
```

## Flujo: Ver Amigas

Para obtener las amigas de un usuario, necesitamos buscar en ambas direcciones:

```sql
-- Amigas donde soy requester
SELECT p.* FROM friendships f
JOIN profiles p ON p.id = f.addressee_id
WHERE f.requester_id = :my_id AND f.status = 'accepted'

UNION

-- Amigas donde soy addressee
SELECT p.* FROM friendships f
JOIN profiles p ON p.id = f.requester_id
WHERE f.addressee_id = :my_id AND f.status = 'accepted'
```

## Estados de Amistad

```
         ┌──────────┐     Aceptar      ┌──────────┐
── Enviar │ pending  │ ───────────────→ │ accepted │
         └──────────┘                   └──────────┘
               │
               │ Rechazar
               ↓
         ┌──────────┐
         │ rejected │  (la solicitud desaparece de la UI)
         └──────────┘
```

**Regla:** Si A es rechazada por B, A puede volver a enviar solicitud (se crea nuevo row). La solicitud `rejected` queda como histórica pero no se muestra.

## Eliminar Amistad

- Cualquiera de las dos jugadoras puede eliminar la amistad
- Se hace DELETE del row en `friendships`
- La otra jugadora simplemente deja de verla en su lista

## RLS (Row Level Security)

```sql
-- Ver: solo mis amistades
SELECT → (requester_id = auth.uid() OR addressee_id = auth.uid())

-- Crear: solo yo puedo enviar solicitudes
INSERT → WITH CHECK (requester_id = auth.uid())

-- Actualizar: solo la destinataria puede aceptar/rechazar
UPDATE → USING (addressee_id = auth.uid())

-- Eliminar: cualquiera de las dos puede borrar la amistad
DELETE → USING (requester_id = auth.uid() OR addressee_id = auth.uid())
```

## UI Components

| Componente | Propósito |
|-----------|-----------|
| **FriendsPage** | Página principal del módulo |
| **AddFriendSection** | Input de Friend Code + búsqueda + enviar solicitud |
| **PendingRequestsList** | Solicitudes recibidas con botones Accept/Reject |
| **FriendsList** | Lista de amigas aceptadas con estado online/offline |
| **FriendCard** | Card de una amiga (avatar, nombre, online dot, botón invitar) |

## Integración con Presencia

Las amigas muestran un indicador online/offline:
- 🟢 **Online** — Jugadora está activa en la app (tracked via Supabase Presence)
- ⚪ **Offline** — No está conectada

Ver módulo `04-realtime.md` para detalles de implementación.

## Modo Demo

Cuando `isDemoMode = true` (sin `.env` configurado):
- Se cargan **3 amigas demo** (Luna, Valentina, Camila) con stats
- Se cargan **1 solicitud recibida** (Sofía) y **1 enviada** (Mariana)
- Se simulan estados online/offline (Luna y Camila online)
- `searchByFriendCode('T3ST99')` retorna "Isabella 🦋" para probar el flujo de agregar
- Las acciones de accept/reject/send simulan éxito sin DB

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `stores/friendStore.js` | Estado: friends[], pendingReceived[], pendingSent[], onlineUsers{} | ✅ |
| `services/friendService.js` | getFriends, getPendingReceived/Sent, sendRequest, accept/reject, removeFriendship, checkExisting | ✅ |
| `services/profileService.js` | searchByFriendCode (con demo mode) | ✅ |
| `pages/Friends/FriendsPage.jsx` | UI completa: AddFriendSection, tabs, FriendCard, PendingRequestCard | ✅ |
| `pages/Friends/Friends.css` | Estilos premium para toda la página | ✅ |
| `hooks/useFriends.js` | Hook que conecta store + service + realtime | ⬜ Fase 3 |

## Edge Cases

- **Buscar mi propio Friend Code:** El frontend debe validar que no sea el código propio antes de enviar solicitud
- **Solicitud ya existente (pending):** Mostrar mensaje "Ya enviaste una solicitud a esta jugadora"
- **Ya somos amigas:** Mostrar mensaje "Ya son amigas" y no permitir reenviar
- **Código inexistente:** Mostrar "No se encontró ninguna jugadora con ese código"
- **Doble dirección:** Si A ya envió solicitud a B, B no puede enviar otra a A (verificar en ambas direcciones)

## Futuras Mejoras

- [ ] Bloquear jugadoras
- [ ] Límite de amigas (ej. máximo 50)
- [ ] Notificación push al recibir solicitud
- [ ] "Jugadoras sugeridas" basado en amistades en común
- [ ] Historial de partidas jugadas juntas
