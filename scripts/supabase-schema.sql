-- ============================================
-- Sophi's Playground — Supabase Schema v1.0
-- ============================================
-- Safe to re-run: uses IF NOT EXISTS everywhere

-- ────────────────────────────────────────────
-- 1. UTILITY FUNCTIONS
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_friend_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE friend_code = code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────
-- 2. PROFILES TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Jugadora',
  avatar_id TEXT DEFAULT 'avatar_01',
  title_id TEXT DEFAULT NULL,
  points INTEGER DEFAULT 0 CHECK (points >= 0),
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  friend_code TEXT UNIQUE DEFAULT generate_friend_code(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', 'Jugadora'),
    'player_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ────────────────────────────────────────────
-- 3. FRIENDSHIPS TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (requester_id, addressee_id)
);

DROP TRIGGER IF EXISTS friendships_updated_at ON friendships;
CREATE TRIGGER friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_friendships_requester ON friendships(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_friendships_addressee ON friendships(addressee_id, status);

-- ────────────────────────────────────────────
-- 4. GAME SESSIONS TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type TEXT NOT NULL CHECK (game_type IN ('tic-tac-toe', 'tutti-frutti', 'riddle-battle')),
  player1_id UUID NOT NULL REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  winner_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished', 'abandoned')),
  game_state JSONB DEFAULT '{}',
  scores JSONB DEFAULT '{"player1": 0, "player2": 0}',
  created_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_players ON game_sessions(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status) WHERE status IN ('waiting', 'playing');

-- ────────────────────────────────────────────
-- 5. GAME INVITATIONS TABLE
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS game_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '2 minutes')
);

CREATE INDEX IF NOT EXISTS idx_invitations_receiver ON game_invitations(receiver_id, status) WHERE status = 'pending';

-- ────────────────────────────────────────────
-- 6. RIDDLE CATEGORIES + RIDDLES
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS riddle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  emoji TEXT DEFAULT '🧩',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS riddles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES riddle_categories(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  hint TEXT,
  difficulty INTEGER DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_riddles_category ON riddles(category_id, difficulty) WHERE is_active = true;

CREATE OR REPLACE FUNCTION get_random_riddles(
  p_count INTEGER DEFAULT 5,
  p_difficulty INTEGER DEFAULT NULL
)
RETURNS SETOF riddles AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM riddles
  WHERE is_active = true
    AND (p_difficulty IS NULL OR difficulty = p_difficulty)
  ORDER BY random()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────
-- 7. REWARDS + USER REWARDS
-- ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rewards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('avatar', 'badge', 'title')),
  emoji TEXT DEFAULT '🎁',
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  cost_points INTEGER DEFAULT 0 CHECK (cost_points >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL REFERENCES rewards(id),
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, reward_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user ON user_rewards(user_id);

-- ────────────────────────────────────────────
-- 8. SECURE POINTS FUNCTION
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = GREATEST(0, points + p_points)
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY
-- ────────────────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddles ENABLE ROW LEVEL SECURITY;
ALTER TABLE riddle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe to re-run)
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "friendships_select" ON friendships;
DROP POLICY IF EXISTS "friendships_insert" ON friendships;
DROP POLICY IF EXISTS "friendships_update" ON friendships;
DROP POLICY IF EXISTS "friendships_delete" ON friendships;
DROP POLICY IF EXISTS "sessions_select" ON game_sessions;
DROP POLICY IF EXISTS "sessions_insert" ON game_sessions;
DROP POLICY IF EXISTS "sessions_update" ON game_sessions;
DROP POLICY IF EXISTS "invitations_select" ON game_invitations;
DROP POLICY IF EXISTS "invitations_insert" ON game_invitations;
DROP POLICY IF EXISTS "invitations_update" ON game_invitations;
DROP POLICY IF EXISTS "riddles_select" ON riddles;
DROP POLICY IF EXISTS "categories_select" ON riddle_categories;
DROP POLICY IF EXISTS "rewards_select" ON rewards;
DROP POLICY IF EXISTS "user_rewards_select" ON user_rewards;
DROP POLICY IF EXISTS "user_rewards_insert" ON user_rewards;

-- PROFILES
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- FRIENDSHIPS
CREATE POLICY "friendships_select" ON friendships FOR SELECT TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());
CREATE POLICY "friendships_insert" ON friendships FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE POLICY "friendships_update" ON friendships FOR UPDATE TO authenticated
  USING (addressee_id = auth.uid());
CREATE POLICY "friendships_delete" ON friendships FOR DELETE TO authenticated
  USING (requester_id = auth.uid() OR addressee_id = auth.uid());

-- GAME SESSIONS
CREATE POLICY "sessions_select" ON game_sessions FOR SELECT TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());
CREATE POLICY "sessions_insert" ON game_sessions FOR INSERT TO authenticated
  WITH CHECK (player1_id = auth.uid());
CREATE POLICY "sessions_update" ON game_sessions FOR UPDATE TO authenticated
  USING (player1_id = auth.uid() OR player2_id = auth.uid());

-- GAME INVITATIONS
CREATE POLICY "invitations_select" ON game_invitations FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "invitations_insert" ON game_invitations FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());
CREATE POLICY "invitations_update" ON game_invitations FOR UPDATE TO authenticated
  USING (receiver_id = auth.uid());

-- RIDDLES & CATEGORIES
CREATE POLICY "riddles_select" ON riddles FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "categories_select" ON riddle_categories FOR SELECT TO authenticated USING (true);

-- REWARDS
CREATE POLICY "rewards_select" ON rewards FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "user_rewards_select" ON user_rewards FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_rewards_insert" ON user_rewards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
