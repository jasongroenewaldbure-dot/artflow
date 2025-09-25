import React from 'react'

interface BrushCardProps {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

/**
 * Brush Design System Card Component
 */
export const BrushCard: React.FC<BrushCardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  radius = 'md',
  interactive = false,
  className = '',
  style = {},
  onClick
}) => {
  const baseClasses = [
    'brush-card',
    `brush-card--${variant}`,
    `brush-card--padding-${padding}`,
    `brush-card--radius-${radius}`,
    interactive && 'brush-card--interactive',
    onClick && 'brush-card--clickable',
    className
  ].filter(Boolean).join(' ')

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card)',
    border: '1px solid var(--border)',
    borderRadius: `var(--radius-${radius})`,
    padding: padding !== 'none' ? `var(--space-${padding})` : 0,
    transition: 'all var(--transition-fast)',
    
    ...(variant === 'elevated' && {
      boxShadow: 'var(--shadow-md)',
    }),
    ...(variant === 'outlined' && {
      borderWidth: '2px',
    }),
    ...(variant === 'filled' && {
      backgroundColor: 'var(--bg-alt)',
      border: 'none',
    }),
    
    ...(interactive && {
      cursor: 'pointer',
    }),
    
    ...style
  }

  const handleClick = () => {
    if (onClick && !interactive) {
      onClick()
    }
  }

  return (
    <div
      className={baseClasses}
      style={cardStyle}
      onClick={handleClick}
      data-variant={variant}
      data-interactive={interactive}
    >
      {children}
    </div>
  )
}

export default BrushCard
