import { z } from 'zod'

// Base validation schemas
export const artworkSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  year: z.number().int().min(1000).max(new Date().getFullYear() + 1).optional(),
  medium: z.string().min(1, 'Medium is required').max(100, 'Medium too long'),
  genre: z.string().max(100, 'Genre too long').optional(),
  style: z.string().max(100, 'Style too long').optional(),
  subject: z.string().max(100, 'Subject too long').optional(),
  width_cm: z.number().positive('Width must be positive').max(1000, 'Width too large').optional(),
  height_cm: z.number().positive('Height must be positive').max(1000, 'Height too large').optional(),
  depth_cm: z.number().positive('Depth must be positive').max(500, 'Depth too large').optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid price format').optional(),
  currency: z.string().length(3, 'Currency must be 3 characters').default('ZAR'),
  primary_image_url: z.string().url('Invalid image URL').optional(),
  status: z.enum(['draft', 'available', 'sold', 'archived']).default('draft'),
  is_for_sale: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_trending: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  user_id: z.string().uuid(),
  view_count: z.number().int().min(0).default(0),
  like_count: z.number().int().min(0).default(0),
  dominant_colors: z.array(z.string()).max(10, 'Too many colors').optional()
})

export const artistSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  slug: z.string().min(1, 'Slug is required').max(100, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
  full_name: z.string().max(200, 'Full name too long').optional(),
  bio: z.string().max(2000, 'Bio too long').optional(),
  avatar_url: z.string().url('Invalid avatar URL').optional(),
  location: z.string().max(100, 'Location too long').optional(),
  nationality: z.string().max(100, 'Nationality too long').optional(),
  birth_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  death_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  is_verified: z.boolean().default(false),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional()
})

export const catalogueSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  cover_image_url: z.string().url('Invalid cover image URL').optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  artist_id: z.string().uuid()
})

// Validation rules
export interface ValidationRule {
  field: string
  validator: (value: any, data: any) => boolean | string
  message: string
}

export class DataValidationService {
  private static instance: DataValidationService
  private validationRules: Map<string, ValidationRule[]> = new Map()

  private constructor() {
    this.setupDefaultRules()
  }

  static getInstance(): DataValidationService {
    if (!DataValidationService.instance) {
      DataValidationService.instance = new DataValidationService()
    }
    return DataValidationService.instance
  }

  private setupDefaultRules(): void {
    // Artwork validation rules
    this.addValidationRules('artwork', [
      {
        field: 'dimensions',
        validator: (value, data) => {
          if (!value) return true
          const { width_cm, height_cm, depth_cm } = data
          if (width_cm && height_cm && width_cm <= height_cm * 10 && height_cm <= width_cm * 10) {
            return true
          }
          return 'Invalid dimensions ratio'
        },
        message: 'Dimensions must be reasonable'
      },
      {
        field: 'price',
        validator: (value, data) => {
          if (!value) return true
          const price = parseFloat(value)
          if (data.currency === 'ZAR' && price > 0 && price <= 10000000) {
            return true
          }
          return 'Price must be between 0 and 10,000,000 ZAR'
        },
        message: 'Invalid price range'
      },
      {
        field: 'year',
        validator: (value, data) => {
          if (!value) return true
          const currentYear = new Date().getFullYear()
          if (value >= 1000 && value <= currentYear + 1) {
            return true
          }
          return 'Year must be between 1000 and current year'
        },
        message: 'Invalid year'
      },
      {
        field: 'dominant_colors',
        validator: (value) => {
          if (!value || !Array.isArray(value)) return true
          return value.length <= 10 && value.every(color => typeof color === 'string' && color.length <= 20)
        },
        message: 'Invalid dominant colors'
      }
    ])

    // Artist validation rules
    this.addValidationRules('artist', [
      {
        field: 'birth_year',
        validator: (value, data) => {
          if (!value || !data.death_year) return true
          return value < data.death_year
        },
        message: 'Birth year must be before death year'
      },
      {
        field: 'slug',
        validator: (value) => {
          return /^[a-z0-9-]+$/.test(value) && !value.startsWith('-') && !value.endsWith('-')
        },
        message: 'Slug must contain only lowercase letters, numbers, and hyphens'
      }
    ])

    // Catalogue validation rules
    this.addValidationRules('catalogue', [
      {
        field: 'title',
        validator: (value) => {
          return value && value.trim().length > 0
        },
        message: 'Title cannot be empty'
      }
    ])
  }

  addValidationRules(entityType: string, rules: ValidationRule[]): void {
    const existingRules = this.validationRules.get(entityType) || []
    this.validationRules.set(entityType, [...existingRules, ...rules])
  }

  validateEntity<T>(entityType: string, data: T): ValidationResult {
    const schema = this.getSchema(entityType)
    const customRules = this.validationRules.get(entityType) || []
    
    const errors: ValidationError[] = []

    // Schema validation
    try {
      schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: 'SCHEMA_ERROR'
        })))
      }
    }

    // Custom rules validation
    for (const rule of customRules) {
      const fieldValue = this.getNestedValue(data, rule.field)
      const result = rule.validator(fieldValue, data)
      
      if (result !== true) {
        errors.push({
          field: rule.field,
          message: typeof result === 'string' ? result : rule.message,
          code: 'CUSTOM_RULE_ERROR'
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: this.generateWarnings(entityType, data)
    }
  }

  private getSchema(entityType: string): z.ZodSchema {
    switch (entityType) {
      case 'artwork':
        return artworkSchema
      case 'artist':
        return artistSchema
      case 'catalogue':
        return catalogueSchema
      default:
        throw new Error(`Unknown entity type: ${entityType}`)
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private generateWarnings(entityType: string, data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    switch (entityType) {
      case 'artwork':
        if (data.price && parseFloat(data.price) < 100) {
          warnings.push({
            field: 'price',
            message: 'Price seems unusually low',
            severity: 'low'
          })
        }
        
        if (data.year && data.year < 1900) {
          warnings.push({
            field: 'year',
            message: 'Artwork is very old, please verify',
            severity: 'medium'
          })
        }

        if (!data.description || data.description.length < 50) {
          warnings.push({
            field: 'description',
            message: 'Consider adding a more detailed description',
            severity: 'low'
          })
        }
        break

      case 'artist':
        if (data.birth_year && data.birth_year < 1900) {
          warnings.push({
            field: 'birth_year',
            message: 'Artist birth year is very old, please verify',
            severity: 'medium'
          })
        }

        if (!data.bio || data.bio.length < 100) {
          warnings.push({
            field: 'bio',
            message: 'Consider adding a more detailed bio',
            severity: 'low'
          })
        }
        break
    }

    return warnings
  }

  // Data consistency checks
  async checkDataConsistency(entityType: string, data: any): Promise<ConsistencyResult> {
    const issues: ConsistencyIssue[] = []

    switch (entityType) {
      case 'artwork':
        issues.push(...await this.checkArtworkConsistency(data))
        break
      case 'artist':
        issues.push(...await this.checkArtistConsistency(data))
        break
      case 'catalogue':
        issues.push(...await this.checkCatalogueConsistency(data))
        break
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      recommendations: this.generateRecommendations(entityType, issues)
    }
  }

  private async checkArtworkConsistency(data: any): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    // Check if artist exists
    if (data.user_id) {
      // This would typically check against the database
      // For now, we'll just validate the format
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.user_id)) {
        issues.push({
          type: 'reference_integrity',
          field: 'user_id',
          message: 'Invalid artist ID format',
          severity: 'high'
        })
      }
    }

    // Check image URL accessibility
    if (data.primary_image_url) {
      try {
        const response = await fetch(data.primary_image_url, { method: 'HEAD' })
        if (!response.ok) {
          issues.push({
            type: 'resource_accessibility',
            field: 'primary_image_url',
            message: 'Primary image URL is not accessible',
            severity: 'medium'
          })
        }
      } catch {
        issues.push({
          type: 'resource_accessibility',
          field: 'primary_image_url',
          message: 'Primary image URL is not accessible',
          severity: 'medium'
        })
      }
    }

    // Check price consistency
    if (data.price && data.currency) {
      const price = parseFloat(data.price)
      if (data.currency === 'ZAR' && price > 1000000) {
        issues.push({
          type: 'business_logic',
          field: 'price',
          message: 'Price seems unusually high for ZAR',
          severity: 'low'
        })
      }
    }

    return issues
  }

  private async checkArtistConsistency(data: any): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    // Check slug uniqueness (would typically check database)
    if (data.slug) {
      // This is a placeholder - in real implementation, check database
      if (data.slug.length < 3) {
        issues.push({
          type: 'business_logic',
          field: 'slug',
          message: 'Slug is too short',
          severity: 'medium'
        })
      }
    }

    // Check avatar URL accessibility
    if (data.avatar_url) {
      try {
        const response = await fetch(data.avatar_url, { method: 'HEAD' })
        if (!response.ok) {
          issues.push({
            type: 'resource_accessibility',
            field: 'avatar_url',
            message: 'Avatar URL is not accessible',
            severity: 'low'
          })
        }
      } catch {
        issues.push({
          type: 'resource_accessibility',
          field: 'avatar_url',
          message: 'Avatar URL is not accessible',
          severity: 'low'
        })
      }
    }

    return issues
  }

  private async checkCatalogueConsistency(data: any): Promise<ConsistencyIssue[]> {
    const issues: ConsistencyIssue[] = []

    // Check artist reference
    if (data.artist_id) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.artist_id)) {
        issues.push({
          type: 'reference_integrity',
          field: 'artist_id',
          message: 'Invalid artist ID format',
          severity: 'high'
        })
      }
    }

    return issues
  }

  private generateRecommendations(entityType: string, issues: ConsistencyIssue[]): string[] {
    const recommendations: string[] = []

    const highSeverityIssues = issues.filter(issue => issue.severity === 'high')
    if (highSeverityIssues.length > 0) {
      recommendations.push('Fix high severity issues before saving')
    }

    const referenceIssues = issues.filter(issue => issue.type === 'reference_integrity')
    if (referenceIssues.length > 0) {
      recommendations.push('Verify all references are valid and exist')
    }

    const resourceIssues = issues.filter(issue => issue.type === 'resource_accessibility')
    if (resourceIssues.length > 0) {
      recommendations.push('Check that all URLs are accessible and valid')
    }

    return recommendations
  }
}

// Types
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface ConsistencyResult {
  isConsistent: boolean
  issues: ConsistencyIssue[]
  recommendations: string[]
}

export interface ConsistencyIssue {
  type: 'reference_integrity' | 'resource_accessibility' | 'business_logic' | 'data_format'
  field: string
  message: string
  severity: 'low' | 'medium' | 'high'
}

// Export singleton instance
export const dataValidation = DataValidationService.getInstance()
