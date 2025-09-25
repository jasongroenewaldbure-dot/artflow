import React from 'react'

interface BrushButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  style?: React.CSSProperties
}

/**
 * Brush Design System Button Component
 */
export const BrushButton: React.FC<BrushButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  style = {}
}) => {
  const baseClasses = [
    'brush-button',
    `brush-button--${variant}`,
    `brush-button--${size}`,
    disabled && 'brush-button--disabled',
    loading && 'brush-button--loading',
    fullWidth && 'brush-button--full-width',
    className
  ].filter(Boolean).join(' ')

  const buttonStyle: React.CSSProperties = {
    padding: `var(--button-padding-${size})`,
    fontSize: `var(--button-font-size-${size})`,
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.6 : 1,
    
    ...(variant === 'primary' && {
      backgroundColor: 'var(--primary)',
      color: 'white',
    }),
    ...(variant === 'secondary' && {
      backgroundColor: 'var(--secondary)',
      color: 'var(--fg)',
    }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
      border: '2px solid var(--primary)',
    }),
    ...(variant === 'ghost' && {
      backgroundColor: 'transparent',
      color: 'var(--fg)',
    }),
    ...(variant === 'danger' && {
      backgroundColor: 'var(--danger)',
      color: 'white',
    }),
    
    ...style
  }

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <button
      type={type}
      className={baseClasses}
      style={buttonStyle}
      onClick={handleClick}
      disabled={disabled || loading}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  )
}

export default BrushButton
