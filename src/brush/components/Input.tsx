import React from 'react'
import { tokens } from '../palette-tokens'

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  error?: boolean
  helperText?: string
  label?: string
  required?: boolean
}

export const Input: React.FC<InputProps> = ({
  variant = 'default',
  size = 'md',
  error = false,
  helperText,
  label,
  required = false,
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    width: '100%',
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontFamily: tokens.typography.fontFamily.sans.join(', '),
    outline: 'none',
    transition: tokens.transitions.fast,
  }

  const sizeStyles = {
    sm: {
      padding: '8px 12px',
      fontSize: tokens.typography.fontSize.sm,
      minHeight: '32px',
    },
    md: {
      padding: '12px 16px',
      fontSize: tokens.typography.fontSize.base,
      minHeight: '40px',
    },
    lg: {
      padding: '16px 20px',
      fontSize: tokens.typography.fontSize.lg,
      minHeight: '48px',
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: tokens.colors.white100,
      border: `1px solid ${error ? tokens.colors.border.error : tokens.colors.border.primary}`,
      '&:focus': {
        borderColor: tokens.colors.border.focus,
        boxShadow: `0 0 0 3px ${tokens.colors.purple20}`,
      },
    },
    filled: {
      backgroundColor: tokens.colors.gray5,
      border: `1px solid ${error ? tokens.colors.border.error : 'transparent'}`,
      '&:focus': {
        backgroundColor: tokens.colors.white100,
        borderColor: tokens.colors.border.focus,
        boxShadow: `0 0 0 3px ${tokens.colors.purple20}`,
      },
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${error ? tokens.colors.border.error : tokens.colors.border.secondary}`,
      '&:focus': {
        borderColor: tokens.colors.border.focus,
        boxShadow: `0 0 0 3px ${tokens.colors.purple20}`,
      },
    },
  }

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...style,
  }

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: tokens.spacing.xs,
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.text.primary,
          }}
        >
          {label}
          {required && (
            <span style={{ color: tokens.colors.red100, marginLeft: '4px' }}>
              *
            </span>
          )}
        </label>
      )}
      <input
        style={combinedStyles}
        className={className}
        {...props}
      />
      {helperText && (
        <div
          style={{
            marginTop: tokens.spacing.xs,
            fontSize: tokens.typography.fontSize.sm,
            color: error ? tokens.colors.red100 : tokens.colors.text.secondary,
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  )
}

export default Input
