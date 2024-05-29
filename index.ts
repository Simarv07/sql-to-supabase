import { createClient, SupabaseClient  } from '@supabase/supabase-js';

export class SupabaseService {
  private supabase: SupabaseClient

  /**
   * Initializes the Supabase client.
   * @param {string} supabaseUrl - The Supabase URL.
   * @param {string} supabaseKey - The Supabase key.
   */
  constructor(supabaseUrl: string, supabaseKey: string) {
    if (supabaseUrl === null || supabaseKey === null || supabaseKey === undefined || supabaseKey === undefined) {
      throw new Error('Supabase URL and key are required.');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }


  /**
   * Converts a SQL query to a Supabase JavaScript function.
   * @param {string} sql - The SQL query to convert.
   * @returns {Function} - The Supabase JavaScript function.
   */
  sqlToSupabase(sql: string) {
    // Parse the SQL query (basic example for SELECT statements)
    const match = sql.match(/SELECT (.+) FROM (\w+)/i);
    if (!match) {
      throw new Error('Only simple SELECT queries are supported.');
    }

    const [, columns, table] = match;

    return async () => {
      const { data, error } = await this.supabase
        .from(table)
        .select(columns);

      if (error) {
        throw error;
      }

      return data;
    };
  }
}

