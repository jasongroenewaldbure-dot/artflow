import React from 'react'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'muted' | 'white'
  text?: string
  className?: string
  style?: React.CSSProperties
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  text,
  className = '',
  style = {}
}) => {
  const sizeMap = {
    xs: '16px',
    sm: '20px', 
    md: '24px',
    lg: '32px',
    xl: '48px'
  }

  const colorMap = {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    muted: 'var(--muted)',
    white: '#ffffff'
  }

  const spinnerSize = sizeMap[size]
  const spinnerColor = colorMap[color]

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `2px solid transparent`,
    borderTop: `2px solid ${spinnerColor}`,
    borderRadius: '50%',
    animation: 'brush-spin 1s linear infinite',
    ...style
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: text ? 'var(--space-sm)' : 0
  }

  return (
    <div 
      className={`brush-loading-spinner ${className}`}
      style={containerStyle}
    >
      <div 
        style={spinnerStyle}
        role="status"
        aria-label={text || 'Loading'}
      />
      {text && (
        <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--muted)',
          fontWeight: 'var(--font-weight-medium)'
        }}>
          {text}
        </span>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes brush-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  )
}

export default LoadingSpinner
