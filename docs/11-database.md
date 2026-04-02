# 🗄️ Módulo: Base de Datos (Schema Completo)

## Responsabilidad

Documentar el esquema relacional completo de PostgreSQL en Supabase, incluyendo tablas, funciones, triggers, índices y políticas RLS.

## Diagrama de Relaciones

```
auth.users (Supabase managed)
    │
    └──→ profiles (1:1, CASCADE)
           │
           ├──→ friendships (requester_id, addressee_id)
           ├──→ game_sessions (player1_id, player2_id, winner_id)
           ├──→ game_invitations (sender_id, receiver_id)
           └──→ user_rewards (user_id)
                    │
                    └──→ rewards

riddle_categories
    │
    └──→ riddles (category_id)
```

## Tablas (8 Total)

| # | Tabla | Rows Estimados | Dependencias |
|---|-------|---------------|--------------|
| 1 | `profiles` | = usuarios registrados | auth.users |
| 2 | `friendships` | ~10x usuarios (promedio 10 amigas cada una) | profiles × 2 |
| 3 | `game_sessions` | Crece con cada partida | profiles × 3 |
| 4 | `game_invitations` | Efímeras (se expiran) | profiles × 2 |
| 5 | `riddle_categories` | ~5-10 fijas | - |
| 6 | `riddles` | 50-200+ (crece con contenido) | riddle_categories |
| 7 | `rewards` | ~20-50 fijas | - |
| 8 | `user_rewards` | Crece con desbloqueos | profiles + rewards |

## Funciones (5)

| Función | Tipo | Propósito |
|---------|------|-----------|
| `generate_friend_code()` | RETURNS TEXT | Genera código único de 6 chars |
| `handle_new_user()` | TRIGGER | Auto-crea perfil al registrarse |
| `update_updated_at()` | TRIGGER | Auto-actualiza updated_at |
| `get_random_riddles(...)` | RPC | Obtiene N adivinanzas aleatorias |
| `add_points(...)` | RPC (SECURITY DEFINER) | Suma puntos de forma segura |

## Triggers (3)

| Trigger | Tabla | Evento | Función |
|---------|-------|--------|---------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |
| `profiles_updated_at` | `profiles` | BEFORE UPDATE | `update_updated_at()` |
| `friendships_updated_at` | `friendships` | BEFORE UPDATE | `update_updated_at()` |

## Índices (6)

| Índice | Tabla | Columnas | Condición |
|--------|-------|----------|-----------|
| `idx_friendships_requester` | friendships | requester_id, status | - |
| `idx_friendships_addressee` | friendships | addressee_id, status | - |
| `idx_game_sessions_players` | game_sessions | player1_id, player2_id | - |
| `idx_game_sessions_status` | game_sessions | status | WHERE status IN ('waiting','playing') |
| `idx_invitations_receiver` | game_invitations | receiver_id, status | WHERE status = 'pending' |
| `idx_riddles_category` | riddles | category_id, difficulty | WHERE is_active = true |
| `idx_user_rewards_user` | user_rewards | user_id | - |

## RLS Summary

| Tabla | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Todos auth'd | Auto (trigger) | Solo dueño | No |
| friendships | Participantes | Solo requester | Solo addressee | Participantes |
| game_sessions | Participantes | Solo player1 | Participantes | No |
| game_invitations | Participantes | Solo sender | Solo receiver | No |
| riddles | Todos (activos) | No (admin) | No (admin) | No (admin) |
| riddle_categories | Todos | No (admin) | No (admin) | No (admin) |
| rewards | Todos (activos) | No (admin) | No (admin) | No (admin) |
| user_rewards | Solo dueño | Solo dueño | No | No |

## Administración de Contenido

Las tablas `riddles`, `riddle_categories` y `rewards` se gestionan directamente desde el **Supabase Dashboard** (Table Editor). No hay panel de admin en esta fase.

**Para agregar adivinanzas:**
1. Ir a Supabase Dashboard → Table Editor → riddles
2. INSERT new row con question, answer, category_id, difficulty
3. Asegurar `is_active = true`

**Para agregar recompensas:**
1. Ir a Supabase Dashboard → Table Editor → rewards
2. INSERT new row con name, type, asset_id, cost_points, rarity

## Orden de Ejecución del SQL

Al configurar un proyecto nuevo de Supabase, ejecutar los scripts en este orden:

```
1. Funciones utilitarias (generate_friend_code, update_updated_at)
2. Tabla profiles + trigger on_auth_user_created
3. Tabla friendships + trigger + índices
4. Tabla game_sessions + índices
5. Tabla game_invitations + índices
6. Tabla riddle_categories
7. Tabla riddles + función get_random_riddles + índices
8. Función add_points
9. Tabla rewards
10. Tabla user_rewards + índices
11. Todas las políticas RLS
12. Seed de riddle_categories
13. Seed de riddles (30-50 iniciales)
14. Seed de rewards (catálogo inicial)
```

## Backup y Migración

- Supabase Pro tier incluye backups automáticos diarios
- Para migración manual: `pg_dump` desde Supabase
- Schema versionado en `docs/11-database.md` (este archivo)
- Cambios futuros al schema se documentan como "migración N" al final de este archivo

---

## Migraciones

### Migration 001 — Schema Inicial
**Fecha:** Al crear el proyecto
**Descripción:** Schema completo V1 con las 8 tablas, funciones, triggers e índices.

(Las migraciones futuras se agregarán aquí)
