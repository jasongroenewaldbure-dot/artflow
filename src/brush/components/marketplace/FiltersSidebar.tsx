import React from 'react'
import { Card } from '../Card'
import { Typography } from '../Typography'
import { Input } from '../Input'
import { tokens } from '../../palette-tokens'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterSection {
  title: string
  options: FilterOption[]
  type: 'checkbox' | 'radio' | 'range' | 'search'
}

export interface FiltersSidebarProps {
  sections?: FilterSection[]
  values?: Record<string, unknown>
  value?: Record<string, unknown>
  onChange?: (key: string, value: unknown) => void
  onClear?: () => void
  className?: string
}

export interface MarketplaceFilters {
  priceRange?: { min: number; max: number }
  priceMin?: number
  priceMax?: number
  medium?: string[]
  mediums?: string[]
  genre?: string[]
  size?: string
  location?: string
  availability?: string
  [key: string]: unknown
}

export const FiltersSidebar: React.FC<FiltersSidebarProps> = ({
  sections = [],
  values,
  value,
  onChange,
  onClear,
  className = '',
}) => {
  const currentValues = values || value || {} as Record<string, unknown>
  const renderFilterOption = (section: FilterSection, option: FilterOption) => {
    const sectionValue = currentValues[section.title]
    const isChecked = Array.isArray(sectionValue) ? sectionValue.includes(option.value) : false

    const handleChange = () => {
      if (section.type === 'checkbox') {
        const currentSectionValues = Array.isArray(sectionValue) ? sectionValue : []
        const newValues = isChecked
          ? currentSectionValues.filter((v: string) => v !== option.value)
          : [...currentSectionValues, option.value]
        onChange?.(section.title, newValues)
      } else {
        onChange?.(section.title, option.value)
      }
    }

    return (
      <label
        key={option.value}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: `${tokens.spacing.xs} 0`,
          cursor: 'pointer',
        }}
      >
        <input
          type={section.type === 'radio' ? 'radio' : 'checkbox'}
          name={section.title}
          value={option.value}
          checked={isChecked}
          onChange={handleChange}
          style={{ margin: 0 }}
        />
        <span style={{ flex: 1 }}>
          <Typography variant="bodySmall">
            {option.label}
          </Typography>
        </span>
        {option.count && (
          <Typography variant="caption" color="tertiary">
            {option.count}
          </Typography>
        )}
      </label>
    )
  }

  const renderFilterSection = (section: FilterSection) => {
    if (section.type === 'search') {
      return (
        <div key={section.title} style={{ marginBottom: tokens.spacing.lg }}>
          <Typography variant="label" style={{ marginBottom: tokens.spacing.sm }}>
            {section.title}
          </Typography>
          <Input
            placeholder={`Search ${section.title.toLowerCase()}...`}
            value={(currentValues[section.title] as string) || ''}
            onChange={(e) => onChange?.(section.title, e.target.value)}
          />
        </div>
      )
    }

    return (
      <div key={section.title} style={{ marginBottom: tokens.spacing.lg }}>
        <Typography variant="label" style={{ marginBottom: tokens.spacing.sm }}>
          {section.title}
        </Typography>
        <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing.xs }}>
          {section.options.map((option) => renderFilterOption(section, option))}
        </div>
      </div>
    )
  }

  return (
    <Card variant="outlined" padding="lg" className={className}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing.lg }}>
        <Typography variant="h6">Filters</Typography>
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: tokens.colors.text.secondary,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontSize: tokens.typography.fontSize.sm,
          }}
        >
          Clear all
        </button>
      </div>
      {sections.map(renderFilterSection)}
    </Card>
  )
}

export default FiltersSidebar
