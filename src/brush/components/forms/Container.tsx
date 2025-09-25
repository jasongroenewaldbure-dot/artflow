import React from 'react'

interface BrushContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  style?: React.CSSProperties
}

const BrushContainer: React.FC<BrushContainerProps> = ({
  children,
  size = 'xl',
  padding = 'lg',
  className = '',
  style = {}
}) => {
  const maxWidthMap = {
    sm: 'var(--container-sm)',
    md: 'var(--container-md)', 
    lg: 'var(--container-lg)',
    xl: 'var(--container-xl)',
    '2xl': 'var(--container-2xl)',
    full: '100%'
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: maxWidthMap[size],
    margin: '0 auto',
    padding: padding !== 'none' ? `0 var(--space-${padding})` : 0,
    width: '100%',
    ...style
  }

  return (
    <div
      className={`brush-container brush-container--${size} ${className}`}
      style={containerStyle}
      data-size={size}
    >
      {children}
    </div>
  )
}

export default BrushContainer
