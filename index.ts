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
    const ast = this.parser.astify(sql);
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

  private handleSelect(ast: any) {
    const { columns } = ast;
    const tableName = ast.from[0].table.toString();

    const columnList = columns.map((col: any) => col.column).join(', ');

    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .select(columnList);

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

    const whereClause = this.buildWhereClause(where);

    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .update(updateData)
        .match(whereClause);

      if (error) {
        throw error;
      }

      return data;
    };
  }

  private handleDelete(ast: any) {
    const { table, where } = ast;
    const tableName = table[0].table.toString();
    const whereClause = this.buildWhereClause(where);

    return async () => {
      const { data, error } = await this.supabase
        .from(tableName)
        .delete()
        .match(whereClause);

      if (error) {
        throw error;
      }

      return data;
    };
  }

  private buildWhereClause(where: any) {
    return where.reduce((acc: any, condition: any) => {
      acc[condition.column] = condition.value.value;
      return acc;
    }, {});
  }
}
