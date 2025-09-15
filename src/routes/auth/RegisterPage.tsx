import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'
import Container from '../../components/ui/Container'

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'collector' as 'artist' | 'collector' | 'both',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      await register(formData.email, formData.password, {
        full_name: formData.fullName,
        role: formData.role
      })
      
      showSuccessToast('Account created successfully! Please check your email to verify your account.')
      navigate('/login')
    } catch (error: any) {
      console.error('Registration error:', error)
      
      if (error.message?.includes('User already registered')) {
        setErrors({ general: 'An account with this email already exists. Please try signing in instead.' })
      } else if (error.message?.includes('Password should be at least')) {
        setErrors({ password: 'Password must be at least 8 characters long' })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
      
      showErrorToast(error, { 
        component: 'RegisterPage', 
        action: 'handleSubmit' 
      })
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak' }
    if (password.length < 8) return { strength: 2, label: 'Fair' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 3, label: 'Good' }
    return { strength: 4, label: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Create Account | ArtFlow</title>
        <meta name="description" content="Join ArtFlow to discover, buy, and sell art. Create your free account today." />
      </Helmet>

      <div className="auth-page-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Create Your Account</h1>
            <p className="auth-subtitle">Join the world's premier art marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="auth-error-message">
                {errors.general}
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="fullName" className="auth-label">
                Full Name
              </label>
              <div className="auth-input-group">
                <User size={20} className="auth-input-icon" />
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`auth-input ${errors.fullName ? 'auth-input--error' : ''}`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
              {errors.fullName && (
                <span className="auth-field-error">{errors.fullName}</span>
              )}
            </div>

            <div className="auth-field-group">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-group">
                <Mail size={20} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <span className="auth-field-error">{errors.email}</span>
              )}
            </div>

            <div className="auth-field-group">
              <label htmlFor="role" className="auth-label">
                I am a...
              </label>
              <div className="auth-role-selection">
                <label className="auth-role-option">
                  <input
                    type="radio"
                    name="role"
                    value="collector"
                    checked={formData.role === 'collector'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={loading}
                  />
                  <div className="auth-role-card">
                    <h3>Collector</h3>
                    <p>Discover and collect art from talented artists</p>
                  </div>
                </label>
                <label className="auth-role-option">
                  <input
                    type="radio"
                    name="role"
                    value="artist"
                    checked={formData.role === 'artist'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={loading}
                  />
                  <div className="auth-role-card">
                    <h3>Artist</h3>
                    <p>Showcase and sell your artwork to collectors</p>
                  </div>
                </label>
                <label className="auth-role-option">
                  <input
                    type="radio"
                    name="role"
                    value="both"
                    checked={formData.role === 'both'}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    disabled={loading}
                  />
                  <div className="auth-role-card">
                    <h3>Both</h3>
                    <p>Create art and collect from other artists</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="auth-field-group">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-group">
                <Lock size={20} className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                  placeholder="Create a strong password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {formData.password && (
                <div className="auth-password-strength">
                  <div className="auth-password-strength-bar">
                    <div 
                      className={`auth-password-strength-fill auth-password-strength-fill--${passwordStrength.strength}`}
                    />
                  </div>
                  <span className={`auth-password-strength-label auth-password-strength-label--${passwordStrength.strength}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="auth-field-error">{errors.password}</span>
              )}
            </div>

            <div className="auth-field-group">
              <label htmlFor="confirmPassword" className="auth-label">
                Confirm Password
              </label>
              <div className="auth-input-group">
                <Lock size={20} className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="auth-password-toggle"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="auth-field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="auth-field-group">
              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                  disabled={loading}
                />
                <span className="auth-checkbox-text">
                  I agree to the{' '}
                  <Link to="/terms" className="auth-link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="auth-link">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <span className="auth-field-error">{errors.agreeToTerms}</span>
              )}
            </div>

            <button
              type="submit"
              className="auth-button auth-button--primary"
              disabled={loading}
            >
              {loading ? (
                <div className="auth-button-spinner" />
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Already have an account?{' '}
              <Link to="/login" className="auth-link auth-link--primary">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
