# 🎮 Sophi's Playground — Overview

> PWA de minijuegos multijugador en línea para niñas de 10-14 años.

## Visión del Producto

Una plataforma de juego en línea **divertida, segura y apropiada para preadolescentes**, donde las jugadoras pueden jugar minijuegos con sus amigas sin los riesgos del chat libre.

## Público Objetivo

| Aspecto | Detalle |
|---------|---------|
| **Primario** | Niñas de 10-14 años |
| **Secundario** | Padres/madres (stakeholders de confianza) |
| **Diseño** | Colores pastel, animaciones divertidas, interfaz amigable |

## Principios de Diseño

1. **Kids Safe** — Sin chat libre, sin UGC, sin exposición de datos personales
2. **Fun First** — Cada interacción debe sentirse divertida y recompensante
3. **Simple & Accesible** — Navegación intuitiva, sin tutoriales extensos
4. **Social pero seguro** — Conectarse con amigas por código, no por búsqueda abierta

## Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | React 19 + Vite | SPA con PWA |
| **Estado** | Zustand | Estado global ligero |
| **Estilos** | CSS Vanilla | Design system pastel personalizado |
| **Auth** | Supabase Auth | Email/password |
| **Base de Datos** | Supabase PostgreSQL | Perfiles, amigos, adivinanzas, recompensas |
| **Realtime** | Supabase Realtime | Multiplayer, presencia, chat rápido |
| **Hosting** | Cloudflare Pages | Deploy estático |

## Mapa de Módulos

```
docs/
├── 00-overview.md          ← Este archivo
├── 01-auth.md              ← Autenticación y sesión
├── 02-profiles.md          ← Perfiles de usuario y Friend Code
├── 03-friends.md           ← Sistema de amistades
├── 04-realtime.md          ← Estrategia de canales Realtime
├── 05-game-engine.md       ← Infraestructura de juegos (salas, invitaciones)
├── 06-quick-chat.md        ← Chat seguro con frases predefinidas
├── 07-tic-tac-toe.md       ← Lógica del 3 en Raya
├── 08-tutti-frutti.md      ← Lógica del Tutti Frutti
├── 09-riddle-battle.md     ← Lógica de Batalla de Adivinanzas
├── 10-rewards.md           ← Sistema de puntos y recompensas
├── 11-database.md          ← Schema SQL completo y RLS
├── 12-design-system.md     ← Paleta, tipografía, componentes CSS, animaciones
└── 13-project-structure.md ← Carpetas, convenciones, estado de implementación
```

## Escala Objetivo (Fase Inicial)

- < 500 usuarios concurrentes
- Supabase Free/Pro tier
- Solo desarrollador
- Deploy estático (no SSR)
