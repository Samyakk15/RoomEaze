'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// ✅ Created once at module scope — not on every render
const supabase = createClient()

const LOCALITIES = [
  'Dharampeth','Sitabuldi','Sadar','Civil Lines','Ramdaspeth',
  'Pratap Nagar','Manish Nagar','Hingna Road','Wardha Road',
  'Ambazari','Bajaj Nagar','Trimurti Nagar','Laxmi Nagar',
  'Shankar Nagar','Bhandara Road','Kamptee Road','Katol Road',
  'Nandanvan','Sakkardara','Godhni','Congress Nagar',
  'Surendra Nagar','Indora','Kalamna','Wadi',
]

const AMENITIES_LIST = [
  'WiFi','AC','Geyser','Washing Machine','Parking',
  'Power Backup','CCTV','Meals Included','Attached Bathroom',
  'Study Table','Wardrobe','Fridge','Housekeeping','Water Purifier',
]

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '0.5px solid var(--color-border-secondary)',
  borderRadius: '8px',
  fontSize: '13px',
  background: 'var(--color-background-primary)',
  color: 'var(--color-text-primary)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 500,
  display: 'block',
  marginBottom: '6px',
}

export default function EditListingForm({ listing }: { listing: any }) {
  const router = useRouter()

  // ── Pre-fill all fields from existing listing ──
  const [title, setTitle]         = useState(listing.title ?? '')
  const [type, setType]           = useState(listing.type ?? 'pg')
  const [locality, setLocality]   = useState(listing.locality ?? '')
  const [address, setAddress]     = useState(listing.address ?? '')
  const [availableFrom, setAvailableFrom] = useState(
    listing.available_from
      ? listing.available_from.split('T')[0]
      : ''
  )
  const [price, setPrice]         = useState(String(listing.price_per_month ?? ''))
  const [deposit, setDeposit]     = useState(String(listing.security_deposit ?? '0'))
  const [occupancy, setOccupancy] = useState(String(listing.max_occupancy ?? '1'))
  const [furnished, setFurnished] = useState(listing.is_furnished ?? false)
  const [gender, setGender]       = useState(listing.gender_preference ?? 'any')
  const [description, setDescription] = useState(listing.description ?? '')
  const [amenities, setAmenities] = useState<string[]>(
    listing.amenities?.map((a: any) => a.name) ?? []
  )

  // ── Image state ──
  // existingImages = already uploaded to Supabase
  // newImages      = new files selected by user
  const [existingImages, setExistingImages] = useState<any[]>(
    listing.listing_images ?? []
  )
  const [newImageFiles, setNewImageFiles]   = useState<File[]>([])
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const totalImages = existingImages.length + newImageFiles.length

  function toggleAmenity(name: string) {
    setAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  function handleNewImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files    = Array.from(e.target.files ?? [])
    const canAdd   = 5 - totalImages
    const toAdd    = files.slice(0, canAdd)
    setNewImageFiles(prev => [...prev, ...toAdd])
    toAdd.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev =>
        setNewImagePreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function removeExistingImage(imageId: string) {
    setExistingImages(prev => prev.filter((img: any) => img.id !== imageId))
  }

  function removeNewImage(index: number) {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  function validate() {
    if (!title.trim() || title.length < 5) {
      setError('Title must be at least 5 characters')
      return false
    }
    if (!locality) {
      setError('Please select a locality')
      return false
    }
    if (!address.trim()) {
      setError('Please enter the full address')
      return false
    }
    if (!price || Number(price) < 500) {
      setError('Price must be at least ₹500')
      return false
    }
    if (!description.trim() || description.length < 20) {
      setError('Description must be at least 20 characters')
      return false
    }
    if (totalImages === 0) {
      setError('At least one photo is required')
      return false
    }
    return true
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const user = sessionData?.session?.user

      if (!user) {
        setError('Session expired. Please refresh the page.')
        setLoading(false)
        return
      }

      // ── Delete removed existing images from storage ──────
      const remainingIds  = existingImages.map((i: any) => i.id)
      const removedImages = (listing.listing_images ?? []).filter(
        (i: any) => !remainingIds.includes(i.id)
      )

      if (removedImages.length > 0) {
        const storagePaths = removedImages
          .map((img: any) => {
            try {
              const url  = new URL(img.url)
              const path = url.pathname
                .split('/storage/v1/object/public/listing-images/')[1]
              return path ? decodeURIComponent(path) : null
            } catch { return null }
          })
          .filter(Boolean) as string[]

        if (storagePaths.length > 0) {
          await supabase.storage
            .from('listing-images')
            .remove(storagePaths)
        }

        await supabase
          .from('listing_images')
          .delete()
          .in('id', removedImages.map((i: any) => i.id))
      }

      // ── Upload new images ────────────────────────────────
      const newUploadedUrls: { url: string; is_primary: boolean }[] = []

      for (let i = 0; i < newImageFiles.length; i++) {
        const file = newImageFiles[i]
        const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadErr } = await supabase.storage
          .from('listing-images')
          .upload(path, file, {
            contentType:  file.type,
            upsert:       false,
            cacheControl: '3600',
          })

        if (uploadErr) {
          setError(`Photo upload failed: ${uploadErr.message}`)
          setLoading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        const isPrimary = existingImages.length === 0 && i === 0
        newUploadedUrls.push({ url: publicUrl, is_primary: isPrimary })
      }

      // Insert new image rows
      if (newUploadedUrls.length > 0) {
        await supabase.from('listing_images').insert(
          newUploadedUrls.map(img => ({
            listing_id: listing.id,
            url:        img.url,
            is_primary: img.is_primary,
          }))
        )
      }

      // Make sure at least one image is primary
      const { data: allImages } = await supabase
        .from('listing_images')
        .select('id, is_primary')
        .eq('listing_id', listing.id)

      const hasPrimary = allImages?.some((i: any) => i.is_primary)
      if (!hasPrimary && allImages && allImages.length > 0) {
        await supabase
          .from('listing_images')
          .update({ is_primary: true })
          .eq('id', allImages[0].id)
      }

      // ── Update listing row ───────────────────────────────
      const { error: updateErr } = await supabase
        .from('listings')
        .update({
          title:             title.trim(),
          description:       description.trim(),
          type:              type,
          address:           address.trim(),
          city:              'Nagpur',
          locality:          locality,
          price_per_month:   Number(price),
          security_deposit:  Number(deposit) || 0,
          available_from:    availableFrom || null,
          is_furnished:      furnished,
          gender_preference: gender,
          max_occupancy:     Number(occupancy) || 1,
          status:            'pending',
          rejection_reason:  null,
        })
        .eq('id', listing.id)

      if (updateErr) {
        setError(`Could not save: ${updateErr.message}`)
        setLoading(false)
        return
      }

      // ── Replace amenities ────────────────────────────────
      await supabase
        .from('amenities')
        .delete()
        .eq('listing_id', listing.id)

      if (amenities.length > 0) {
        await supabase.from('amenities').insert(
          amenities.map(name => ({ listing_id: listing.id, name }))
        )
      }

      // ── Success ──────────────────────────────────────────
      router.push('/host/listings')
      router.refresh()

    } catch (err: any) {
      setError(
        err?.message?.includes('fetch')
          ? 'Network error — check your internet and try again.'
          : (err?.message ?? 'Something went wrong. Please try again.')
      )
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave}>
      {/* Re-approval warning */}
      <div style={{
        padding: '12px 16px',
        background: '#FAEEDA',
        border: '0.5px solid #EF9F27',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#633806',
        marginBottom: '24px',
      }}>
        ⚠️ After saving, your listing will go back to <strong>pending</strong> status and needs admin approval before going live again.
      </div>

      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>

        {/* ── BASIC INFO ── */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', paddingBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            Basic information
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div>
              <label style={labelStyle}>Title *</label>
              <input
                style={inputStyle}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Spacious PG near VNIT"
              />
            </div>

            <div>
              <label style={labelStyle}>Room type *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {['pg','room','flat','hostel'].map(t => (
                  <div
                    key={t}
                    onClick={() => setType(t)}
                    style={{
                      padding: '10px 8px', textAlign: 'center',
                      border: `2px solid ${type === t ? '#1D9E75' : 'var(--color-border-tertiary)'}`,
                      borderRadius: '8px', cursor: 'pointer',
                      background: type === t ? '#E1F5EE' : 'var(--color-background-secondary)',
                      fontSize: '13px', fontWeight: type === t ? 500 : 400,
                      color: type === t ? '#085041' : 'var(--color-text-secondary)',
                    }}
                  >
                    {t === 'pg' ? 'PG' : t.charAt(0).toUpperCase() + t.slice(1)}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Locality *</label>
                <select
                  style={inputStyle}
                  value={locality}
                  onChange={e => setLocality(e.target.value)}
                >
                  <option value="">Select locality</option>
                  {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Available from</label>
                <input
                  type="date"
                  style={inputStyle}
                  value={availableFrom}
                  onChange={e => setAvailableFrom(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Full address *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '72px', resize: 'vertical' }}
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street, landmark, area..."
              />
            </div>
          </div>
        </div>

        {/* ── PRICING & DETAILS ── */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '16px', paddingBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            Pricing &amp; details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Monthly rent (₹) *</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min={500}
                />
              </div>
              <div>
                <label style={labelStyle}>Security deposit (₹)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={deposit}
                  onChange={e => setDeposit(e.target.value)}
                  min={0}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Max occupancy</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={occupancy}
                  onChange={e => setOccupancy(e.target.value)}
                  min={1} max={10}
                />
              </div>
              <div>
                <label style={labelStyle}>Gender preference</label>
                <select style={inputStyle} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="any">Any</option>
                  <option value="male">Boys only</option>
                  <option value="female">Girls only</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Furnished?</label>
                <select
                  style={inputStyle}
                  value={furnished ? 'yes' : 'no'}
                  onChange={e => setFurnished(e.target.value === 'yes')}
                >
                  <option value="yes">Furnished</option>
                  <option value="no">Unfurnished</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Description * ({description.length}/500)</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Describe the room..."
              />
            </div>
          </div>
        </div>

        {/* ── AMENITIES ── */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '14px', paddingBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            Amenities
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AMENITIES_LIST.map(a => {
              const selected = amenities.includes(a)
              return (
                <div
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  style={{
                    padding: '6px 14px',
                    border: `1.5px solid ${selected ? '#1D9E75' : 'var(--color-border-tertiary)'}`,
                    borderRadius: '20px', cursor: 'pointer',
                    background: selected ? '#E1F5EE' : 'var(--color-background-secondary)',
                    fontSize: '12px',
                    fontWeight: selected ? 500 : 400,
                    color: selected ? '#085041' : 'var(--color-text-secondary)',
                    userSelect: 'none',
                    transition: 'all .15s',
                  }}
                >
                  {selected ? '✓ ' : ''}{a}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── PHOTOS ── */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '14px', paddingBottom: '8px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            Photos ({totalImages}/5)
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Current photos — click × to remove
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {existingImages.map((img: any, i: number) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3' }}>
                    <img
                      src={img.url}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {img.is_primary && (
                      <div style={{
                        position: 'absolute', top: '4px', left: '4px',
                        background: '#1D9E75', color: '#fff',
                        fontSize: '9px', fontWeight: 500,
                        padding: '2px 6px', borderRadius: '3px',
                      }}>
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '20px', height: '20px',
                        background: 'rgba(0,0,0,0.65)', color: '#fff',
                        border: 'none', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New image upload */}
          {totalImages < 5 && (
            <label style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '24px',
              border: '2px dashed var(--color-border-secondary)',
              borderRadius: '10px', cursor: 'pointer',
              background: 'var(--color-background-secondary)',
              marginBottom: '10px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '6px' }}>📷</div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>
                Add more photos ({5 - totalImages} remaining)
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleNewImages}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {/* New image previews */}
          {newImagePreviews.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                New photos to upload
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                {newImagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', top: '4px', left: '4px',
                      background: '#BA7517', color: '#fff',
                      fontSize: '9px', fontWeight: 500,
                      padding: '2px 6px', borderRadius: '3px',
                    }}>
                      New
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(i)}
                      style={{
                        position: 'absolute', top: '4px', right: '4px',
                        width: '20px', height: '20px',
                        background: 'rgba(0,0,0,0.65)', color: '#fff',
                        border: 'none', borderRadius: '50%', cursor: 'pointer',
                        fontSize: '12px', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px 14px',
            background: '#FCEBEB',
            border: '0.5px solid #F5BCBC',
            borderRadius: '8px',
            fontSize: '13px', color: '#791F1F',
          }}>
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => router.push('/host/listings')}
            style={{
              padding: '10px 20px',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: '8px', background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 28px',
              background: loading ? '#ccc' : '#1D9E75',
              color: '#fff', border: 'none',
              borderRadius: '8px', fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving changes...' : 'Save and submit for review'}
          </button>
        </div>
      </div>
    </form>
  )
}
