import React from 'react'
import { AlertCircle } from 'lucide-react'

interface BrushErrorMessageProps {
  message: string
  title?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'inline' | 'banner'
  className?: string
  style?: React.CSSProperties
}

const BrushErrorMessage: React.FC<BrushErrorMessageProps> = ({
  message,
  title,
  action,
  variant = 'default',
  className = '',
  style = {}
}) => {
  const errorStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: variant === 'inline' ? 'center' : 'flex-start',
    gap: 'var(--space-sm)',
    padding: variant === 'banner' ? 'var(--space-lg)' : 'var(--space-md)',
    backgroundColor: 'var(--danger-bg)',
    color: 'var(--danger)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-md)',
    ...style
  }

  return (
    <div
      className={`brush-error-message brush-error-message--${variant} ${className}`}
      style={errorStyle}
      role="alert"
    >
      <AlertCircle size={variant === 'inline' ? 16 : 20} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            margin: '0 0 var(--space-xs) 0'
          }}>
            {title}
          </h4>
        )}
        <p style={{
          fontSize: variant === 'inline' ? 'var(--text-sm)' : 'var(--text-base)',
          margin: 0,
          lineHeight: 1.4
        }}>
          {message}
        </p>
        {action && (
          <button
            onClick={action.onClick}
            style={{
              marginTop: 'var(--space-sm)',
              padding: 'var(--space-xs) var(--space-sm)',
              backgroundColor: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-medium)',
              cursor: 'pointer'
            }}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

export default BrushErrorMessage
