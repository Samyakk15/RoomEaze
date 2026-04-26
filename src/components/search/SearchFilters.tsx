'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'

const LOCALITIES = [
  'Dharampeth','Sitabuldi','Sadar','Civil Lines','Ramdaspeth',
  'Pratap Nagar','Manish Nagar','Hingna Road','Wardha Road',
  'Ambazari','Bajaj Nagar','Trimurti Nagar','Laxmi Nagar',
  'Shankar Nagar','Bhandara Road','Kamptee Road','Katol Road',
  'Nandanvan','Sakkardara','Godhni','Congress Nagar',
  'Surendra Nagar','Indora','Kalamna','Wadi',
]

const PRICE_RANGES = [
  { label: 'Under ₹3,000',        min: '0',     max: '3000'  },
  { label: '₹3,000 – ₹6,000',    min: '3000',  max: '6000'  },
  { label: '₹6,000 – ₹10,000',   min: '6000',  max: '10000' },
  { label: '₹10,000 – ₹15,000',  min: '10000', max: '15000' },
  { label: 'Above ₹15,000',       min: '15000', max: '999999'},
]

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 10px',
  border: '0.5px solid var(--color-border-secondary)',
  borderRadius: '7px',
  fontSize: '13px',
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  outline: 'none',
}

export default function SearchFilters({
  currentFilters,
}: {
  currentFilters: Record<string, string | undefined>
}) {
  const router   = useRouter()
  const pathname = usePathname()

  const [locality,    setLocality]    = useState(currentFilters.locality    ?? '')
  const [type,        setType]        = useState(currentFilters.type        ?? '')
  const [priceRange,  setPriceRange]  = useState(
    currentFilters.min_price
      ? `${currentFilters.min_price}-${currentFilters.max_price}`
      : ''
  )
  const [furnished,   setFurnished]   = useState(currentFilters.is_furnished ?? '')
  const [gender,      setGender]      = useState(currentFilters.gender      ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (locality)   params.set('locality', locality)
    if (type)       params.set('type', type)
    if (priceRange) {
      const [min, max] = priceRange.split('-')
      params.set('min_price', min)
      params.set('max_price', max)
    }
    if (furnished)  params.set('is_furnished', furnished)
    if (gender)     params.set('gender', gender)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearAll() {
    setLocality(''); setType(''); setPriceRange('')
    setFurnished(''); setGender('')
    router.push(pathname)
  }

  const hasFilters = !!(locality || type || priceRange || furnished || gender)

  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '12px',
      padding: '18px',
      position: 'sticky',
      top: '20px',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '16px',
      }}>
        <span style={{ fontSize: '14px', fontWeight: 500 }}>Filters</span>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{
              fontSize: '12px', color: '#E24B4A',
              background: 'none', border: 'none',
              cursor: 'pointer', fontWeight: 500,
            }}
          >
            Clear all
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Locality */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
            Locality
          </label>
          <select style={selectStyle} value={locality} onChange={e => setLocality(e.target.value)}>
            <option value="">All localities</option>
            {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Room type */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
            Room type
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'All types', value: '' },
              { label: 'PG',        value: 'pg' },
              { label: 'Room',      value: 'room' },
              { label: 'Flat',      value: 'flat' },
              { label: 'Hostel',    value: 'hostel' },
            ].map(opt => (
              <label key={opt.value} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', fontSize: '13px',
                color: type === opt.value
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
              }}>
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  checked={type === opt.value}
                  onChange={e => setType(e.target.value)}
                  style={{ accentColor: '#1D9E75' }}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
            Price range
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              <input
                type="radio" name="price"
                value=""
                checked={priceRange === ''}
                onChange={() => setPriceRange('')}
                style={{ accentColor: '#1D9E75' }}
              />
              Any price
            </label>
            {PRICE_RANGES.map(r => (
              <label key={r.label} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', fontSize: '13px',
                color: priceRange === `${r.min}-${r.max}`
                  ? 'var(--color-text-primary)'
                  : 'var(--color-text-secondary)',
              }}>
                <input
                  type="radio" name="price"
                  value={`${r.min}-${r.max}`}
                  checked={priceRange === `${r.min}-${r.max}`}
                  onChange={e => setPriceRange(e.target.value)}
                  style={{ accentColor: '#1D9E75' }}
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        {/* Furnished */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
            Furnished
          </label>
          <select style={selectStyle} value={furnished} onChange={e => setFurnished(e.target.value)}>
            <option value="">Any</option>
            <option value="true">Furnished only</option>
            <option value="false">Unfurnished only</option>
          </select>
        </div>

        {/* Gender preference */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>
            Gender preference
          </label>
          <select style={selectStyle} value={gender} onChange={e => setGender(e.target.value)}>
            <option value="">Any</option>
            <option value="male">Boys only</option>
            <option value="female">Girls only</option>
          </select>
        </div>

        {/* Apply button */}
        <button
          onClick={applyFilters}
          style={{
            width: '100%', padding: '10px',
            background: '#1D9E75', color: '#fff',
            border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Apply filters
        </button>
      </div>
    </div>
  )
}
