# 🎨 Módulo: Design System

## Responsabilidad

Definir y documentar el sistema de diseño visual de Sophi's Playground: paleta de colores, tipografía, spacing, componentes base, animaciones y el concepto "Enchanted Night".

## Concepto Visual: "Enchanted Night"

Un dark mode mágico con tonos pastel que se siente premium y divertido al mismo tiempo. No es un dark mode "corporativo" — es un **cielo nocturno encantado** donde los colores pastel son las estrellas.

**Inspiración:** Aurora boreal + galaxia + jardín mágico nocturno.

## Paleta de Colores

### Primarios

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-primary` | `#c4a7e7` | Lavender — botones principales, acentos, enlaces |
| `--color-primary-light` | `#d9c7f0` | Hover states, texto destacado |
| `--color-primary-dark` | `#9b7bc7` | Active states, bordes |
| `--color-primary-glow` | `rgba(196,167,231,0.3)` | Glow effects, shadows |
| `--color-secondary` | `#f5a9c0` | Rose — botones secundarios, highlights |
| `--color-secondary-light` | `#f9c7d6` | Hover |
| `--color-secondary-dark` | `#e87da0` | Active |
| `--color-accent` | `#a3d9a5` | Mint — éxito, positivo, salud |
| `--color-accent-light` | `#c5e8c6` | Hover |
| `--color-accent-dark` | `#7cc47e` | Active |

### Warm Extras

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-peach` | `#f8c8a4` | Tutti Frutti game accent |
| `--color-yellow` | `#f9e784` | Advertencias, logros |
| `--color-sky` | `#a8daef` | Tic Tac Toe game accent |
| `--color-lilac` | `#d4b5f0` | Riddle Battle game accent |

### Backgrounds (Dark Mode)

| Token | Hex | Uso |
|-------|-----|-----|
| `--bg-deep` | `#0f0a19` | Background más profundo |
| `--bg-base` | `#1a1225` | Body background principal |
| `--bg-surface` | `#241b33` | Cards, paneles |
| `--bg-elevated` | `#2e2441` | Modals, dropdowns |
| `--bg-overlay` | `rgba(15,10,25,0.85)` | Overlay detrás de modals |

### Glassmorphism

| Token | Valor | Uso |
|-------|-------|-----|
| `--glass-bg` | `rgba(36,27,51,0.6)` | Fondo translúcido de glass |
| `--glass-border` | `rgba(196,167,231,0.15)` | Borde sutil de glass |
| `--glass-blur` | `16px` | Intensity del blur |

**Clase `.glass`:** Aplica la combinación de glass-bg + backdrop-filter + border.

### Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--text-primary` | `#f2e9ff` | Texto principal (headings, body) |
| `--text-secondary` | `#b8a4cc` | Texto secundario (subtítulos, descripciones) |
| `--text-muted` | `#7a6890` | Texto terciario (placeholders, labels) |
| `--text-on-primary` | `#1a1225` | Texto sobre fondos de color primario |

### Status

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-success` | `#a3d9a5` | Operación exitosa, respuesta correcta |
| `--color-warning` | `#f9e784` | Advertencia, timeout cercano |
| `--color-error` | `#f07a8c` | Error, respuesta incorrecta |
| `--color-info` | `#a8daef` | Información neutral |
| `--color-online` | `#6ee07a` | Jugadora conectada |
| `--color-offline` | `#7a6890` | Jugadora desconectada |

## Tipografía

| Fuente | Uso | Estilo |
|--------|-----|--------|
| **Quicksand** | `--font-display` — Títulos, headers, botones, nombres | Rounded, friendly, bold |
| **Nunito** | `--font-body` — Cuerpo, párrafos, inputs, labels | Soft, legible, regular |

**Escala tipográfica:**

| Token | Tamaño | Uso |
|-------|--------|-----|
| `--text-xs` | 0.75rem (12px) | Labels, badges, counters |
| `--text-sm` | 0.875rem (14px) | Texto secundario, hints |
| `--text-base` | 1rem (16px) | Cuerpo de texto estándar |
| `--text-lg` | 1.125rem (18px) | Subtítulos de sección |
| `--text-xl` | 1.25rem (20px) | Títulos de cards |
| `--text-2xl` | 1.5rem (24px) | Títulos de sección, stats |
| `--text-3xl` | 2rem (32px) | Friend Code display |
| `--text-4xl` | 2.5rem (40px) | Títulos de página (Auth) |

**Pesos:**

| Token | Valor | Uso |
|-------|-------|-----|
| `--weight-regular` | 400 | Cuerpo de texto |
| `--weight-medium` | 500 | Labels |
| `--weight-semibold` | 600 | Texto enfatizado |
| `--weight-bold` | 700 | Subtítulos, botones |
| `--weight-extrabold` | 800 | Títulos principales |

## Spacing Scale

| Token | Tamaño | px |
|-------|--------|----|
| `--space-xs` | 0.25rem | 4px |
| `--space-sm` | 0.5rem | 8px |
| `--space-md` | 0.75rem | 12px |
| `--space-base` | 1rem | 16px |
| `--space-lg` | 1.5rem | 24px |
| `--space-xl` | 2rem | 32px |
| `--space-2xl` | 3rem | 48px |
| `--space-3xl` | 4rem | 64px |

## Componentes Base (CSS)

### Botones (`.btn`)

| Clase | Apariencia |
|-------|-----------|
| `.btn` | Base: transparente, borde |
| `.btn-primary` | Fondo lavender, texto oscuro |
| `.btn-secondary` | Fondo rose, texto oscuro |
| `.btn-ghost` | Solo borde, sin fondo |
| `.btn-full` | Width 100% |
| `.btn-lg` | Padding extra |
| `.btn:disabled` | Opacidad 50%, sin hover |

### Cards (`.card`)

- Fondo: `var(--bg-surface)`
- Border: `var(--border-thin)`
- Border-radius: `var(--radius-xl)` (24px)
- Padding: `var(--space-lg)` (24px)
- `.card-interactive` — Añade hover: translateY(-2px) + glow

### Inputs (`.input`)

- Background: `var(--bg-elevated)`
- Border: `var(--border-thin)`
- Focus: `border-color: var(--color-primary)` + `shadow-glow`
- Placeholder: `var(--text-muted)`

### Avatares (`.avatar`)

| Clase | Tamaño |
|-------|--------|
| `.avatar` | 40×40px |
| `.avatar-sm` | 32×32px |
| `.avatar-lg` | 56×56px |
| `.avatar-xl` | 80×80px |

- Fondo gradiente lavender→rose
- Texto centrado (inicial del nombre)
- Border-radius: full (circular)

### Badges (`.badge`)

| Clase | Apariencia |
|-------|-----------|
| `.badge` | Lavender background, texto oscuro |
| `.badge-ghost` | Solo borde, sin fondo |

### Empty States

- `.empty-state` — Contenedor centrado con icono y texto
- `.empty-state-emoji` — Emoji grande (3rem)
- `.empty-state-title` — Título de estado vacío
- `.empty-state-description` — Texto secundario

## Animaciones

### Keyframes Disponibles

| Nombre | Uso |
|--------|-----|
| `fadeIn` | Elementos que aparecen |
| `fadeInUp` | Elementos que sliden hacia arriba al aparecer |
| `fadeInDown` | Mensajes del quick chat |
| `slideInLeft` | Reveal de respuestas (player 1) |
| `slideInRight` | Reveal de respuestas (player 2) |
| `popIn` | Piezas del tablero, badges, unlocks |
| `shake` | Error feedback |
| `float` | Logo, emojis decorativos |
| `pulse` | Indicadores de turno, loading |
| `pulseGlow` | Línea ganadora en tic tac toe |
| `shimmer` | Loading placeholders |
| `sparkle` | Recompensas epic |

### Utility Classes

| Clase | Efecto |
|-------|--------|
| `.animate-fade-in` | `fadeIn 0.3s` |
| `.animate-fade-in-up` | `fadeInUp 0.4s` |
| `.animate-pop-in` | `popIn 0.3s` |
| `.animate-shake` | `shake 0.5s` |
| `.animate-float` | `float 3s infinite` |
| `.animate-spin` | `rotate 1s linear infinite` |
| `.stagger-children > *` | Delay progresivo (0.05s × nth-child) |

### La clase `.text-gradient`

Aplica un gradiente lavender → rose → lilac al texto:
```css
background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-lilac));
-webkit-background-clip: text;
color: transparent;
```

## Layout

| Token | Valor | Propósito |
|-------|-------|-----------|
| `--header-height` | 60px | Altura del header fijo |
| `--bottom-nav-height` | 64px | Altura de la barra de navegación inferior |
| `--max-width` | 480px | Ancho máximo del contenido (mobile-first) |
| `--safe-bottom` | `env(safe-area-inset-bottom)` | Safe area para iOS notch |

**Container:** `.container` aplica `max-width: var(--max-width)`, `margin: 0 auto`, `padding: 0 var(--space-base)`.

## Archivos CSS

| Archivo | Contenido |
|---------|-----------|
| `styles/variables.css` | Todos los design tokens |
| `styles/animations.css` | Keyframes + utility classes |
| `styles/index.css` | Reset, globals, body background |
| `styles/components.css` | Botones, cards, inputs, avatares, badges |

## Reglas de Uso

1. **Nunca hardcodear colores** — Siempre usar tokens (`var(--color-*)`)
2. **Nunca hardcodear spacing** — Siempre usar tokens (`var(--space-*)`)
3. **Nunca hardcodear fonts** — Siempre usar `var(--font-display)` o `var(--font-body)`
4. **Mobile-first** — El max-width de 480px centra todo para mobile
5. **Glassmorphism con moderación** — Solo en header, bottom-nav, modals y cards elevados
6. **Animaciones opcionales** — Respetar `prefers-reduced-motion`
