'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function StudentProfileForm({ profile }: { profile: any }) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [phone,    setPhone]    = useState(profile.phone ?? '')
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState('')
  const router = useRouter()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Name is required'); return }
    setError(''); setLoading(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null })
      .eq('id', profile.id)

    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    setSuccess(true)
    router.refresh()
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="form-box">
      {/* Avatar row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px', paddingBottom: '18px', borderBottom: '1px solid #f0ede8' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: '#E1F5EE', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '20px', fontWeight: 600,
          color: '#085041', border: '2px solid #5DCAA5',
        }}>
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600 }}>{profile.full_name}</div>
          <div style={{
            display: 'inline-block', marginTop: '4px',
            padding: '2px 10px', background: '#E1F5EE', borderRadius: '20px',
            fontSize: '11px', fontWeight: 600, color: '#085041',
            border: '1px solid #5DCAA5',
          }}>
            🎓 Student
          </div>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div className="form-row" style={{ marginBottom: '18px' }}>
          <div className="form-field">
            <label className="form-label">Full name <span className="required">*</span></label>
            <input
              type="text" required
              value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Phone number</label>
            <input
              type="tel"
              value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <div className="form-field" style={{ marginBottom: '18px' }}>
          <label className="form-label">Email address</label>
          <input type="email" value={profile.email} readOnly />
          <div className="form-hint">Email cannot be changed</div>
        </div>

        {error   && <div className="alert-error" style={{ marginBottom: '14px' }}>{error}</div>}
        {success && <div className="alert-success" style={{ marginBottom: '14px' }}>✓ Profile updated</div>}

        <button type="submit" className="btn-primary" disabled={loading}
          style={{ padding: '10px 28px' }}>
          {loading ? 'Saving...' : 'Save profile'}
        </button>
      </form>
    </div>
  )
}
