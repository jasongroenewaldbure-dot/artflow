import React from 'react'
import { tokens } from '../palette-tokens'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: string
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  // icon,
  children,
  className = '',
  ...props
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    fontWeight: tokens.typography.fontWeight.medium,
    textDecoration: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: tokens.transitions.fast,
    opacity: disabled ? 0.6 : 1,
  }

  const sizeStyles = {
    sm: {
      padding: tokens.spacing.component.padding.sm,
      fontSize: tokens.typography.fontSize.sm,
      minHeight: '32px',
    },
    md: {
      padding: tokens.spacing.component.padding.md,
      fontSize: tokens.typography.fontSize.base,
      minHeight: '40px',
    },
    lg: {
      padding: tokens.spacing.component.padding.lg,
      fontSize: tokens.typography.fontSize.lg,
      minHeight: '48px',
    },
  }

  const variantStyles = {
    primary: {
      backgroundColor: tokens.colors.purple100,
      color: tokens.colors.white100,
      '&:hover': {
        backgroundColor: tokens.colors.purple80,
      },
      '&:active': {
        backgroundColor: tokens.colors.purple100,
      },
    },
    secondary: {
      backgroundColor: 'transparent',
      color: tokens.colors.purple100,
      border: `1px solid ${tokens.colors.purple100}`,
      '&:hover': {
        backgroundColor: tokens.colors.purple10,
      },
      '&:active': {
        backgroundColor: tokens.colors.purple20,
      },
    },
    tertiary: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.primary,
      '&:hover': {
        backgroundColor: tokens.colors.gray5,
      },
      '&:active': {
        backgroundColor: tokens.colors.gray10,
      },
    },
    ghost: {
      backgroundColor: 'transparent',
      color: tokens.colors.text.secondary,
      '&:hover': {
        backgroundColor: tokens.colors.gray5,
        color: tokens.colors.text.primary,
      },
      '&:active': {
        backgroundColor: tokens.colors.gray10,
      },
    },
    outline: {
      backgroundColor: 'transparent',
      color: tokens.colors.purple100,
      border: `1px solid ${tokens.colors.purple100}`,
      '&:hover': {
        backgroundColor: tokens.colors.purple10,
      },
      '&:active': {
        backgroundColor: tokens.colors.purple20,
      },
    },
    danger: {
      backgroundColor: tokens.colors.red100,
      color: tokens.colors.white100,
      '&:hover': {
        backgroundColor: tokens.colors.red80,
      },
      '&:active': {
        backgroundColor: tokens.colors.red100,
      },
    },
  }

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  }

  return (
    <button
      style={combinedStyles}
      className={className}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span
          style={{
            marginRight: tokens.spacing.sm,
            width: '16px',
            height: '16px',
            border: `2px solid ${tokens.colors.white100}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  )
}

export default Button
