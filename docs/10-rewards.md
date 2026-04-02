# 🏆 Módulo: Recompensas y Progresión

## Responsabilidad

Gestionar el sistema de puntos, recompensas desbloqueables y progresión de las jugadoras, incentivando el juego continuo con rewards tangibles.

## Filosofía de Diseño

> Las recompensas deben sentirse **alcanzables y emocionantes**. Cada partida debe sentirse como progreso hacia algo.

**Principios:**
- Siempre ganar algo (incluso al perder = 1-5 pts)
- Rewards variados en costo (algo para cada nivel de jugadora)
- Desbloqueo con animación satisfactoria
- No hay compras con dinero real (solo puntos ganados jugando)

## Sistema de Puntos

### Fuentes de Puntos

| Acción | Puntos |
|--------|--------|
| Ganar Tic Tac Toe | +10 |
| Empatar Tic Tac Toe | +3 |
| Perder Tic Tac Toe | +1 |
| Ganar Tutti Frutti | +25 |
| Empatar Tutti Frutti | +10 |
| Perder Tutti Frutti | +5 |
| Ganar Riddle Battle | +20 |
| Empatar Riddle Battle | +8 |
| Perder Riddle Battle | +3 |

### Función SQL para sumar puntos

```sql
CREATE OR REPLACE FUNCTION add_points(p_user_id UUID, p_points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = points + p_points
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**SECURITY DEFINER:** La función se ejecuta con permisos del creador, no del usuario. Esto previene que alguien se asigne puntos manualmente via la API.

## Modelo de Datos

### Tabla: `rewards`

```sql
rewards
├── id          UUID PK
├── name        TEXT ('Corona Dorada', 'Badge Gamer', etc.)
├── description TEXT
├── type        TEXT ('avatar' | 'badge' | 'title')
├── asset_id    TEXT (identifier para renderizar la reward)
├── cost_points INTEGER (cuántos puntos para desbloquear)
├── rarity      TEXT ('common' | 'rare' | 'epic')
├── is_active   BOOLEAN
└── created_at  TIMESTAMPTZ
```

### Tabla: `user_rewards`

```sql
user_rewards
├── id          UUID PK
├── user_id     UUID FK → profiles.id
├── reward_id   UUID FK → rewards.id
├── unlocked_at TIMESTAMPTZ
└── UNIQUE (user_id, reward_id)  -- no duplicar desbloqueos
```

## Catálogo Inicial de Rewards

### Avatares (type: 'avatar')

| Nombre | Costo | Rareza | asset_id |
|--------|-------|--------|----------|
| Gatita Estrella | 50 pts | Common | `avatar_cat_star` |
| Unicornio Arcoíris | 100 pts | Common | `avatar_unicorn` |
| Sirena Mágica | 200 pts | Rare | `avatar_mermaid` |
| Astronauta Cool | 300 pts | Rare | `avatar_astronaut` |
| Dragona de Cristal | 500 pts | Epic | `avatar_crystal_dragon` |
| Princesa Gamer | 750 pts | Epic | `avatar_gamer_princess` |

### Badges (type: 'badge')

| Nombre | Costo | Condición |
|--------|-------|-----------|
| Primera Victoria | 0 pts | Ganar 1 partida (auto-otorgada) |
| Racha de 5 | 0 pts | Ganar 5 partidas seguidas (auto) |
| Maestra del Rayo | 0 pts | Ganar Tic Tac Toe en 5 movimientos (auto) |
| Amiga Popular | 0 pts | Tener 10 amigas (auto) |
| Cerebrito | 0 pts | Ganar 10 Riddle Battles (auto) |

### Títulos (type: 'title')

| Nombre | Costo | Ejemplo de uso |
|--------|-------|---------------|
| "Estrella" | 100 pts | "Sofía ⭐ Estrella" |
| "Campeona" | 250 pts | "Ana 🏆 Campeona" |
| "Leyenda" | 500 pts | "Luna 🌟 Leyenda" |

## Flujo: Desbloquear Reward

```
1. Jugadora navega a la "Tienda de Recompensas" (ProfilePage o RewardsPage)
2. Ve rewards disponibles, separadas por rareza
3. Las que puede pagar muestran botón "Desbloquear 🔓"
4. Las que no puede pagar muestran precio en gris
5. Click en "Desbloquear":
   a. Verificar que tiene suficientes puntos
   b. Verificar que no la ha desbloqueado antes
   c. INSERT INTO user_rewards (user_id, reward_id)
   d. UPDATE profiles SET points = points - cost_points
   e. Animación de desbloqueo (reward bounces in + sparkles ✨)
   f. Toast: "¡Desbloqueaste: Unicornio Arcoíris! 🦄"
6. Si es un avatar → opción de equiparlo inmediatamente
```

## RLS

```sql
-- Rewards: cualquier usuario autenticado puede ver el catálogo
SELECT rewards → authenticated, USING (is_active = true)

-- User Rewards: solo ver las mías
SELECT user_rewards → USING (user_id = auth.uid())

-- Desbloquear: solo para mí
INSERT user_rewards → WITH CHECK (user_id = auth.uid())
```

## Colores por Rareza

| Rareza | Color | Glow |
|--------|-------|------|
| Common | `var(--color-accent)` (verde mint) | Subtle |
| Rare | `var(--color-primary)` (lavender) | Medium |
| Epic | `var(--color-secondary)` (rose) | Strong + sparkles |

## Archivos Relacionados

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `constants/rewardsCatalog.js` | Catálogo completo: 6 avatares, 4 badges, 3 títulos, helpers | ✅ |
| `stores/rewardStore.js` | fetchRewards, isUnlocked, unlockReward (con deducción de pts) | ✅ |
| `stores/profileStore.js` | addLocalPoints(), incrementGamesPlayed/Won | ✅ |
| `pages/Rewards/RewardsPage.jsx` | Tienda con tabs (Avatares/Badges/Títulos), modal, celebration | ✅ |
| `pages/Rewards/Rewards.css` | Cards con rarity glow, confirm modal, sparkle celebration | ✅ |
| `pages/Profile/ProfilePage.jsx` | Sección "Mis Recompensas" + link a tienda | ✅ |
| `constants/routes.js` | ROUTES.REWARDS = '/rewards' | ✅ |

## Futuras Mejoras

- [x] Página dedicada de Tienda de Recompensas con filtros por tipo/rareza
- [ ] Badges auto-otorgadas por logros (achievements system)
- [ ] "Daily Login Bonus" (+5 pts por entrar cada día)
- [ ] Racha de victorias con multiplicador de puntos
- [ ] Seasonal rewards (rewards de temporada limitadas)
- [ ] Trading de rewards entre amigas
- [ ] Animaciones de avatar en el perfil
