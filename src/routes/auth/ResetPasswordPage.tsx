import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, CheckCircle, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isValidSession, setIsValidSession] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Session check error:', error)
          setErrors({ general: 'Invalid or expired reset link. Please request a new one.' })
        } else if (session) {
          setIsValidSession(true)
        } else {
          setErrors({ general: 'Invalid or expired reset link. Please request a new one.' })
        }
      } catch (error) {
        console.error('Session check error:', error)
        setErrors({ general: 'Invalid or expired reset link. Please request a new one.' })
      } finally {
        setSessionChecked(true)
      }
    }

    checkSession()
  }, [])

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' }
    if (password.length < 6) return { strength: 1, label: 'Weak' }
    if (password.length < 8) return { strength: 2, label: 'Fair' }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 3, label: 'Good' }
    return { strength: 4, label: 'Strong' }
  }

  const passwordStrength = getPasswordStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) throw error
      
      showSuccessToast('Password updated successfully!')
      navigate('/login')
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      if (error.message?.includes('Password should be at least')) {
        setErrors({ password: 'Password must be at least 8 characters long' })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
      
      showErrorToast(error, { 
        component: 'ResetPasswordPage', 
        action: 'handleSubmit' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (!sessionChecked) {
    return (
      <div className="auth-page-container">
        <div className="auth-page-content">
          <div className="auth-card">
            <div className="auth-loading">
              <div className="auth-button-spinner" />
              <p>Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="auth-page-container">
        <Helmet>
          <title>Invalid Reset Link | ArtFlow</title>
          <meta name="description" content="This password reset link is invalid or has expired." />
        </Helmet>

        <div className="auth-page-content">
          <div className="auth-card auth-card--error">
            <div className="auth-header">
              <h1 className="auth-title">Invalid Reset Link</h1>
              <p className="auth-subtitle">
                This password reset link is invalid or has expired.
              </p>
            </div>

            <div className="auth-error-content">
              <p className="auth-error-text">
                Password reset links expire after 1 hour for security reasons.
              </p>
              
              <div className="auth-error-actions">
                <Link to="/forgot-password" className="auth-button auth-button--primary">
                  Request New Reset Link
                </Link>
                
                <Link to="/login" className="auth-button auth-button--secondary">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page-container">
      <Helmet>
        <title>Set New Password | ArtFlow</title>
        <meta name="description" content="Set your new ArtFlow password." />
      </Helmet>

      <div className="auth-page-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Set New Password</h1>
            <p className="auth-subtitle">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="auth-error-message">
                {errors.general}
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="password" className="auth-label">
                New Password
              </label>
              <div className="auth-input-group">
                <Lock size={20} className="auth-input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`auth-input ${errors.password ? 'auth-input--error' : ''}`}
                  placeholder="Enter your new password"
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
              {password && (
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
                Confirm New Password
              </label>
              <div className="auth-input-group">
                <Lock size={20} className="auth-input-icon" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`auth-input ${errors.confirmPassword ? 'auth-input--error' : ''}`}
                  placeholder="Confirm your new password"
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

            <button
              type="submit"
              className="auth-button auth-button--primary"
              disabled={loading}
            >
              {loading ? (
                <div className="auth-button-spinner" />
              ) : (
                <>
                  Update Password
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Remember your password?{' '}
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

export default ResetPasswordPage
