import { createClient } from '@supabase/supabase-js';

/**
 * Initializes and returns a Supabase client.
 * @param {string} supabaseUrl - The Supabase URL.
 * @param {string} supabaseKey - The Supabase key.
 * @returns {SupabaseClient} - The initialized Supabase client.
 */
export function initializeSupabaseClient(supabaseUrl, supabaseKey) {
  return createClient(supabaseUrl, supabaseKey);
}
