-- ════════════════════════════════════════════════════
-- Tutti Frutti: Policy INSERT para crowd-sourced words
-- Ejecutar en Supabase SQL Editor
-- ════════════════════════════════════════════════════

-- Allow authenticated users to insert new words (crowd-sourced from voting)
DROP POLICY IF EXISTS "tf_words_insert" ON tutti_frutti_words;
CREATE POLICY "tf_words_insert" ON tutti_frutti_words 
  FOR INSERT TO authenticated WITH CHECK (true);
