import React, { useState } from 'react'
import { Input } from '../Input'

export interface LocationSearchProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  value = '',
  onChange,
  placeholder = 'Search for a location...',
  error,
  required = false,
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    onChange?.(newValue)
  }

  return (
    <div>
      <Input
        type="text"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        error={!!error}
        required={required}
      />
      {error && (
        <div style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default LocationSearch
