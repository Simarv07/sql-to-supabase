# SQL to Supabase Converter

SQL to Supabase Converter is an npm package designed to automatically convert SQL queries into Supabase JavaScript queries.

## Progress

Currently support:
- [ ] SELECT
  - [x] Basic SELECT
  - [x] SELECT with WHERE Clause
    - [x] Equal to value
    - [x] Not equal to value
    - [x] Greater than or equal to a value
    - [x] Less than or equal to a value
  - [ ] SELECT with LIKE Clause
    - [ ] Matches a pattern
    - [ ] Case insensitive
  - [ ] SELECT with ORDER BY
  - [ ] SELECT with LIMIT and OFFSET
  - [ ] SELECT with GROUP BY
  - [ ] SELECT with HAVING Clause
  - [ ] SELECT DISTINCT
  - [ ] SELECT with Aliases
  - [ ] SELECT with Aggregation
  - [ ] SELECT with JOIN (Inner, Left, Right, Full)
  - [ ] SELECT with Subqueries
  - [ ] SELECT with UNION
- [x] INSERT
  - [x] Basic INSERT
  - [x] Multiple INSERT
- [ ] UPDATE
- [ ] DELETE
- [ ] DDL Queries

## Limitations
1. In INSERT statements, user must specify columns as library currently has no way of knowing schema beforehand. May add an option to allow library fetch schema from database or user input schema beforehand in the future.

## Installation
You can install SQL to Supabase via npm: `npm install sql-to-supabase`

## Example Usage
```
import { SupabaseService } from '../sql-to-supabase/index';
import { createClient  } from '@supabase/supabase-js';

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