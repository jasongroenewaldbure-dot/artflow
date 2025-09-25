import { supabase } from '../lib/supabase'

export interface SchemaField {
  field: string
  type: string
  value: any
}

export interface SchemaInfo {
  fields: string[]
  fieldTypes: SchemaField[]
  sampleData: any
  error?: string
}

export async function discoverProfilesSchema(): Promise<SchemaInfo> {
  try {
    // Try to get a single record to see what fields exist
    const { data, error: queryError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (queryError) {
      return {
        fields: [],
        fieldTypes: [],
        sampleData: null,
        error: `Query error: ${queryError.message}`
      }
    }

    if (!data || data.length === 0) {
      return {
        fields: [],
        fieldTypes: [],
        sampleData: null,
        error: 'No records found in profiles table'
      }
    }

    const sampleRecord = data[0]
    const fields = Object.keys(sampleRecord)
    const fieldTypes = Object.entries(sampleRecord).map(([key, value]) => ({
      field: key,
      type: typeof value,
      value: value
    }))

    return {
      fields,
      fieldTypes,
      sampleData: sampleRecord
    }
  } catch (err: any) {
    return {
      fields: [],
      fieldTypes: [],
      sampleData: null,
      error: `Error: ${err.message}`
    }
  }
}

export async function testBasicQuery(): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Try the most basic query possible
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function discoverAllTables(): Promise<{ tables: string[]; error?: string }> {
  try {
    // Try to query different possible table names
    const possibleTables = ['profiles', 'users', 'user_profiles', 'auth_profiles']
    const results: { table: string; success: boolean; error?: string }[] = []

    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        results.push({
          table: tableName,
          success: !error,
          error: error?.message
        })
      } catch (err: any) {
        results.push({
          table: tableName,
          success: false,
          error: err.message
        })
      }
    }

    const successfulTables = results.filter(r => r.success).map(r => r.table)
    
    return {
      tables: successfulTables,
      error: successfulTables.length === 0 ? 'No accessible tables found' : undefined
    }
  } catch (err: any) {
    return {
      tables: [],
      error: err.message
    }
  }
}