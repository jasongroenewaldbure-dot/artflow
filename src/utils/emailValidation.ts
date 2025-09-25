export interface EmailValidationResult {
  isValid: boolean
  errors: string[]
  suggestions: string[]
  normalizedEmail: string
}

export function validateEmail(email: string): EmailValidationResult {
  const errors: string[] = []
  const suggestions: string[] = []
  
  // Normalize email
  const normalizedEmail = email.trim().toLowerCase()
  
  // Basic format validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!normalizedEmail) {
    errors.push('Email is required')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  if (!emailRegex.test(normalizedEmail)) {
    errors.push('Please enter a valid email address')
    suggestions.push('Check for typos in your email address')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  // Length validation
  if (normalizedEmail.length > 254) {
    errors.push('Email address is too long')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  // Local part validation (before @)
  const [localPart, domain] = normalizedEmail.split('@')
  
  if (localPart.length > 64) {
    errors.push('Email username is too long')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  if (localPart.length === 0) {
    errors.push('Email username cannot be empty')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  // Domain validation
  if (!domain || domain.length === 0) {
    errors.push('Email domain is required')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  // Check for consecutive dots
  if (normalizedEmail.includes('..')) {
    errors.push('Email cannot contain consecutive dots')
    suggestions.push('Remove consecutive dots from your email')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  // Check for common typos in popular domains
  const commonDomains = {
    'gmail.com': ['gmial.com', 'gmail.co', 'gmai.com', 'gmail.co.uk'],
    'yahoo.com': ['yaho.com', 'yahoo.co', 'yaho.co.uk'],
    'outlook.com': ['outlok.com', 'outlook.co', 'hotmail.com'],
    'icloud.com': ['iclod.com', 'icloud.co'],
    'protonmail.com': ['protonmai.com', 'protonmail.co']
  }
  
  for (const [correctDomain, typos] of Object.entries(commonDomains)) {
    if (typos.includes(domain)) {
      suggestions.push(`Did you mean ${localPart}@${correctDomain}?`)
    }
  }
  
  // Check for disposable email domains
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc'
  ]
  
  if (disposableDomains.includes(domain)) {
    errors.push('Disposable email addresses are not allowed')
    suggestions.push('Please use a permanent email address')
    return { isValid: false, errors, suggestions, normalizedEmail }
  }
  
  return {
    isValid: true,
    errors: [],
    suggestions,
    normalizedEmail
  }
}

export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
    'throwaway.email', 'temp-mail.org', 'getnada.com', 'maildrop.cc',
    'yopmail.com', 'sharklasers.com', 'grr.la', 'guerrillamailblock.com',
    'pokemail.net', 'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com',
    'mailnesia.com', 'mailcatch.com', 'inboxalias.com', 'mailin8r.com',
    'mailinator2.com', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
    'spam.la', 'binkmail.com', 'bobmail.info', 'chammy.info', 'devnullmail.com',
    'letthemeatspam.com', 'mailinater.com', 'mailinator.com', 'notmailinator.com',
    'reallymymail.com', 'reconmail.com', 'safetymail.info', 'sogetthis.com',
    'spamhereplease.com', 'superrito.com', 'thisisnotmyrealemail.com',
    'tradermail.info', 'veryrealemail.com', 'wegwerfemail.de'
  ]
  
  const domain = email.split('@')[1]?.toLowerCase()
  return domain ? disposableDomains.includes(domain) : false
}