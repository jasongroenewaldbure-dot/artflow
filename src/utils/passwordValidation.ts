export interface PasswordValidationResult {
  isValid: boolean
  score: number
  errors: string[]
  suggestions: string[]
}

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxLength?: number
  forbiddenPatterns?: RegExp[]
}

const DEFAULT_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  forbiddenPatterns: [
    /(.)\1{3,}/, // No more than 3 consecutive identical characters
    /123456/, // No sequential numbers
    /abcdef/, // No sequential letters
    /password/i, // No common passwords
    /qwerty/i,
    /admin/i,
    /user/i,
    /test/i,
    /1234/i,
    /0000/i,
    /1111/i,
    /2222/i,
    /3333/i,
    /4444/i,
    /5555/i,
    /6666/i,
    /7777/i,
    /8888/i,
    /9999/i
  ]
}

export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []
  let score = 0

  // Length validation
  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters long`)
  } else if (requirements.maxLength && password.length > requirements.maxLength) {
    errors.push(`Password must be no more than ${requirements.maxLength} characters long`)
  } else {
    score += 20
  }

  // Character type validation
  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  } else if (requirements.requireUppercase) {
    score += 15
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  } else if (requirements.requireLowercase) {
    score += 15
  }

  if (requirements.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  } else if (requirements.requireNumbers) {
    score += 15
  }

  if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  } else if (requirements.requireSpecialChars) {
    score += 15
  }

  // Forbidden patterns validation
  if (requirements.forbiddenPatterns) {
    for (const pattern of requirements.forbiddenPatterns) {
      if (pattern.test(password)) {
        errors.push('Password contains forbidden patterns')
        break
      }
    }
  }

  // Additional strength checks
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  if (password.length >= 20) score += 10

  // Character variety bonus
  const uniqueChars = new Set(password).size
  if (uniqueChars >= 8) score += 10
  if (uniqueChars >= 12) score += 10

  // Generate suggestions
  if (password.length < 12) {
    suggestions.push('Use at least 12 characters for better security')
  }
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Add uppercase letters')
  }
  if (!/[a-z]/.test(password)) {
    suggestions.push('Add lowercase letters')
  }
  if (!/\d/.test(password)) {
    suggestions.push('Add numbers')
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Add special characters')
  }
  if (uniqueChars < 8) {
    suggestions.push('Use more unique characters')
  }

  return {
    isValid: errors.length === 0,
    score: Math.min(score, 100),
    errors,
    suggestions
  }
}

export function getPasswordStrengthText(score: number): string {
  if (score < 30) return 'Very Weak'
  if (score < 50) return 'Weak'
  if (score < 70) return 'Fair'
  if (score < 90) return 'Good'
  return 'Strong'
}

export function getPasswordStrengthColor(score: number): string {
  if (score < 30) return '#ef4444' // red
  if (score < 50) return '#f97316' // orange
  if (score < 70) return '#eab308' // yellow
  if (score < 90) return '#22c55e' // green
  return '#16a34a' // dark green
}