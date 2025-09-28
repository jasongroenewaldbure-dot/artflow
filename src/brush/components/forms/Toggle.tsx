import React from 'react'
import { tokens } from '../../palette-tokens'

export interface ToggleProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
}

export const Toggle: React.FC<ToggleProps> = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className = '',
}) => {
  const sizeStyles = {
    sm: { width: '32px', height: '18px' },
    md: { width: '40px', height: '22px' },
    lg: { width: '48px', height: '26px' },
  }

  const thumbSize = {
    sm: '14px',
    md: '18px',
    lg: '22px',
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing.sm,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
      className={className}
    >
      <div
        style={{
          position: 'relative',
          ...sizeStyles[size],
          backgroundColor: checked ? tokens.colors.purple100 : tokens.colors.gray20,
          borderRadius: '9999px',
          transition: tokens.transitions.fast,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: checked ? `calc(100% - ${thumbSize[size]} - 2px)` : '2px',
            width: thumbSize[size],
            height: thumbSize[size],
            backgroundColor: tokens.colors.white100,
            borderRadius: '50%',
            transition: tokens.transitions.fast,
            boxShadow: tokens.shadows.sm,
          }}
        />
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          style={{
            position: 'absolute',
            opacity: 0,
            width: '100%',
            height: '100%',
            margin: 0,
            cursor: 'inherit',
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: tokens.typography.fontSize.base,
            color: tokens.colors.text.primary,
          }}
        >
          {label}
        </span>
      )}
    </label>
  )
}

export default Toggle
