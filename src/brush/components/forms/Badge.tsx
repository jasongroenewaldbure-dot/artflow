import React from 'react'
import { tokens } from '../../palette-tokens'

export interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className = '',
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.borderRadius.full,
    fontWeight: tokens.typography.fontWeight.medium,
    textAlign: 'center' as const,
  }

  const sizeStyles = {
    sm: {
      padding: '2px 8px',
      fontSize: tokens.typography.fontSize.xs,
      minHeight: '20px',
    },
    md: {
      padding: '4px 12px',
      fontSize: tokens.typography.fontSize.sm,
      minHeight: '24px',
    },
    lg: {
      padding: '6px 16px',
      fontSize: tokens.typography.fontSize.base,
      minHeight: '28px',
    },
  }

  const variantStyles = {
    default: {
      backgroundColor: tokens.colors.gray20,
      color: tokens.colors.text.primary,
    },
    primary: {
      backgroundColor: tokens.colors.purple100,
      color: tokens.colors.white100,
    },
    secondary: {
      backgroundColor: tokens.colors.gray60,
      color: tokens.colors.white100,
    },
    success: {
      backgroundColor: tokens.colors.green100,
      color: tokens.colors.white100,
    },
    warning: {
      backgroundColor: tokens.colors.yellow100,
      color: tokens.colors.white100,
    },
    error: {
      backgroundColor: tokens.colors.red100,
      color: tokens.colors.white100,
    },
    info: {
      backgroundColor: tokens.colors.blue100,
      color: tokens.colors.white100,
    },
  }

  const combinedStyles = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant],
  }

  return (
    <span style={combinedStyles} className={className}>
      {children}
    </span>
  )
}

export default Badge
