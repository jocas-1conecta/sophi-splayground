# 👤 Módulo: Perfiles de Usuario

## Responsabilidad

Gestionar la información de perfil de cada jugadora: nombre, username, avatar, estadísticas de juego y el Friend Code para conectarse con amigas.

## Tabla: `profiles`

```sql
profiles
├── id              UUID PK (FK → auth.users.id, CASCADE)
├── username        TEXT UNIQUE (3-20 chars, auto-generado, editable)
├── display_name    TEXT (1-30 chars, del signup)
├── avatar_id       TEXT (default: 'avatar_01')
├── points          INTEGER (default: 0, CHECK >= 0)
├── games_played    INTEGER (default: 0)
├── games_won       INTEGER (default: 0)
├── friend_code     TEXT UNIQUE (6 chars, auto-generado)
├── created_at      TIMESTAMPTZ
└── updated_at      TIMESTAMPTZ (auto-updated via trigger)
```

## Friend Code

Un código alfanumérico de **6 caracteres** generado automáticamente al crear el perfil.

**Formato:** `A3K9F2` (mayúsculas + números)

**Propósito:** Permite agregar amigas de forma segura sin exponer email ni buscar por nombre.

**Generación:**
```sql
-- Genera código único, reintenta si hay colisión
code := upper(substr(md5(random()::text), 1, 6));
```

**Características:**
- Se genera una sola vez al crear el perfil
- No cambia nunca (es el "identificador social" de la jugadora)
- Se muestra prominentemente en Home y Profile
- Es el mecanismo exclusivo para agregar amigas

## Creación Automática de Perfil

Al registrarse un usuario en Supabase Auth, un **trigger** crea automáticamente su perfil:

```
auth.users INSERT
  ↓ trigger: on_auth_user_created
  ↓ function: handle_new_user()
  ↓
profiles INSERT:
  - id = auth.users.id
  - username = 'player_' + primeros 8 chars del UUID
  - display_name = metadata.display_name || 'Nueva Jugadora'
  - friend_code = generate_friend_code()
  - points = 0, games_played = 0, games_won = 0
```

## Campos Editables

| Campo | Editable | Restricciones |
|-------|----------|---------------|
| `display_name` | ✅ Sí | 1-30 caracteres |
| `username` | ✅ Sí | 3-20 chars, UNIQUE, solo letras/números/guiones bajos |
| `avatar_id` | ✅ Sí | Debe ser un avatar desbloqueado (futuro) |
| `friend_code` | ❌ No | Generado una vez, inmutable |
| `points` | ❌ No | Solo se modifica por game engine o rewards engine |
| Estadísticas | ❌ No | Solo se modifica por game engine |

## Estadísticas

- `games_played` — Se incrementa al completar cualquier partida (ganar, perder o empatar)
- `games_won` — Se incrementa solo al ganar una partida
- **Win Rate** — Calculado en el frontend: `Math.round((games_won / games_played) * 100)`

## RLS (Row Level Security)

```sql
-- Cualquier usuario autenticado puede ver cualquier perfil
-- (necesario para buscar por Friend Code, ver oponentes)
SELECT → authenticated, USING (true)

-- Solo el dueño puede editar su perfil
UPDATE → authenticated, USING (id = auth.uid())
```

## Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `stores/profileStore.js` | Estado global del perfil |
| `services/profileService.js` | CRUD contra Supabase |
| `pages/Profile/ProfilePage.jsx` | UI del perfil |
| `pages/Home/HomePage.jsx` | Muestra stats y friend code |
| `components/layout/Header.jsx` | Muestra puntos |

## Futuras Mejoras

- [ ] Avatar personalizable (sistema de partes combinables)
- [ ] Historial de partidas recientes
- [ ] Nivel de jugadora (basado en XP/puntos)
- [ ] Títulos desbloqueables visibles en el perfil
- [ ] Perfil público visto por otras jugadoras
