import React from 'react'

export type MarketplaceFilters = {
  priceMin?: number
  priceMax?: number
  mediums?: string[]
  size?: 'small' | 'medium' | 'large'
  availability?: 'for_sale' | 'sold' | 'all'
}

interface Props {
  value: MarketplaceFilters
  onChange: (next: MarketplaceFilters) => void
}

export default function FiltersSidebar({ value, onChange }: Props) {
  const setField = (patch: Partial<MarketplaceFilters>) => onChange({ ...value, ...patch })

  return (
    <aside style={{
      width: 280,
      borderRight: '1px solid var(--border)',
      paddingRight: 'var(--space-lg)'
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 'var(--space-md)' }}>Filters</h3>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Price</h4>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
          <input
            type="number"
            placeholder="Min"
            value={value.priceMin ?? ''}
            onChange={(e) => setField({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)' }}
          />
          <input
            type="number"
            placeholder="Max"
            value={value.priceMax ?? ''}
            onChange={(e) => setField({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
            style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)' }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Medium</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {['Painting', 'Photography', 'Sculpture', 'Print', 'Drawing'].map(m => (
            <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={value.mediums?.includes(m) || false}
                onChange={(e) => {
                  const next = new Set(value.mediums || [])
                  if (e.target.checked) next.add(m); else next.delete(m)
                  setField({ mediums: Array.from(next) })
                }}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 'var(--space-lg)' }}>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Size</h4>
        <select
          value={value.size || ''}
          onChange={(e) => setField({ size: (e.target.value || undefined) as any })}
          style={{ width: '100%', marginTop: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)' }}
        >
          <option value="">Any</option>
          <option value="small">Small (≤ 50cm)</option>
          <option value="medium">Medium (50–120cm)</option>
          <option value="large">Large (≥ 120cm)</option>
        </select>
      </section>

      <section>
        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>Availability</h4>
        <select
          value={value.availability || 'all'}
          onChange={(e) => setField({ availability: e.target.value as any })}
          style={{ width: '100%', marginTop: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--card)', color: 'var(--fg)' }}
        >
          <option value="all">All</option>
          <option value="for_sale">For sale</option>
          <option value="sold">Sold</option>
        </select>
      </section>
    </aside>
  )
}


