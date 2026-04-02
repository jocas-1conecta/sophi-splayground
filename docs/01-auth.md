# 🔐 Módulo: Autenticación

## Responsabilidad

Gestionar el registro, inicio de sesión, cierre de sesión y persistencia de sesión de las jugadoras.

## Proveedor

**Supabase Auth** con email/password (sin OAuth social en esta fase).

## Flujos

### Registro (Sign Up)

```
Jugadora → Ingresa email, contraseña, nombre
        → Supabase Auth crea usuario en auth.users
        → Trigger `on_auth_user_created` crea fila en profiles automáticamente
        → Se genera friend_code único de 6 caracteres
        → Sesión se persiste en localStorage
        → Redirect a Home
```

**Campos requeridos:**
- `email` — Correo electrónico (validación HTML5)
- `password` — Mínimo 6 caracteres
- `display_name` — Nombre visible, 2-30 caracteres (se pasa como `user_metadata`)

**Post-registro automático:**
- Se crea el perfil con username temporal `player_{id_primeros_8_chars}`
- `display_name` se toma del metadata del signup
- `friend_code` se genera con la función `generate_friend_code()`
- `points`, `games_played`, `games_won` inician en 0

### Login (Sign In)

```
Jugadora → Ingresa email + contraseña
        → Supabase valida credenciales
        → Retorna sesión con JWT
        → authStore actualiza user + session
        → Redirect a Home
```

### Logout (Sign Out)

```
Jugadora → Click en "Cerrar Sesión" (ProfilePage)
        → Supabase invalida sesión
        → authStore limpia user + session
        → profileStore.clear()
        → friendStore.clear()
        → Redirect a Login
```

### Persistencia de Sesión

- Supabase persiste la sesión en `localStorage` automáticamente
- Al iniciar la app, `authStore.init()` intenta recuperar la sesión existente
- Si hay sesión válida → auto-login (no muestra LoginPage)
- Si no hay sesión → muestra LoginPage
- `onAuthStateChange` escucha cambios (token refresh, sign out en otra pestaña)

## Archivos Relacionados

| Archivo | Propósito |
|---------|-----------|
| `stores/authStore.js` | Estado global de auth (user, session, isLoading, error) |
| `services/authService.js` | Wrapper sobre Supabase Auth API |
| `services/supabase.js` | Cliente Supabase singleton |
| `pages/Auth/LoginPage.jsx` | UI de login |
| `pages/Auth/RegisterPage.jsx` | UI de registro |
| `App.jsx` | Route guards (ProtectedRoute, AuthRoute) |

## Protección de Rutas

| Tipo | Comportamiento |
|------|---------------|
| `ProtectedRoute` | Si no hay user → redirect a `/login` |
| `AuthRoute` | Si ya hay user → redirect a `/` (Home) |

## Rutas de la Aplicación

| Ruta | Página | Guard | Estado |
|------|--------|-------|--------|
| `/login` | LoginPage | AuthRoute | ✅ |
| `/register` | RegisterPage | AuthRoute | ✅ |
| `/` | HomePage | ProtectedRoute | ✅ |
| `/profile` | ProfilePage | ProtectedRoute | ✅ |
| `/friends` | FriendsPage | ProtectedRoute | ✅ |
| `/lobby` | LobbyPage | ProtectedRoute | ✅ |
| `/game/tic-tac-toe/:sessionId` | TicTacToePage | ProtectedRoute | 🔲 |
| `/game/tutti-frutti/:sessionId` | TuttiFruttiPage | ProtectedRoute | 🔲 |
| `/game/riddle-battle/:sessionId` | RiddleBattlePage | ProtectedRoute | 🔲 |
| `*` | Redirect → `/` | — | ✅ |

**Bottom Nav (4 tabs):** Inicio 🏠 · Jugar 🎮 · Amigas 👯 · Perfil ✨

## Modo Demo

Cuando no hay `.env` configurado (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`):
- La app entra en **modo demo** automáticamente
- Se auto-logea con un usuario fake (`DEMO_USER`)
- Permite visualizar toda la UI sin Supabase
- Console muestra advertencia con instrucciones

## Consideraciones de Seguridad

- **No se expone el email** en ninguna parte de la UI pública
- Las contraseñas las maneja Supabase (hashed con bcrypt)
- JWT se refresca automáticamente
- No hay recuperación de contraseña en esta fase (agregar después)
- No hay verificación de email en esta fase (se puede habilitar en Supabase Dashboard)

## Dependencias

- `@supabase/supabase-js` — Cliente Supabase
- `zustand` — Estado global
- `react-router-dom` — Routing y guards

## Futuras Mejoras

- [ ] Recuperar contraseña (email reset)
- [ ] Verificación de email obligatoria
- [ ] OAuth social (Google) para login más fácil
- [ ] Rate limiting en intentos de login
- [ ] Parental controls / cuenta de tutor vinculada
