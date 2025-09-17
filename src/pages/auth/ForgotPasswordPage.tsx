import React, { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { showErrorToast, showSuccessToast } from '../../utils/errorHandling'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    try {
      setLoading(true)
      setErrors({})
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      
      if (error) throw error
      
      setEmailSent(true)
      showSuccessToast('Password reset email sent! Check your inbox.')
    } catch (error: any) {
      console.error('Password reset error:', error)
      
      if (error.message?.includes('Invalid email')) {
        setErrors({ general: 'No account found with this email address.' })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
      
      showErrorToast(error, { 
        component: 'ForgotPasswordPage', 
        action: 'handleSubmit' 
      })
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="auth-page-container">
        <Helmet>
          <title>Check Your Email | ArtFlow</title>
          <meta name="description" content="We've sent you a password reset link. Please check your email." />
        </Helmet>

        <div className="auth-page-content">
          <div className="auth-card auth-card--success">
            <div className="auth-success-icon">
              <CheckCircle size={64} />
            </div>
            
            <div className="auth-header">
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
            </div>

            <div className="auth-success-content">
              <p className="auth-success-text">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              <div className="auth-success-actions">
                <button
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                  className="auth-button auth-button--secondary"
                >
                  <ArrowLeft size={18} />
                  Try Different Email
                </button>
                
                <Link to="/login" className="auth-button auth-button--primary">
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
        <title>Reset Password | ArtFlow</title>
        <meta name="description" content="Reset your ArtFlow password. Enter your email to receive a reset link." />
      </Helmet>

      <div className="auth-page-content">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="auth-error-message">
                {errors.general}
              </div>
            )}

            <div className="auth-field-group">
              <label htmlFor="email" className="auth-label">
                Email Address
              </label>
              <div className="auth-input-group">
                <Mail size={20} className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`auth-input ${errors.email ? 'auth-input--error' : ''}`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <span className="auth-field-error">{errors.email}</span>
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
                  Send Reset Link
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

export default ForgotPasswordPage
