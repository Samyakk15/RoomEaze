'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const LOCALITIES = [
  'Dharampeth','Sitabuldi','Sadar','Civil Lines','Ramdaspeth',
  'Pratap Nagar','Manish Nagar','Hingna Road','Wardha Road',
  'Ambazari','Bajaj Nagar','Trimurti Nagar','Laxmi Nagar',
  'Shankar Nagar','Bhandara Road','Kamptee Road','Katol Road',
  'Nandanvan','Sakkardara','Godhni','Congress Nagar',
  'Surendra Nagar','Indora','Kalamna','Wadi',
]

const AMENITIES = [
  'WiFi','AC','Geyser','Washing Machine','Parking',
  'Power Backup','CCTV','Meals Included','Attached Bathroom',
  'Study Table','Wardrobe','Fridge','Housekeeping','Water Purifier',
]

const inp: React.CSSProperties = {
  width:'100%', padding:'9px 12px',
  border:'0.5px solid #d1cfc9', borderRadius:'8px',
  fontSize:'13px', outline:'none',
  background:'#fff', color:'#1a1a1a',
}

const lbl: React.CSSProperties = {
  fontSize:'13px', fontWeight:500,
  display:'block', marginBottom:'6px',
}

// Uses the singleton — same instance everywhere
const supabase = createClient()

export default function NewListingPage() {
  const router = useRouter()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const [title,         setTitle]         = useState('')
  const [type,          setType]          = useState('pg')
  const [locality,      setLocality]      = useState('')
  const [address,       setAddress]       = useState('')
  const [availableFrom, setAvailableFrom] = useState('')
  const [price,         setPrice]         = useState('')
  const [deposit,       setDeposit]       = useState('0')
  const [occupancy,     setOccupancy]     = useState('1')
  const [furnished,     setFurnished]     = useState(false)
  const [gender,        setGender]        = useState('any')
  const [description,   setDescription]   = useState('')
  const [amenities,     setAmenities]     = useState<string[]>([])
  const [images,        setImages]        = useState<File[]>([])
  const [previews,      setPreviews]      = useState<string[]>([])

  function toggleAmenity(name: string) {
    setAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const toAdd = files.slice(0, 5 - images.length)
    setImages(prev => [...prev, ...toAdd])
    toAdd.forEach(f => {
      const reader = new FileReader()
      reader.onload = ev =>
        setPreviews(prev => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  function removeImage(i: number) {
    setImages(prev => prev.filter((_, j) => j !== i))
    setPreviews(prev => prev.filter((_, j) => j !== i))
  }

  function validateStep1() {
    if (!title.trim())   { setError('Title is required'); return false }
    if (!locality)       { setError('Select a locality'); return false }
    if (!address.trim()) { setError('Address is required'); return false }
    setError(''); return true
  }

  function validateStep2() {
    if (!price || Number(price) < 500) { setError('Price must be at least ₹500'); return false }
    if (!description.trim())           { setError('Description is required'); return false }
    setError(''); return true
  }

  async function handleSubmit() {
    // Show ALL localStorage keys so we can find the right one
    console.log('ALL KEYS:', Object.keys(localStorage))
    console.log('ALL VALUES:', Object.keys(localStorage).map(k => ({ key: k, value: localStorage.getItem(k)?.slice(0, 100) })))

    if (images.length === 0) {
      setError('Please upload at least one photo')
      return
    }

    setLoading(true)
    setError('')

    // Try every possible way to get the user ID
    let userId = ''
    const supabase = createClient()

    // Method 1 — direct getSession with timeout
    try {
      const result = await Promise.race([
        supabase.auth.getSession(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 3000)
        )
      ]) as any
      userId = result?.data?.session?.user?.id ?? ''
      console.log('Method 1 userId:', userId)
    } catch (e) {
      console.log('Method 1 failed:', e)
    }

    // Method 2 — read from localStorage directly
    if (!userId) {
      try {
        const keys = Object.keys(localStorage)
        console.log('localStorage keys:', keys)
        for (const key of keys) {
          const val = localStorage.getItem(key) ?? ''
          if (!val) continue
          try {
            const parsed = JSON.parse(val)
            // Check various structures
            if (parsed?.user?.id) { userId = parsed.user.id; break }
            if (parsed?.session?.user?.id) { userId = parsed.session.user.id; break }
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (item?.user?.id) { userId = item.user.id; break }
              }
            }
          } catch {}
        }
        console.log('Method 2 userId:', userId)
      } catch (e) {
        console.log('Method 2 failed:', e)
      }
    }

    // Method 3 — decode JWT from localStorage
    if (!userId) {
      try {
        const keys = Object.keys(localStorage)
        for (const key of keys) {
          const val = localStorage.getItem(key) ?? ''
          // Look for anything that looks like a JWT
          const jwtMatch = val.match(/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/)
          if (jwtMatch) {
            try {
              const payload = JSON.parse(atob(jwtMatch[0].split('.')[1]))
              if (payload?.sub) { userId = payload.sub; break }
            } catch {}
          }
        }
        console.log('Method 3 userId:', userId)
      } catch (e) {
        console.log('Method 3 failed:', e)
      }
    }

    console.log('FINAL userId:', userId)

    if (!userId) {
      setError(`Session not found. Open console and paste the localStorage keys to support. Note: You must log in first.`)
      setLoading(false)
      return
    }

    try {
      // Upload images
      const uploaded: { url: string; is_primary: boolean }[] = []

      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const path = `${userId}/${Date.now()}-${i}.${ext}`

        const { error: upErr } = await supabase.storage
          .from('listing-images')
          .upload(path, file, { contentType: file.type, upsert: true })

        if (upErr) {
          setError(`Photo ${i + 1} upload failed: ${upErr.message}`)
          setLoading(false)
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from('listing-images')
          .getPublicUrl(path)

        uploaded.push({ url: publicUrl, is_primary: i === 0 })
      }

      // Insert listing
      const { data: listing, error: listErr } = await supabase
        .from('listings')
        .insert({
          host_id:           userId,
          title:             title.trim(),
          description:       description.trim(),
          type,
          address:           address.trim(),
          city:              'Nagpur',
          locality,
          price_per_month:   Number(price),
          security_deposit:  Number(deposit) || 0,
          available_from:    availableFrom || null,
          is_furnished:      furnished,
          gender_preference: gender,
          max_occupancy:     Number(occupancy) || 1,
          status:            'pending',
        })
        .select('id')
        .single()

      if (listErr || !listing) {
        setError(`Save failed: ${listErr?.message ?? 'unknown'}`)
        setLoading(false)
        return
      }

      // Insert image rows
      await supabase.from('listing_images').insert(
        uploaded.map(u => ({
          listing_id: listing.id,
          url:        u.url,
          is_primary: u.is_primary,
        }))
      )

      // Insert amenities
      if (amenities.length > 0) {
        await supabase.from('amenities').insert(
          amenities.map(n => ({ listing_id: listing.id, name: n }))
        )
      }

      router.push('/host/listings')
      router.refresh()

    } catch (err: any) {
      setError(err?.message ?? 'Unexpected error')
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'20px', fontWeight:500, marginBottom:'4px' }}>Add new listing</h1>
        <p style={{ fontSize:'13px', color:'#888' }}>Goes live after admin approval</p>
      </div>

      {/* Step indicator */}
      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'28px' }}>
        {['Basic info','Details','Photos'].map((label, i) => {
          const n = i + 1
          return (
            <div key={n} style={{ display:'flex', alignItems:'center', gap:'8px', flex: n < 3 ? 1 : 'none' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{
                  width:'26px', height:'26px', borderRadius:'50%',
                  background: n <= step ? '#1D9E75' : '#eee',
                  color: n <= step ? '#fff' : '#999',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'12px', fontWeight:600, flexShrink:0,
                }}>
                  {n < step ? '✓' : n}
                </div>
                <span style={{ fontSize:'13px', fontWeight: n === step ? 500 : 400, color: n === step ? '#1a1a1a' : '#999' }}>
                  {label}
                </span>
              </div>
              {n < 3 && <div style={{ flex:1, height:'1px', background: n < step ? '#1D9E75' : '#eee' }} />}
            </div>
          )
        })}
      </div>

      <div style={{ background:'#fff', border:'0.5px solid #e2e0db', borderRadius:'12px', padding:'28px' }}>

        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div>
              <label style={lbl}>Title *</label>
              <input style={inp} value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Spacious PG near VNIT" />
            </div>
            <div>
              <label style={lbl}>Room type *</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
                {['pg','room','flat','hostel'].map(t => (
                  <div key={t} onClick={() => setType(t)} style={{
                    padding:'11px 8px', textAlign:'center', cursor:'pointer',
                    border:`2px solid ${type===t?'#1D9E75':'#e2e0db'}`,
                    borderRadius:'8px', fontSize:'13px',
                    background: type===t?'#E1F5EE':'#fafaf9',
                    color: type===t?'#085041':'#666',
                    fontWeight: type===t?500:400,
                  }}>
                    {t==='pg'?'PG':t.charAt(0).toUpperCase()+t.slice(1)}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Locality *</label>
              <select style={inp} value={locality} onChange={e => setLocality(e.target.value)}>
                <option value="">Select locality</option>
                {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Full address *</label>
              <textarea style={{ ...inp, minHeight:'72px', resize:'vertical' }}
                value={address} onChange={e => setAddress(e.target.value)}
                placeholder="Street, landmark, area..." />
            </div>
            <div>
              <label style={lbl}>Available from</label>
              <input type="date" style={inp} value={availableFrom}
                onChange={e => setAvailableFrom(e.target.value)}
                min={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div>
                <label style={lbl}>Monthly rent (₹) *</label>
                <input type="number" style={inp} value={price}
                  onChange={e => setPrice(e.target.value)} placeholder="5000" min={500} />
              </div>
              <div>
                <label style={lbl}>Security deposit (₹)</label>
                <input type="number" style={inp} value={deposit}
                  onChange={e => setDeposit(e.target.value)} placeholder="0" />
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
              <div>
                <label style={lbl}>Max occupancy</label>
                <input type="number" style={inp} value={occupancy}
                  onChange={e => setOccupancy(e.target.value)} min={1} max={10} />
              </div>
              <div>
                <label style={lbl}>Gender preference</label>
                <select style={inp} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="any">Any</option>
                  <option value="male">Boys only</option>
                  <option value="female">Girls only</option>
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Furnished?</label>
              <div style={{ display:'flex', gap:'10px' }}>
                {[{label:'Furnished',val:true},{label:'Unfurnished',val:false}].map(o=>(
                  <div key={String(o.val)} onClick={()=>setFurnished(o.val)} style={{
                    padding:'9px 20px', cursor:'pointer',
                    border:`2px solid ${furnished===o.val?'#1D9E75':'#e2e0db'}`,
                    borderRadius:'8px', fontSize:'13px',
                    background:furnished===o.val?'#E1F5EE':'#fafaf9',
                    color:furnished===o.val?'#085041':'#666',
                    fontWeight:furnished===o.val?500:400,
                  }}>{o.label}</div>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Description * ({description.length}/500)</label>
              <textarea style={{ ...inp, minHeight:'90px', resize:'vertical' }}
                value={description} onChange={e => setDescription(e.target.value)}
                maxLength={500} placeholder="Describe the room..." />
            </div>
            <div>
              <label style={lbl}>Amenities</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'7px' }}>
                {AMENITIES.map(a => {
                  const sel = amenities.includes(a)
                  return (
                    <div key={a} onClick={()=>toggleAmenity(a)} style={{
                      padding:'5px 13px', cursor:'pointer', userSelect:'none',
                      border:`1.5px solid ${sel?'#1D9E75':'#e2e0db'}`,
                      borderRadius:'20px', fontSize:'12px',
                      background:sel?'#E1F5EE':'#fafaf9',
                      color:sel?'#085041':'#666', fontWeight:sel?500:400,
                    }}>
                      {sel?'✓ ':''}{a}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
            <div>
              <label style={lbl}>Photos * ({images.length}/5)</label>
              {images.length < 5 && (
                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center',
                  justifyContent:'center', padding:'28px', cursor:'pointer',
                  border:'2px dashed #d1cfc9', borderRadius:'10px',
                  background:'#fafaf9', marginBottom:'14px',
                }}>
                  <div style={{ fontSize:'28px', marginBottom:'6px' }}>📷</div>
                  <div style={{ fontSize:'13px', fontWeight:500 }}>Click to upload photos</div>
                  <div style={{ fontSize:'12px', color:'#888', marginTop:'3px' }}>
                    JPG, PNG, WEBP · Max 5MB each · Up to {5-images.length} more
                  </div>
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                    multiple onChange={handleImageSelect} style={{ display:'none' }} />
                </label>
              )}
              {previews.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                  {previews.map((src, i) => (
                    <div key={i} style={{ position:'relative', borderRadius:'8px', overflow:'hidden', aspectRatio:'4/3' }}>
                      <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      {i === 0 && (
                        <div style={{
                          position:'absolute', top:'6px', left:'6px',
                          background:'#1D9E75', color:'#fff',
                          fontSize:'10px', fontWeight:500, padding:'2px 7px', borderRadius:'4px',
                        }}>Primary</div>
                      )}
                      <button type="button" onClick={() => removeImage(i)} style={{
                        position:'absolute', top:'6px', right:'6px',
                        width:'22px', height:'22px', background:'rgba(0,0,0,0.6)',
                        color:'#fff', border:'none', borderRadius:'50%',
                        cursor:'pointer', fontSize:'13px',
                        display:'flex', alignItems:'center', justifyContent:'center',
                      }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{
              padding:'14px', background:'#fafaf9',
              border:'0.5px solid #e2e0db', borderRadius:'8px', fontSize:'13px',
            }}>
              <div style={{ fontWeight:500, marginBottom:'8px' }}>Listing summary</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'4px', color:'#666' }}>
                <div>📌 {title}</div>
                <div>📍 {locality}, Nagpur</div>
                <div>🏠 {type.toUpperCase()} · {furnished?'Furnished':'Unfurnished'}</div>
                <div>💰 ₹{price}/month · ₹{deposit} deposit</div>
                <div>👥 Max {occupancy} · {gender==='any'?'Any gender':gender==='male'?'Boys only':'Girls only'}</div>
                {amenities.length > 0 && <div>✓ {amenities.join(', ')}</div>}
              </div>
              <div style={{
                marginTop:'10px', padding:'8px 12px', background:'#FAEEDA',
                borderRadius:'6px', fontSize:'12px', color:'#854F0B',
              }}>
                After submitting, your listing will be reviewed by an admin before going live.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            marginTop:'14px', padding:'10px 14px',
            background:'#FCEBEB', border:'0.5px solid #F5BCBC',
            borderRadius:'8px', fontSize:'13px', color:'#791F1F',
          }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'24px' }}>
          <div>
            {step > 1 && (
              <button type="button" onClick={() => { setStep(s=>s-1); setError('') }} style={{
                padding:'10px 20px', border:'0.5px solid #d1cfc9',
                borderRadius:'8px', background:'#fafaf9', color:'#666',
                fontSize:'13px', fontWeight:500, cursor:'pointer',
              }}>← Back</button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button type="button" onClick={() => {
                const ok = step === 1 ? validateStep1() : validateStep2()
                if (ok) setStep(s => s+1)
              }} style={{
                padding:'10px 24px', background:'#1D9E75', color:'#fff',
                border:'none', borderRadius:'8px',
                fontSize:'13px', fontWeight:500, cursor:'pointer',
              }}>Next →</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} style={{
                padding:'10px 28px',
                background: loading ? '#ccc' : '#1D9E75',
                color:'#fff', border:'none', borderRadius:'8px',
                fontSize:'13px', fontWeight:500,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}>
                {loading ? 'Submitting...' : 'Submit listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
