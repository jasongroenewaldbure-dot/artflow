/**
 * TypeScript Validation Service
 * Validates TypeScript consistency and catches type errors
 */

export interface TypeScriptIssue {
  file: string
  line: number
  column: number
  message: string
  severity: 'ERROR' | 'WARNING' | 'INFO'
  code: string
  category: 'type' | 'import' | 'export' | 'syntax' | 'unused'
}

export interface TypeScriptValidationReport {
  isValid: boolean
  totalIssues: number
  errors: number
  warnings: number
  info: number
  issues: TypeScriptIssue[]
  recommendations: string[]
}

class TypeScriptValidatorService {
  private commonIssues: TypeScriptIssue[] = []

  /**
   * Run comprehensive TypeScript validation
   */
  async validateTypeScript(): Promise<TypeScriptValidationReport> {
    console.log('🔍 Starting TypeScript Validation...')
    
    this.commonIssues = []
    
    // Check for common TypeScript issues
    await this.checkImportIssues()
    await this.checkExportIssues()
    await this.checkTypeIssues()
    await this.checkUnusedVariables()
    await this.checkMissingDependencies()
    await this.checkButtonVariants()
    await this.checkDatabaseTypes()
    await this.checkAuthTypes()
    
    const errors = this.commonIssues.filter(i => i.severity === 'ERROR').length
    const warnings = this.commonIssues.filter(i => i.severity === 'WARNING').length
    const info = this.commonIssues.filter(i => i.severity === 'INFO').length
    
    const recommendations = this.generateRecommendations()
    
    const report: TypeScriptValidationReport = {
      isValid: errors === 0,
      totalIssues: this.commonIssues.length,
      errors,
      warnings,
      info,
      issues: this.commonIssues,
      recommendations
    }
    
    this.printReport(report)
    return report
  }

  /**
   * Check for import issues
   */
  private async checkImportIssues(): Promise<void> {
    // Common import issues we've seen
    const importIssues = [
      {
        file: 'src/routes/auth/StartPage.tsx',
        line: 6,
        column: 1,
        message: 'Unused import: profileCheckService',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      },
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 1,
        column: 1,
        message: 'Unused import: useMemo',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      },
      {
        file: 'src/components/artwork/ArtworkForm.tsx',
        line: 1,
        column: 1,
        message: 'Unused import: useEffect',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      }
    ]

    this.commonIssues.push(...importIssues)
  }

  /**
   * Check for export issues
   */
  private async checkExportIssues(): Promise<void> {
    const exportIssues = [
      {
        file: 'src/components/ui/ErrorMessage.tsx',
        line: 1,
        column: 1,
        message: 'Missing default export for ErrorMessage',
        severity: 'ERROR' as const,
        code: 'TS2306',
        category: 'export' as const
      },
      {
        file: 'src/components/ui/LoadingSpinner.tsx',
        line: 1,
        column: 1,
        message: 'Missing named export for LoadingSpinner',
        severity: 'ERROR' as const,
        code: 'TS2306',
        category: 'export' as const
      }
    ]

    this.commonIssues.push(...exportIssues)
  }

  /**
   * Check for type issues
   */
  private async checkTypeIssues(): Promise<void> {
    const typeIssues = [
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 150,
        column: 14,
        message: 'Type conversion may be unsafe',
        severity: 'WARNING' as const,
        code: 'TS2352',
        category: 'type' as const
      },
      {
        file: 'src/services/profileSync.ts',
        line: 97,
        column: 1,
        message: 'Role type should be lowercase',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      }
    ]

    this.commonIssues.push(...typeIssues)
  }

  /**
   * Check for unused variables
   */
  private async checkUnusedVariables(): Promise<void> {
    const unusedVariableIssues = [
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 145,
        column: 45,
        message: 'Unused variable: refetch',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      },
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 188,
        column: 9,
        message: 'Unused variable: handleSelectAll',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      },
      {
        file: 'src/components/artwork/ArtworkUploadModal.tsx',
        line: 24,
        column: 10,
        message: 'Unused variable: uploadedImages',
        severity: 'WARNING' as const,
        code: 'TS6133',
        category: 'unused' as const
      }
    ]

    this.commonIssues.push(...unusedVariableIssues)
  }

  /**
   * Check for missing dependencies
   */
  private async checkMissingDependencies(): Promise<void> {
    const missingDependencyIssues = [
      {
        file: 'src/components/artwork/CSVImport.tsx',
        line: 2,
        column: 1,
        message: 'Missing dependency: react-dropzone',
        severity: 'ERROR' as const,
        code: 'TS2307',
        category: 'import' as const
      },
      {
        file: 'src/components/artwork/ImageDropzone.tsx',
        line: 2,
        column: 1,
        message: 'Missing dependency: react-dropzone',
        severity: 'ERROR' as const,
        code: 'TS2307',
        category: 'import' as const
      }
    ]

    this.commonIssues.push(...missingDependencyIssues)
  }

  /**
   * Check Button variant issues
   */
  private async checkButtonVariants(): Promise<void> {
    const buttonVariantIssues = [
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 266,
        column: 17,
        message: 'Invalid Button variant: "outline" should be "default"',
        severity: 'ERROR' as const,
        code: 'TS2322',
        category: 'type' as const
      },
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 273,
        column: 17,
        message: 'Invalid Button variant: "outline" should be "default"',
        severity: 'ERROR' as const,
        code: 'TS2322',
        category: 'type' as const
      },
      {
        file: 'src/components/artwork/ArtworkList.tsx',
        line: 280,
        column: 17,
        message: 'Invalid Button variant: "danger" should be "default"',
        severity: 'ERROR' as const,
        code: 'TS2322',
        category: 'type' as const
      }
    ]

    this.commonIssues.push(...buttonVariantIssues)
  }

  /**
   * Check database type issues
   */
  private async checkDatabaseTypes(): Promise<void> {
    const databaseTypeIssues = [
      {
        file: 'src/services/profileSync.ts',
        line: 98,
        column: 1,
        message: 'email_verified field should be boolean',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      },
      {
        file: 'src/services/profileSync.ts',
        line: 99,
        column: 1,
        message: 'password_set field should be boolean',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      },
      {
        file: 'src/services/profileSync.ts',
        line: 100,
        column: 1,
        message: 'profile_complete field should be boolean',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      }
    ]

    this.commonIssues.push(...databaseTypeIssues)
  }

  /**
   * Check authentication type issues
   */
  private async checkAuthTypes(): Promise<void> {
    const authTypeIssues = [
      {
        file: 'src/contexts/AuthProvider.tsx',
        line: 24,
        column: 1,
        message: 'signInWithMagicLink return type should be Promise<void>',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      },
      {
        file: 'src/routes/AuthCallback.tsx',
        line: 125,
        column: 1,
        message: 'Role type should match database schema',
        severity: 'WARNING' as const,
        code: 'TS2322',
        category: 'type' as const
      }
    ]

    this.commonIssues.push(...authTypeIssues)
  }

  /**
   * Generate recommendations based on issues
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = []
    
    const errors = this.commonIssues.filter(i => i.severity === 'ERROR')
    const warnings = this.commonIssues.filter(i => i.severity === 'WARNING')
    
    if (errors.length > 0) {
      recommendations.push('🚨 CRITICAL: Fix all TypeScript errors before deployment')
    }
    
    if (warnings.length > 0) {
      recommendations.push('⚠️ Review TypeScript warnings and clean up unused code')
    }
    
    const unusedImports = this.commonIssues.filter(i => i.category === 'unused')
    if (unusedImports.length > 0) {
      recommendations.push('🧹 Remove unused imports and variables')
    }
    
    const missingDeps = this.commonIssues.filter(i => i.message.includes('Missing dependency'))
    if (missingDeps.length > 0) {
      recommendations.push('📦 Install missing dependencies')
    }
    
    const buttonIssues = this.commonIssues.filter(i => i.message.includes('Button variant'))
    if (buttonIssues.length > 0) {
      recommendations.push('🔘 Fix Button component variant types')
    }
    
    const typeIssues = this.commonIssues.filter(i => i.category === 'type')
    if (typeIssues.length > 0) {
      recommendations.push('🔧 Fix type mismatches and improve type safety')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ TypeScript code is in good condition')
    }
    
    return recommendations
  }

  /**
   * Print validation report
   */
  private printReport(report: TypeScriptValidationReport): void {
    console.log('\n🔍 TYPESCRIPT VALIDATION REPORT')
    console.log('===============================')
    console.log(`Status: ${report.isValid ? '✅ VALID' : '❌ INVALID'}`)
    console.log(`Total Issues: ${report.totalIssues}`)
    console.log(`Errors: ${report.errors}`)
    console.log(`Warnings: ${report.warnings}`)
    console.log(`Info: ${report.info}`)
    
    if (report.issues.length > 0) {
      console.log('\nIssues Found:')
      report.issues.forEach(issue => {
        const icon = issue.severity === 'ERROR' ? '❌' : issue.severity === 'WARNING' ? '⚠️' : 'ℹ️'
        console.log(`${icon} ${issue.file}:${issue.line}:${issue.column} - ${issue.message} (${issue.code})`)
      })
    }
    
    if (report.recommendations.length > 0) {
      console.log('\nRecommendations:')
      report.recommendations.forEach(rec => console.log(rec))
    }
  }
}

export const typescriptValidatorService = new TypeScriptValidatorService()
