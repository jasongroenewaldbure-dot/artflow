import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle, Loader, Eye, EyeOff, Github, Twitter, Linkedin, Apple, Facebook, Sparkles, ArrowLeft } from 'lucide-react'
import { useAuth } from '../../contexts/AuthProvider'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const StartPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'email' | 'password' | 'role-selection' | 'magic-link-sent' | 'loading'>('email')
  const [error, setError] = useState('')
  const [userExists, setUserExists] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'artist' | 'collector' | 'both' | null>(null)
  const { signIn, signUp, signInWithMagicLink, resetPassword, user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/u/dashboard', { replace: true })
    }
  }, [user, loading, navigate])

  const checkUserExists = async (email: string) => {
    try {
      // First check if user exists in auth.users
      const { data: authUser, error: authError } = await supabase.auth.getUser()
      
      if (authError && authError.message !== 'Auth session missing!') {
        // If no auth session, check profiles table directly
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role, email')
          .eq('email', email)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Profile query error:', error)
          return { exists: false, hasRole: false }
        }
        
        return data ? { exists: true, hasRole: !!data.role } : { exists: false, hasRole: false }
      }
      
      // If we have an auth user, check their profile
      if (authUser?.user?.email === email) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', authUser.user.id)
          .single()
        
        if (error && error.code !== 'PGRST116') {
          console.error('Profile query error:', error)
          return { exists: false, hasRole: false }
        }
        
        return data ? { exists: true, hasRole: !!data.role } : { exists: false, hasRole: false }
      }
      
      return { exists: false, hasRole: false }
    } catch (err) {
      console.error('Error checking user:', err)
      return { exists: false, hasRole: false }
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStep('loading')
    setError('')

    try {
      const userInfo = await checkUserExists(email)
      setUserExists(userInfo.exists)
      
      if (userInfo.exists) {
        if (userInfo.hasRole) {
          // User exists and has a role, go directly to password
          setStep('password')
        } else {
          // User exists but no role set, show role selection
          setStep('role-selection')
        }
      } else {
        // New user, show role selection
        setStep('role-selection')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('email')
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setStep('loading')
    setError('')

    try {
      const { user } = await signIn(email, password)
      
        // Check if user has completed onboarding
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed, password_set')
            .eq('user_id', user.id)
            .single()
          
          // Always check password setup first
          const hasPassword = user.user_metadata?.password_set || profile?.password_set || false
          
          if (!hasPassword || !profile?.onboarding_completed) {
            navigate('/onboarding')
          } else {
            navigate('/u/dashboard')
          }
        }
    } catch (err: any) {
      setError(err.message || 'Invalid password')
      setStep('password')
    }
  }

  const handleRoleSelection = async (role: 'artist' | 'collector' | 'both') => {
    try {
      setStep('loading')
      setError('')
      setSelectedRole(role)
      
      if (userExists) {
        // Existing user without role - update their profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('user_id', user.id)
          
          if (error) throw error
          
          // Navigate based on onboarding status
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed, password_set')
            .eq('user_id', user.id)
            .single()
          
          // Always check password setup first
          const hasPassword = user.user_metadata?.password_set || profile?.password_set || false
          
          if (!hasPassword || !profile?.onboarding_completed) {
            navigate('/onboarding')
          } else {
            navigate('/u/dashboard')
          }
        } else {
          // User not authenticated, store role and send magic link
          sessionStorage.setItem('selectedRole', role)
          await signInWithMagicLink(email)
          setStep('magic-link-sent')
          toast.success('Magic link sent to your email!')
        }
      } else {
        // New user - store the role in sessionStorage for magic link callback
        sessionStorage.setItem('selectedRole', role)
        await signInWithMagicLink(email)
        setStep('magic-link-sent')
        toast.success('Magic link sent to your email!')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process role selection')
      setStep('role-selection')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setStep('loading')
    setError('')

    try {
      await signUp(email, password)
      setStep('magic-link-sent')
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setStep('password')
    }
  }

  const handleSSO = async (provider: 'google' | 'github' | 'twitter' | 'linkedin' | 'apple' | 'facebook') => {
    try {
      // Get the selected role from URL params or state
      const roleParam = selectedRole ? `?role=${selectedRole}` : ''
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback${roleParam}`
        }
      })
      
      if (error) throw error
    } catch (err: any) {
      toast.error(`Failed to sign in with ${provider}: ${err.message}`)
    }
  }

  const ssoProviders = [
    { id: 'google', name: 'Google', icon: Mail, color: '#4285F4' },
    { id: 'apple', name: 'Apple', icon: Apple, color: '#000000' }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--bg) 0%, var(--bg-alt) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Helmet>
        <title>Get Started | ArtFlow</title>
        <meta name="description" content="Join ArtFlow to discover, buy, and sell art. Sign up or sign in to get started." />
      </Helmet>

      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(110, 31, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <Link to="/" style={{
            fontSize: '36px',
            fontWeight: '800',
            color: 'var(--primary)',
            textDecoration: 'none',
            letterSpacing: '-0.5px',
            display: 'inline-block',
            marginBottom: 'var(--space-lg)'
          }}>
            ArtFlow
          </Link>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            margin: '0 0 var(--space-sm) 0',
            color: 'var(--fg)',
            background: 'linear-gradient(135deg, var(--fg) 0%, var(--primary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {step === 'email' && 'Welcome to ArtFlow'}
            {step === 'password' && 'Welcome back'}
            {step === 'role-selection' && 'Choose your role'}
            {step === 'magic-link-sent' && 'Check your email'}
            {step === 'loading' && 'Please wait...'}
          </h1>
          <p style={{
            fontSize: '16px',
            color: 'var(--muted)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {step === 'email' && 'Join the world\'s premier art marketplace'}
            {step === 'password' && 'Enter your password to continue'}
            {step === 'role-selection' && 'Tell us what you\'re here for'}
            {step === 'magic-link-sent' && 'We sent you a magic link to sign in'}
            {step === 'loading' && 'Processing your request...'}
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-2xl)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          border: '1px solid var(--border)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)',
              color: 'var(--danger)',
              fontSize: '14px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Success Message */}
          {step === 'magic-link-sent' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-md)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-lg)',
              color: 'var(--accent)',
              fontSize: '14px'
            }}>
              <CheckCircle size={16} />
              Magic link sent to {email}
            </div>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <div>
              {/* SSO Options */}
              <div style={{ marginBottom: 'var(--space-xl)' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 'var(--space-sm)',
                  marginBottom: 'var(--space-lg)'
                }}>
                  {ssoProviders.map((provider) => {
                    const IconComponent = provider.icon
                    return (
                      <button
                        key={provider.id}
                        onClick={() => handleSSO(provider.id as any)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--space-sm)',
                          padding: 'var(--space-md)',
                          backgroundColor: 'var(--bg)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          color: 'var(--fg)',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg-alt)'
                          e.currentTarget.style.borderColor = provider.color
                          e.currentTarget.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--bg)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <IconComponent size={18} style={{ color: provider.color }} />
                        {provider.name}
                      </button>
                    )
                  })}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-md)',
                  margin: 'var(--space-lg) 0'
                }}>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    backgroundColor: 'var(--border)'
                  }} />
                  <span style={{
                    fontSize: '14px',
                    color: 'var(--muted)',
                    fontWeight: '500'
                  }}>
                    OR
                  </span>
                  <div style={{
                    flex: 1,
                    height: '1px',
                    backgroundColor: 'var(--border)'
                  }} />
                </div>
              </div>

              <form onSubmit={handleEmailSubmit}>
                <div style={{ marginBottom: 'var(--space-lg)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--fg)',
                    marginBottom: 'var(--space-sm)'
                  }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={20} style={{
                      position: 'absolute',
                      left: 'var(--space-md)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--muted)'
                    }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      style={{
                        width: '100%',
                        padding: 'var(--space-md) var(--space-md) var(--space-md) var(--space-3xl)',
                        border: '2px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '16px',
                        backgroundColor: 'var(--bg)',
                        color: 'var(--fg)',
                        outline: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--primary)'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110, 31, 255, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: 'var(--space-md)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 'var(--space-sm)',
                    boxShadow: '0 4px 12px rgba(110, 31, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(110, 31, 255, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 31, 255, 0.3)'
                  }}
                >
                  Continue with Email
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          )}

          {/* Password Step */}
          {step === 'password' && (
            <form onSubmit={isSignUp ? handleSignUp : handlePasswordSubmit}>
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--fg)',
                  marginBottom: 'var(--space-sm)'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={20} style={{
                    position: 'absolute',
                    left: 'var(--space-md)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--muted)'
                  }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--space-md) var(--space-3xl) var(--space-md) var(--space-3xl)',
                      border: '2px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '16px',
                      backgroundColor: 'var(--bg)',
                      color: 'var(--fg)',
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110, 31, 255, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 'var(--space-md)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                      padding: 'var(--space-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: 'var(--space-sm)',
                marginBottom: 'var(--space-lg)'
              }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: 'var(--space-md)',
                    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(110, 31, 255, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  style={{
                    flex: 1,
                    padding: 'var(--space-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    border: '2px solid var(--primary)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)'
                    e.currentTarget.style.color = 'white'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--primary)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isSignUp ? 'Sign In Instead' : 'Sign Up Instead'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep('email')}
                style={{
                  width: '100%',
                  padding: 'var(--space-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--muted)',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Use a different email
              </button>
            </form>
          )}

          {/* Role Selection Step */}
          {step === 'role-selection' && (
            <div>
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-xl)'
              }}>
                <h2 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: 'var(--foreground)',
                  margin: '0 0 var(--space-sm) 0'
                }}>
                  What brings you here?
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: 'var(--muted)',
                  margin: 0
                }}>
                  Choose your role to get started
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-xl)'
              }}>
                <button
                  onClick={() => handleRoleSelection('artist')}
                  style={{
                    padding: 'var(--space-lg)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.backgroundColor = 'var(--card)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <span style={{
                        color: 'var(--primary)',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>A</span>
                    </div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      margin: '0 0 var(--space-xs) 0'
                    }}>Artist</h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>Showcase your work and connect with collectors</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('collector')}
                  style={{
                    padding: 'var(--space-lg)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.backgroundColor = 'var(--card)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <span style={{
                        color: '#ef4444',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>C</span>
                    </div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      margin: '0 0 var(--space-xs) 0'
                    }}>Collector</h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>Discover and collect amazing art</p>
                  </div>
                </button>

                <button
                  onClick={() => handleRoleSelection('both')}
                  style={{
                    padding: 'var(--space-lg)',
                    border: '2px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)'
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.backgroundColor = 'var(--card)'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: 'rgba(147, 51, 234, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 'var(--space-sm)'
                    }}>
                      <span style={{
                        color: '#9333ea',
                        fontWeight: 'bold',
                        fontSize: '16px'
                      }}>B</span>
                    </div>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--foreground)',
                      margin: '0 0 var(--space-xs) 0'
                    }}>Both</h3>
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--muted)',
                      margin: 0
                    }}>Create art and collect from others</p>
                  </div>
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => {
                    setStep('email')
                    setEmail('')
                    setError('')
                  }}
                  style={{
                    color: 'var(--primary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  Back to email
                </button>
              </div>
            </div>
          )}

          {/* Magic Link Sent Step */}
          {step === 'magic-link-sent' && (
            <div>
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-xl)'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-lg) auto'
                }}>
                  <CheckCircle size={40} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  margin: '0 0 var(--space-sm) 0',
                  color: 'var(--fg)'
                }}>
                  Check your email
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: 'var(--muted)',
                  margin: 0
                }}>
                  We sent a magic link to <strong>{email}</strong>
                </p>
              </div>

              <button
                onClick={() => setStep('email')}
                style={{
                  width: '100%',
                  padding: 'var(--space-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--primary)'
                  e.currentTarget.style.color = 'white'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = 'var(--primary)'
                }}
              >
                Use a different email
              </button>
            </div>
          )}

          {/* Loading Step */}
          {step === 'loading' && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--space-xl) 0'
            }}>
              <Loader size={40} style={{
                color: 'var(--primary)',
                animation: 'spin 1s linear infinite',
                margin: '0 auto var(--space-lg) auto'
              }} />
              <p style={{
                fontSize: '16px',
                color: 'var(--muted)',
                margin: 0
              }}>
                Processing your request...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
          padding: 'var(--space-lg)',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--radius-lg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <p style={{
            fontSize: '14px',
            color: 'var(--muted)',
            margin: '0 0 var(--space-sm) 0'
          }}>
            By continuing, you agree to our{' '}
            <Link to="/terms" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              Privacy Policy
            </Link>
          </p>
          <p style={{
            fontSize: '12px',
            color: 'var(--muted)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-xs)'
          }}>
            <Sparkles size={12} />
            Secure authentication powered by Supabase
          </p>
        </div>
      </div>
    </div>
  )
}

export default StartPage