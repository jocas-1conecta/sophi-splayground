# 💬 Módulo: Quick Chat (Chat Seguro)

## Responsabilidad

Proporcionar un sistema de comunicación **seguro para menores** dentro de las partidas, usando exclusivamente frases predefinidas y emojis. **Sin texto libre.**

## Principio Kids Safe

> **Regla cardinal:** Una jugadora NUNCA puede escribir texto libre que otra jugadora vea. Toda comunicación pasa por un catálogo cerrado de frases aprobadas.

Esto elimina los riesgos de:
- Acoso (bullying)
- Contenido inapropiado
- Solicitud de datos personales
- Contacto con desconocidos

## Catálogo de Frases

### Frases Actuales (12)

| ID | Texto | Emoji | Categoría |
|----|-------|-------|-----------|
| 1 | ¡Buen juego! | ✨ | Positiva |
| 2 | ¡Bien hecho! | 👏 | Positiva |
| 3 | ¡Eres increíble! | 🌟 | Positiva |
| 4 | ¡Qué divertido! | 🎉 | Positiva |
| 5 | ¡Wow! | 😮 | Reacción |
| 6 | Jajaja | 😂 | Reacción |
| 7 | ¡Ay no! | 😱 | Reacción |
| 8 | Hmm... | 🤔 | Reacción |
| 9 | ¡Hola! | 👋 | Social |
| 10 | ¡Otra vez! | 🔄 | Social |
| 11 | Tengo que irme | 🫶 | Social |
| 12 | ¡Buena suerte! | 🍀 | Social |

### Diseño de Frases

**Criterios de inclusión:**
- ✅ Positiva o neutral (nunca negativa)
- ✅ Apropiada para todas las edades
- ✅ No puede usarse para ofender en ningún contexto
- ✅ Útil en el contexto de juego

**Criterios de exclusión:**
- ❌ Nada que pueda interpretarse como insulto
- ❌ Nada que solicite información personal
- ❌ Nada que sugiera comunicación fuera de la plataforma
- ❌ Nada con connotación negativa hacia la oponente

## Implementación Técnica

### Enviar Mensaje

```javascript
// El componente envía solo el ID de la frase, no el texto
broadcast({
  type: 'quick_chat',
  phrase_id: 3,           // "¡Eres increíble! 🌟"
  player_id: myUserId,
});
```

### Recibir Mensaje

```javascript
// El receptor busca la frase por ID en su propio catálogo local
const phrase = QUICK_CHAT_PHRASES.find(p => p.id === message.phrase_id);
// Mostrar: "Sofía: ¡Eres increíble! 🌟" con animación
```

**Seguridad:** El texto nunca viaja por la red. Solo viaja el `phrase_id` (número). El texto se resuelve localmente desde `constants/quickChatPhrases.js`.

### UI Component

```
┌─────────────────────────────────────────┐
│ 🎮 Partida en curso                     │
│                                          │
│  [tablero del juego]                     │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ Sofía: ¡Buen juego! ✨  (fadeOut)  │   │
│ └────────────────────────────────────┘   │
│                                          │
│ ┌─ Quick Chat (barra desplegable) ───┐   │
│ │ ✨ 👏 🌟 🎉 😮 😂 😱 🤔 👋 🔄 🫶 🍀 │  │
│ └────────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Interacción:**
1. Jugadora toca el ícono de chat → barra se expande con los emojis
2. Toca un emoji → se envía la frase asociada via broadcast
3. La frase aparece como "notificación flotante" sobre el juego (3 segundos)
4. Rate limit: máximo 1 mensaje cada 2 segundos (anti-spam)

### Animación del Mensaje Recibido

```css
/* Aparece arriba del juego, se desvanece */
.quick-chat-bubble {
  animation: fadeInDown 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
}
```

## Anti-Spam

- **Cooldown:** 2 segundos entre mensajes
- **Máximo en buffer:** 20 mensajes (los más viejos se descartan)
- **Solo durante partida:** No se puede chatear fuera de una sala de juego

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `constants/quickChatPhrases.js` | Catálogo de 12 frases (4 positivas, 4 reacciones, 4 sociales) | ✅ |
| `stores/gameStore.js` | `quickChatMessages[]`, `addQuickChatMessage()` | ✅ |
| `components/game/QuickChat.jsx` | FAB toggle, grid picker (2 columnas), bubble popup (3s) | ✅ |
| `components/game/QuickChat.css` | Floating button, glassmorphism picker, pop-in animation | ✅ |
| `hooks/useQuickChat.js` | Enviar/recibir via Supabase broadcast | ⬜ Fase 4 |

## Futuras Mejoras

- [ ] Más frases (organizar por categorías con tabs)
- [ ] Stickers animados (GIFs predefinidos)
- [ ] Reacciones "emoji burst" (lluvia de emojis al ganar)
- [ ] Sonido opcional al recibir mensaje
- [ ] Frases desbloqueables con puntos (reward system)
