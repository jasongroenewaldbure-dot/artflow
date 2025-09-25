import React from 'react'

interface BrushInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'url'
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
  className?: string
  style?: React.CSSProperties
}

const BrushInput: React.FC<BrushInputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  label,
  required = false,
  className = '',
  style = {}
}) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: 'var(--space-md)',
    fontSize: 'var(--text-base)',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
    backgroundColor: 'var(--bg)',
    color: 'var(--fg)',
    outline: 'none',
    transition: 'all 0.2s ease',
    ...style
  }

  return (
    <div className={`brush-input ${className}`}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--fg)',
          marginBottom: 'var(--space-xs)'
        }}>
          {label}
          {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--primary)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(110, 31, 255, 0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
      {error && (
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--danger)',
          marginTop: 'var(--space-xs)',
          margin: 0
        }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default BrushInput
