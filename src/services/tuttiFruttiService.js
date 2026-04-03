import { supabase, isDemoMode } from './supabase';

let cachedWords = null;

/**
 * Load all valid words from Supabase, grouped by category and letter.
 * Caches the result so we only query once per session.
 * 
 * @returns {Object} { nombre: { A: ['ana', 'adriana', ...], ... }, ... }
 */
export async function loadValidWords() {
  if (cachedWords) return cachedWords;

  if (isDemoMode || !supabase) {
    cachedWords = {};
    return cachedWords;
  }

  try {
    const { data, error } = await supabase
      .from('tutti_frutti_words')
      .select('category, letter, word');

    if (error) throw error;

    // Group by category → letter → array of normalized words
    const grouped = {};
    for (const row of data || []) {
      if (!grouped[row.category]) grouped[row.category] = {};
      if (!grouped[row.category][row.letter]) grouped[row.category][row.letter] = [];
      grouped[row.category][row.letter].push(
        row.word.trim().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
      );
    }

    cachedWords = grouped;
    return cachedWords;
  } catch (err) {
    console.error('Failed to load Tutti Frutti words:', err);
    cachedWords = {};
    return cachedWords;
  }
}

/**
 * Check if a word is valid for the given category and letter.
 */
export function isWordValid(word, category, letter) {
  if (!cachedWords || !word) return false;
  const normalized = word.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const bank = cachedWords[category]?.[letter] || [];
  return bank.some((valid) => 
    normalized === valid || valid.startsWith(normalized) || normalized.startsWith(valid)
  );
}

/**
 * Add a new word to the database and update the local cache.
 * Called when both players agree a maybe_valid word is legit.
 */
export async function addWordToBank(category, letter, word) {
  // Normalize for cache
  const normalized = word.trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // Update local cache immediately
  if (cachedWords) {
    if (!cachedWords[category]) cachedWords[category] = {};
    if (!cachedWords[category][letter]) cachedWords[category][letter] = [];
    if (!cachedWords[category][letter].includes(normalized)) {
      cachedWords[category][letter].push(normalized);
    }
  }

  // Persist to DB
  if (isDemoMode || !supabase) return;

  try {
    await supabase
      .from('tutti_frutti_words')
      .upsert(
        { category, letter: letter.toUpperCase(), word: word.trim() },
        { onConflict: 'category,word' }
      );
  } catch (err) {
    console.error('Failed to add word to bank:', err);
  }
}

/**
 * Clear cache (useful on logout)
 */
export function clearWordsCache() {
  cachedWords = null;
}
