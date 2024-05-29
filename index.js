import { initializeSupabaseClient } from './supabaseClient';

let supabase = null;

/**
 * Initializes the Supabase client with the provided URL and key.
 * @param {string} supabaseUrl - The Supabase URL.
 * @param {string} supabaseKey - The Supabase key.
 */
export function initializeSupabase(supabaseUrl, supabaseKey) {
  supabase = initializeSupabaseClient(supabaseUrl, supabaseKey);
}

/**
 * Converts a SQL query to a Supabase JavaScript function.
 * @param {string} sql - The SQL query to convert.
 * @returns {Function} - The Supabase JavaScript function.
 */
export function sqlToSupabase(sql) {
  if (!supabase) {
    throw new Error('Supabase client has not been initialized. Call initializeSupabase first.');
  }

  // Parse the SQL query (basic example for SELECT statements)
  const match = sql.match(/SELECT (.+) FROM (\w+)/i);
  if (!match) {
    throw new Error('Only simple SELECT queries are supported.');
  }
  
  const [, columns, table] = match;

  return async function fetchData() {
    const { data, error } = await supabase
      .from(table)
      .select(columns);

    if (error) {
      throw error;
    }
    
    return data;
  };
}

// Example usage:
// (async () => {
//   initializeSupabase('https://your-supabase-url.supabase.co', 'your-anon-key');
//   const fetchUsers = sqlToSupabase('SELECT id, name FROM users');
//   try {
//     const users = await fetchUsers();
//     console.log(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//   }
// })();
