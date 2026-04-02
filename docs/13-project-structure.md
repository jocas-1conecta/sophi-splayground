# 📁 Módulo: Estructura del Proyecto

## Responsabilidad

Documentar la organización de carpetas, convenciones de nombrado, y la ubicación exacta de cada tipo de archivo del proyecto.

## Árbol de Carpetas

```
sophis-playground/
├── public/
│   └── favicon.svg                    # Favicon SVG del proyecto
│
├── docs/                              # 📚 Documentación de negocio (este directorio)
│   ├── 00-overview.md
│   ├── 01-auth.md
│   ├── 02-profiles.md
│   ├── 03-friends.md
│   ├── 04-realtime.md
│   ├── 05-game-engine.md
│   ├── 06-quick-chat.md
│   ├── 07-tic-tac-toe.md
│   ├── 08-tutti-frutti.md
│   ├── 09-riddle-battle.md
│   ├── 10-rewards.md
│   ├── 11-database.md
│   ├── 12-design-system.md
│   └── 13-project-structure.md
│
├── src/
│   ├── main.jsx                       # Entry point de React
│   ├── App.jsx                        # Router + Auth guards
│   │
│   ├── styles/                        # 🎨 Design System
│   │   ├── variables.css              # Design tokens (colores, fonts, spacing)
│   │   ├── animations.css             # Keyframes + utility animation classes
│   │   ├── index.css                  # Reset, globals, body background, imports
│   │   └── components.css             # Estilos de componentes base (btn, card, input)
│   │
│   ├── constants/                     # 📐 Constantes de la aplicación
│   │   ├── routes.js                  # ROUTES{} y NAV_ITEMS[]
│   │   ├── gameConfig.js              # GAME_TYPES, GAME_INFO, TUTTI_FRUTTI_CATEGORIES
│   │   └── quickChatPhrases.js        # QUICK_CHAT_PHRASES[] (12 frases predefinidas)
│   │
│   ├── services/                      # 🔌 Capa de acceso a Supabase
│   │   ├── supabase.js                # Cliente singleton + isDemoMode
│   │   ├── authService.js             # signIn, signUp, signOut, getSession, onAuthStateChange
│   │   └── profileService.js          # getProfile, updateProfile, searchByFriendCode, addPoints
│   │
│   ├── stores/                        # 📦 Zustand stores (estado global)
│   │   ├── authStore.js               # user, session, init(), signIn/Up/Out()
│   │   ├── profileStore.js            # profile, fetchProfile(), updateProfile()
│   │   ├── friendStore.js             # friends[], pendingReceived[], onlineUsers{}
│   │   └── gameStore.js               # currentGame, gameState, scores
│   │
│   ├── components/                    # 🧩 Componentes reutilizables
│   │   ├── layout/
│   │   │   ├── Layout.jsx + .css      # Shell: Header + Main + BottomNav + Toast
│   │   │   ├── Header.jsx + .css      # Header fijo con brand + puntos
│   │   │   └── BottomNav.jsx + .css   # Barra de navegación inferior
│   │   │
│   │   ├── feedback/
│   │   │   ├── LoadingScreen.jsx + .css  # Pantalla de carga con spinner
│   │   │   └── Toast.jsx + .css          # Sistema de notificaciones temporales
│   │   │
│   │   └── ui/
│   │       └── Modal.jsx + .css          # Modal accesible con overlay
│   │
│   ├── pages/                         # 📄 Páginas (una carpeta por feature)
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx          # Formulario de login
│   │   │   ├── RegisterPage.jsx       # Formulario de registro
│   │   │   └── Auth.css               # Estilos compartidos de auth
│   │   │
│   │   ├── Home/
│   │   │   ├── HomePage.jsx           # Dashboard: greeting, stats, games, friend code
│   │   │   └── HomePage.css
│   │   │
│   │   ├── Profile/
│   │   │   ├── ProfilePage.jsx        # Avatar, stats, edit profile, sign out
│   │   │   └── Profile.css
│   │   │
│   │   ├── Friends/
│   │   │   ├── FriendsPage.jsx        # Lista de amigas (placeholder)
│   │   │   └── Friends.css
│   │   │
│   │   ├── Lobby/
│   │   │   ├── LobbyPage.jsx          # Selección de juego + invitación
│   │   │   └── Lobby.css
│   │   │
│   │   └── Games/                     # 🎮 (Futuro) Páginas de juego
│   │       ├── TicTacToe/
│   │       │   ├── TicTacToePage.jsx
│   │       │   ├── Board.jsx
│   │       │   ├── Cell.jsx
│   │       │   └── TicTacToe.css
│   │       ├── TuttiFrutti/
│   │       │   ├── TuttiFruttiPage.jsx
│   │       │   ├── LetterSpinner.jsx
│   │       │   ├── AnswerGrid.jsx
│   │       │   ├── RevealPhase.jsx
│   │       │   └── TuttiFrutti.css
│   │       └── RiddleBattle/
│   │           ├── RiddleBattlePage.jsx
│   │           ├── RiddleCard.jsx
│   │           ├── AnswerInput.jsx
│   │           ├── ScoreTracker.jsx
│   │           └── RiddleBattle.css
│   │
│   ├── lib/                           # 🧠 (Futuro) Lógica de juego pura
│   │   ├── ticTacToeLogic.js          # checkWin, checkDraw, isValidMove, makeMove
│   │   ├── tuttiFruttiLogic.js        # validateAnswer, scoreCategory, pickLetter
│   │   └── riddleBattleLogic.js       # checkRiddleAnswer, determineRoundWinner
│   │
│   └── hooks/                         # 🪝 (Futuro) Custom hooks
│       ├── usePresence.js             # Presence del lobby (online/offline)
│       ├── useGameRoom.js             # Canal de Realtime del juego
│       ├── useQuickChat.js            # Enviar/recibir chat rápido
│       └── useDisconnection.js        # Timer de desconexión
│
├── index.html                         # HTML entry point con PWA meta tags
├── vite.config.js                     # Vite + React + PWA plugin
├── package.json                       # Dependencias + scripts
├── .env.example                       # Template de variables de entorno
└── .gitignore                         # node_modules, dist, .env
```

## Convenciones de Nombrado

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| **Componentes** | PascalCase | `HomePage.jsx`, `LoadingScreen.jsx` |
| **CSS** | kebab-case (clases) | `.home-game-card`, `.auth-error` |
| **Stores** | camelCase + "Store" | `authStore.js`, `profileStore.js` |
| **Services** | camelCase + "Service" | `authService.js`, `profileService.js` |
| **Hooks** | camelCase + "use" prefix | `usePresence.js`, `useGameRoom.js` |
| **Logic** | camelCase + "Logic" | `ticTacToeLogic.js` |
| **Constants** | UPPER_SNAKE_CASE (valores) | `GAME_TYPES`, `ROUTES` |
| **Carpetas page** | PascalCase | `Auth/`, `Home/`, `Profile/` |
| **Carpetas componente** | kebab-case | `layout/`, `feedback/`, `ui/` |

## Convención CSS

Cada componente tiene su propio archivo `.css` co-ubicado:
```
ComponentName.jsx
ComponentName.css  ← o nombre descriptivo del módulo (Auth.css, Lobby.css)
```

**No se usa CSS-in-JS, CSS Modules, ni Tailwind.** Se usa CSS vanilla con clases BEM-like y design tokens via CSS Custom Properties.

## Regla de Imports

```javascript
// 1. React / terceros
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// 2. Stores
import { useAuthStore } from '../../stores/authStore';

// 3. Services
import { getProfile } from '../../services/profileService';

// 4. Constants
import { ROUTES } from '../../constants/routes';

// 5. Components
import LoadingScreen from '../../components/feedback/LoadingScreen';

// 6. Styles (último)
import './ComponentName.css';
```

## Estado Actual vs Planificado

| Carpeta/Archivo | Estado | Fase |
|-----------------|--------|------|
| `styles/*` | ✅ Implementado | 0 |
| `constants/*` | ✅ Implementado | 0 |
| `services/supabase.js` | ✅ Implementado | 0 |
| `services/authService.js` | ✅ Implementado | 1 |
| `services/profileService.js` | ✅ Implementado | 1 |
| `stores/authStore.js` | ✅ Implementado | 1 |
| `stores/profileStore.js` | ✅ Implementado | 1 |
| `stores/friendStore.js` | ✅ Implementado | 2 |
| `stores/gameStore.js` | ✅ Implementado | 3 |
| `components/layout/*` | ✅ Implementado | 1 |
| `components/feedback/*` | ✅ Implementado | 1 |
| `components/ui/Modal` | ✅ Implementado | 1 |
| `pages/Auth/*` | ✅ Implementado | 1 |
| `pages/Home/*` | ✅ Implementado | 1 |
| `pages/Profile/*` | ✅ Implementado | 1 |
| `pages/Friends/*` | ✅ Implementado | 2 |
| `pages/Lobby/*` | ✅ Implementado | 3 |
| `pages/Games/TicTacToe/*` | ✅ Implementado | 4 |
| `pages/Games/RiddleBattle/*` | ✅ Implementado | 5 |
| `pages/Games/TuttiFrutti/*` | ✅ Implementado | 6 |
| `components/game/*` | ✅ QuickChat | 3 |
| `lib/ticTacToeLogic.js` | ✅ Implementado | 4 |
| `lib/riddleBattleLogic.js` | ✅ Implementado | 5 |
| `lib/tuttiFruttiLogic.js` | ✅ Implementado | 6 |
| `constants/riddleBank.js` | ✅ Implementado | 5 |
| `constants/rewardsCatalog.js` | ✅ Implementado | 7 |
| `stores/rewardStore.js` | ✅ Implementado | 7 |
| `pages/Rewards/*` | ✅ Implementado | 7 |
| `hooks/*` | ⬜ No creado | futuro |
