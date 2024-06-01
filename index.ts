import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Parser } from 'node-sql-parser';

export class SupabaseService {
  private supabase: SupabaseClient;
  private parser: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and key are required.');
    }
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.parser = new Parser();
  }

  /**
   * Converts a SQL query to a Supabase JavaScript function.
   * @param {string} sql - The SQL query to convert.
   * @returns {Function} - The Supabase JavaScript function.
   */
  sqlToSupabase(sql: string) {
    let ast: any;
    // try {
      ast = this.parser.astify(sql);
    // } catch() {
    //   throw new Error('Invalid SQL query. Please check your syntax.');
    // }

    const type = ast.type.toUpperCase();

    console.log('SQL:', sql)
    console.log('AST:', ast);

    switch (type) {
      case 'SELECT':
        return this.handleSelect(ast);
      case 'INSERT':
        return this.handleInsert(ast);
      case 'UPDATE':
        return this.handleUpdate(ast);
      case 'DELETE':
        return this.handleDelete(ast);
      default:
        throw new Error(`Unsupported SQL type: ${type}`);
    }
  }

  /**
   * Handles SELECT queries.
   * @param ast - The abstract syntax tree of the SQL query.
   * @returns - The Supabase JavaScript function.
   */
  private handleSelect(ast: any) {
    const { columns } = ast;
    const tableName = ast.from[0].table.toString();

    const columnList = columns.map((col: any) => col.expr.column).join(', ');

    const whereClause = this.buildWhereClause(ast.where);

    return async () => {
      const query = this.supabase
        .from(tableName)
        .select(columnList);
    
      // Add where clause if it exists
      const { data, error } = whereClause !== '' 
        ? await query.or(whereClause)
        : await query;
    
      if (error) {
        throw error;
      }
    
      return data;
    };
  }

  private handleInsert(ast: any) {
    const { table, values } = ast;
    const tableName = table[0].table.toString();

    const rowData = values.map(
      (row: any) => row.value.map(
        (value: any) => value.value
      )
    )

    const columns = ast.columns
    const result: [{ [key: string]: any }] = [{}];

    if (columns === null){
      throw new Error('Must specify columns in insert statement. Library does not support insert without column names.');
    }

    // Convert the data to an object with column names as keys
    for (let k = 0; k < rowData.length; k++) {
      const row = rowData[k];
      result[k] = {};
      for (let i = 0; i < columns.length; i++) {
        result[k][columns[i]] = row[i];
      }
    }
   
    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .insert(result);

      if (error) {
        throw error;
      }

      console.log(`Data inserted into ${tableName}:`, result);

      return data;
    };
  }

  private handleUpdate(ast: any) {
    const { table, set, where } = ast;
    const tableName = table[0].table.toString();
    const updateData = set.reduce((acc: any, item: any) => {
      acc[item.column] = item.value.value;
      return acc;
    }, {});

    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .update(updateData)

      if (error) {
        throw error;
      }

      return data;
    };
  }

  private handleDelete(ast: any) {
    const { table, where } = ast;
    const tableName = table[0].table.toString();

    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .delete()

      if (error) {
        throw error;
      }

      return data;
    };
  }

  private buildWhereClause(where: any): string {
    if (where === '' || where === null) {
      return '';
    }
    const buildCondition = (condition: any): string => {
      const { operator, left, right } = condition;
      const column = left.column;
      const value = right.value;
  
      switch (operator) {
        case '=':
          return `${column}.eq.${value}`;
        case '!=':
          return `${column}.neq.${value}`;
        case '>':
          return `${column}.gt.${value}`;
        case '>=':
          return `${column}.gte.${value}`;
        case '<':
          return `${column}.lt.${value}`;
        case '<=':
          return `${column}.lte.${value}`;
        case 'LIKE':
          return `${column}.like.${value}`;
        default:
          throw new Error(`Unsupported operator: ${operator}`);
      }
    };
  
    const buildClause = (node: any): string => {
      if (node.type === 'binary_expr') {
        if (node.operator === 'OR' || node.operator === 'AND') {
          const leftClause = buildClause(node.left);
          const rightClause = buildClause(node.right);

          if (node.operator === 'OR')
            return `${leftClause},${rightClause}`;
          else
            return `and(${leftClause},${rightClause})`;

        } else {
          return buildCondition(node);
        }
      } else {
        throw new Error(`Unsupported AST node type: ${node.type}`);
      }
    };
  
    return buildClause(where).replace(/^\((.*)\)$/, '$1');
  }
}
