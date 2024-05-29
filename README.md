# SQL to Supabase Converter

SQL to Supabase Converter is an npm package designed to simplify the process of converting SQL queries into Supabase JavaScript queries.

## Progress

Currently support SELECT statements only. Will be adding more functionality in future updates.

## Installation
You can install SQL to Supabase via npm: `npm install sql-to-supabase`

## Example Usage

```
import { SupabaseService } from '../sql-to-supabase/index';
import { createClient, SupabaseClient  } from '@supabase/supabase-js';

(async () => {
  // Initialize Supabase service
  const supabaseService = new SupabaseService('url', 'key');
  
  // Convert SQL to Supabase function
  const query = supabaseService.sqlToSupabase('SELECT *, name FROM users');

  try {
    // Fetch users
    const data = await query();

  } catch (error) {
    console.error('Error fetching users:', error);
  }
})();
```