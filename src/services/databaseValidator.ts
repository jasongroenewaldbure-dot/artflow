import { supabase } from '../lib/supabase'

export interface ValidationResult {
  table: string
  field: string
  issue: string
  severity: 'ERROR' | 'WARNING' | 'INFO'
  details: any
}

export interface DatabaseValidationReport {
  isValid: boolean
  totalIssues: number
  errors: number
  warnings: number
  info: number
  results: ValidationResult[]
  recommendations: string[]
}

class DatabaseValidatorService {
  /**
   * Run comprehensive database validation
   */
  async validateDatabase(): Promise<DatabaseValidationReport> {
    console.log('🔍 Starting Database Validation...')
    
    const results: ValidationResult[] = []
    
    // Validate each table
    await this.validateProfilesTable(results)
    await this.validateArtworksTable(results)
    await this.validateCataloguesTable(results)
    await this.validateContactsTable(results)
    await this.validateForeignKeys(results)
    await this.validateIndexes(results)
    await this.validateConstraints(results)
    
    const errors = results.filter(r => r.severity === 'ERROR').length
    const warnings = results.filter(r => r.severity === 'WARNING').length
    const info = results.filter(r => r.severity === 'INFO').length
    
    const recommendations = this.generateRecommendations(results)
    
    const report: DatabaseValidationReport = {
      isValid: errors === 0,
      totalIssues: results.length,
      errors,
      warnings,
      info,
      results,
      recommendations
    }
    
    this.printReport(report)
    return report
  }

  /**
   * Validate profiles table
   */
  private async validateProfilesTable(results: ValidationResult[]): Promise<void> {
    try {
      // Check table structure
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (error) {
        results.push({
          table: 'profiles',
          field: 'table',
          issue: 'Table access failed',
          severity: 'ERROR',
          details: error
        })
        return
      }

      // Check required fields
      const requiredFields = ['id', 'role', 'created_at']
      const sampleProfile = data?.[0]
      
      if (sampleProfile) {
        for (const field of requiredFields) {
          if (!(field in sampleProfile)) {
            results.push({
              table: 'profiles',
              field,
              issue: 'Required field missing',
              severity: 'ERROR',
              details: { expected: field, found: Object.keys(sampleProfile) }
            })
          }
        }
      }

      // Check role values
      const { data: roleData, error: roleError } = await supabase
        .from('profiles')
        .select('role')
        .not('role', 'is', null)

      if (!roleError && roleData) {
        const validRoles = ['artist', 'collector', 'both']
        const invalidRoles = roleData
          .map(r => r.role)
          .filter(role => !validRoles.includes(role))
          .filter((role, index, arr) => arr.indexOf(role) === index) // Remove duplicates

        if (invalidRoles.length > 0) {
          results.push({
            table: 'profiles',
            field: 'role',
            issue: 'Invalid role values found',
            severity: 'ERROR',
            details: { invalidRoles, validRoles }
          })
        }
      }

      // Note: Email is not stored in profiles table, only in auth.users

    } catch (error: any) {
      results.push({
        table: 'profiles',
        field: 'validation',
        issue: 'Validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate artworks table
   */
  private async validateArtworksTable(results: ValidationResult[]): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .limit(1)

      if (error) {
        results.push({
          table: 'artworks',
          field: 'table',
          issue: 'Table access failed',
          severity: 'ERROR',
          details: error
        })
        return
      }

      // Check required fields
      const requiredFields = ['id', 'userId', 'title', 'createdAt']
      const sampleArtwork = data?.[0]
      
      if (sampleArtwork) {
        for (const field of requiredFields) {
          if (!(field in sampleArtwork)) {
            results.push({
              table: 'artworks',
              field,
              issue: 'Required field missing',
              severity: 'ERROR',
              details: { expected: field, found: Object.keys(sampleArtwork) }
            })
          }
        }
      }

      // Check price format
      const { data: priceData, error: priceError } = await supabase
        .from('artworks')
        .select('price')
        .not('price', 'is', null)

      if (!priceError && priceData) {
        const invalidPrices = priceData
          .map(r => r.price)
          .filter(price => isNaN(Number(price)) || Number(price) < 0)
          .filter((price, index, arr) => arr.indexOf(price) === index)

        if (invalidPrices.length > 0) {
          results.push({
            table: 'artworks',
            field: 'price',
            issue: 'Invalid price values found',
            severity: 'WARNING',
            details: { invalidPrices: invalidPrices.slice(0, 10) }
          })
        }
      }

    } catch (error: any) {
      results.push({
        table: 'artworks',
        field: 'validation',
        issue: 'Validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate catalogues table
   */
  private async validateCataloguesTable(results: ValidationResult[]): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('catalogues')
        .select('*')
        .limit(1)

      if (error) {
        results.push({
          table: 'catalogues',
          field: 'table',
          issue: 'Table access failed',
          severity: 'ERROR',
          details: error
        })
        return
      }

      // Check required fields
      const requiredFields = ['id', 'userId', 'title', 'createdAt']
      const sampleCatalogue = data?.[0]
      
      if (sampleCatalogue) {
        for (const field of requiredFields) {
          if (!(field in sampleCatalogue)) {
            results.push({
              table: 'catalogues',
              field,
              issue: 'Required field missing',
              severity: 'ERROR',
              details: { expected: field, found: Object.keys(sampleCatalogue) }
            })
          }
        }
      }

    } catch (error: any) {
      results.push({
        table: 'catalogues',
        field: 'validation',
        issue: 'Validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate contacts table
   */
  private async validateContactsTable(results: ValidationResult[]): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .limit(1)

      if (error) {
        results.push({
          table: 'contacts',
          field: 'table',
          issue: 'Table access failed',
          severity: 'ERROR',
          details: error
        })
        return
      }

      // Check purchase intent score range
      const { data: scoreData, error: scoreError } = await supabase
        .from('contacts')
        .select('purchase_intent_score')
        .not('purchase_intent_score', 'is', null)

      if (!scoreError && scoreData) {
        const invalidScores = scoreData
          .map(r => r.purchase_intent_score)
          .filter(score => score < 0 || score > 1)
          .filter((score, index, arr) => arr.indexOf(score) === index)

        if (invalidScores.length > 0) {
          results.push({
            table: 'contacts',
            field: 'purchase_intent_score',
            issue: 'Invalid purchase intent score values',
            severity: 'WARNING',
            details: { invalidScores: invalidScores.slice(0, 10) }
          })
        }
      }

    } catch (error: any) {
      results.push({
        table: 'contacts',
        field: 'validation',
        issue: 'Validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate foreign key relationships
   */
  private async validateForeignKeys(results: ValidationResult[]): Promise<void> {
    try {
      // Check artworks -> profiles relationship
      const { data: orphanedArtworks, error: artworksError } = await supabase
        .from('artworks')
        .select('id, userId')
        .not('userId', 'in', 
          supabase
            .from('profiles')
            .select('id')
        )

      if (!artworksError && orphanedArtworks && orphanedArtworks.length > 0) {
        results.push({
          table: 'artworks',
          field: 'userId',
          issue: 'Orphaned records found',
          severity: 'ERROR',
          details: { count: orphanedArtworks.length, sample: orphanedArtworks.slice(0, 5) }
        })
      }

      // Check catalogues -> profiles relationship
      const { data: orphanedCatalogues, error: cataloguesError } = await supabase
        .from('catalogues')
        .select('id, userId')
        .not('userId', 'in',
          supabase
            .from('profiles')
            .select('id')
        )

      if (!cataloguesError && orphanedCatalogues && orphanedCatalogues.length > 0) {
        results.push({
          table: 'catalogues',
          field: 'userId',
          issue: 'Orphaned records found',
          severity: 'ERROR',
          details: { count: orphanedCatalogues.length, sample: orphanedCatalogues.slice(0, 5) }
        })
      }

    } catch (error: any) {
      results.push({
        table: 'foreign_keys',
        field: 'validation',
        issue: 'Foreign key validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate database indexes
   */
  private async validateIndexes(results: ValidationResult[]): Promise<void> {
    try {
      // Test id index performance
      const startTime = Date.now()
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', 'test-id')
        .single()
      
      const queryTime = Date.now() - startTime

      if (queryTime > 1000) {
        results.push({
          table: 'profiles',
          field: 'id',
          issue: 'Id index performance poor',
          severity: 'WARNING',
          details: { queryTime, threshold: 1000 }
        })
      }

    } catch (error: any) {
      results.push({
        table: 'indexes',
        field: 'validation',
        issue: 'Index validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Validate database constraints
   */
  private async validateConstraints(results: ValidationResult[]): Promise<void> {
    try {
      // Test unique id constraint
      const testId = `constraint-test-${Date.now()}`
      
      // Create test profile
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: testId,
          name: 'Test User',
          role: 'COLLECTOR'
        })

      if (createError) {
        results.push({
          table: 'profiles',
          field: 'id',
          issue: 'Failed to create test profile for constraint validation',
          severity: 'ERROR',
          details: createError
        })
        return
      }

      // Try to create duplicate
      const { error: duplicateError } = await supabase
        .from('profiles')
        .insert({
          id: testId,
          name: 'Test User 2',
          role: 'COLLECTOR'
        })

      if (!duplicateError) {
        results.push({
          table: 'profiles',
          field: 'id',
          issue: 'Unique id constraint not working',
          severity: 'ERROR',
          details: { testId }
        })
      }

      // Clean up
      await supabase.from('profiles').delete().eq('id', testId)

    } catch (error: any) {
      results.push({
        table: 'constraints',
        field: 'validation',
        issue: 'Constraint validation error',
        severity: 'ERROR',
        details: error
      })
    }
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = []
    
    const errors = results.filter(r => r.severity === 'ERROR')
    const warnings = results.filter(r => r.severity === 'WARNING')
    
    if (errors.length > 0) {
      recommendations.push('🚨 CRITICAL: Fix all errors before deployment')
    }
    
    if (warnings.length > 0) {
      recommendations.push('⚠️ Review warnings and consider fixes')
    }
    
    const duplicateEmails = results.filter(r => r.issue.includes('Duplicate emails'))
    if (duplicateEmails.length > 0) {
      recommendations.push('📧 Implement email deduplication strategy')
    }
    
    const orphanedRecords = results.filter(r => r.issue.includes('Orphaned records'))
    if (orphanedRecords.length > 0) {
      recommendations.push('🔗 Clean up orphaned records or fix foreign key constraints')
    }
    
    const performanceIssues = results.filter(r => r.issue.includes('performance'))
    if (performanceIssues.length > 0) {
      recommendations.push('⚡ Optimize database indexes for better performance')
    }
    
    const invalidData = results.filter(r => r.issue.includes('Invalid'))
    if (invalidData.length > 0) {
      recommendations.push('🛡️ Implement data validation at the application level')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Database is in good condition')
    }
    
    return recommendations
  }

  /**
   * Print validation report
   */
  private printReport(report: DatabaseValidationReport): void {
    console.log('\n🔍 DATABASE VALIDATION REPORT')
    console.log('============================')
    console.log(`Status: ${report.isValid ? '✅ VALID' : '❌ INVALID'}`)
    console.log(`Total Issues: ${report.totalIssues}`)
    console.log(`Errors: ${report.errors}`)
    console.log(`Warnings: ${report.warnings}`)
    console.log(`Info: ${report.info}`)
    
    if (report.results.length > 0) {
      console.log('\nIssues Found:')
      report.results.forEach(result => {
        const icon = result.severity === 'ERROR' ? '❌' : result.severity === 'WARNING' ? '⚠️' : 'ℹ️'
        console.log(`${icon} ${result.table}.${result.field}: ${result.issue}`)
        if (result.details) {
          console.log(`   Details:`, result.details)
        }
      })
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:')
      report.recommendations.forEach(rec => console.log(rec))
    }
  }
}

export const databaseValidatorService = new DatabaseValidatorService()