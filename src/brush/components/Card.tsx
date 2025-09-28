import React from 'react'
import { tokens } from '../palette-tokens'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  children,
  className = '',
  style = {},
  ...props
}) => {
  const baseStyles = {
    borderRadius: tokens.borderRadius.lg,
    overflow: 'hidden',
  }

  const variantStyles = {
    default: {
      backgroundColor: tokens.colors.white100,
      border: `1px solid ${tokens.colors.border.primary}`,
    },
    elevated: {
      backgroundColor: tokens.colors.white100,
      boxShadow: tokens.shadows.lg,
    },
    outlined: {
      backgroundColor: 'transparent',
      border: `1px solid ${tokens.colors.border.secondary}`,
    },
    filled: {
      backgroundColor: tokens.colors.gray5,
      border: 'none',
    },
  }

  const paddingStyles = {
    none: { padding: '0' },
    sm: { padding: tokens.spacing.sm },
    md: { padding: tokens.spacing.md },
    lg: { padding: tokens.spacing.lg },
  }

  const combinedStyles = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding],
    ...style,
  }

  return (
    <div
      style={combinedStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
