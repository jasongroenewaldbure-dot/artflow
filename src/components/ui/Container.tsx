import React from 'react'

interface ContainerProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const Container: React.FC<ContainerProps> = ({ 
  children, 
  className = '', 
  style = {},
  maxWidth = '2xl',
  padding = 'lg'
}) => {
  const maxWidthMap = {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1440px',
    full: '100%'
  }

  const paddingMap = {
    none: '0',
    sm: 'var(--space-sm)',
    md: 'var(--space-md)',
    lg: 'var(--space-lg)',
    xl: 'var(--space-xl)'
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: maxWidthMap[maxWidth],
    margin: '0 auto',
    padding: `0 ${paddingMap[padding]}`,
    width: '100%',
    ...style
  }

  return (
    <div 
      className={`container ${className}`}
      style={containerStyle}
    >
      {children}
    </div>
  )
}

export default Container
