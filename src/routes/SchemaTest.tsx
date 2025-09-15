import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { discoverAllTables } from '../utils/schemaDiscovery'

const SchemaTest: React.FC = () => {
  const [schemaInfo, setSchemaInfo] = useState<any>(null)
  const [availableTables, setAvailableTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testSchema = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, discover all available tables
        const tablesResult = await discoverAllTables()
        if (tablesResult.tables.length > 0) {
          setAvailableTables(tablesResult.tables)
        }

        // Try to get a single record to see what fields exist
        const { data, error: queryError } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)

        if (queryError) {
          setError(`Query error: ${queryError.message}`)
          return
        }

        if (data && data.length > 0) {
          const sampleRecord = data[0]
          setSchemaInfo({
            fields: Object.keys(sampleRecord),
            sampleData: sampleRecord,
            fieldTypes: Object.entries(sampleRecord).map(([key, value]) => ({
              field: key,
              type: typeof value,
              value: value
            }))
          })
        } else {
          setSchemaInfo({
            fields: [],
            sampleData: null,
            message: 'No records found in profiles table'
          })
        }
      } catch (err: any) {
        setError(`Error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    testSchema()
  }, [])

  if (loading) {
    return <div>Loading schema information...</div>
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Database Schema Discovery</h2>
      
      {availableTables.length > 0 && (
        <div>
          <h3>Available Tables ({availableTables.length}):</h3>
          <ul>
            {availableTables.map((table) => (
              <li key={table} style={{ margin: '5px 0' }}>
                <strong>{table}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <h3>Profiles Table Schema</h3>
      {schemaInfo?.message && (
        <p style={{ color: 'orange' }}>{schemaInfo.message}</p>
      )}

      {schemaInfo?.fields && (
        <div>
          <h3>Available Fields ({schemaInfo.fields.length}):</h3>
          <ul>
            {schemaInfo.fields.map((field: string) => (
              <li key={field} style={{ margin: '5px 0' }}>
                <strong>{field}</strong>
              </li>
            ))}
          </ul>

          <h3>Field Types and Sample Values:</h3>
          <table style={{ border: '1px solid #ccc', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Field</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Type</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Sample Value</th>
              </tr>
            </thead>
            <tbody>
              {schemaInfo.fieldTypes?.map((fieldInfo: any) => (
                <tr key={fieldInfo.field}>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{fieldInfo.field}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>{fieldInfo.type}</td>
                  <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                    {fieldInfo.value !== null ? JSON.stringify(fieldInfo.value) : 'null'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Raw Sample Data:</h3>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
            {JSON.stringify(schemaInfo.sampleData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default SchemaTest
