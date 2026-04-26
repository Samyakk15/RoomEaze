'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function HostProfileForm({ profile }: { profile: any }) {
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
    <div className="form-box" style={{ maxWidth: '560px' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f0ede8' }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: '#FAEEDA', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px', fontWeight: 600, color: '#633806',
          border: '2px solid #EF9F27',
        }}>
          {profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>{profile.full_name}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
            Host · Member since {new Date(profile.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
          </div>
          <div style={{
            display: 'inline-block', marginTop: '4px',
            padding: '2px 10px', background: '#FAEEDA', borderRadius: '20px',
            fontSize: '11px', fontWeight: 600, color: '#633806',
            border: '1px solid #EF9F27',
          }}>
            🏠 Room Owner
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-field">
          <label className="form-label">Full name <span className="required">*</span></label>
          <input
            type="text" required
            value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            Phone number
            <span style={{ fontSize: '11px', color: '#999', fontWeight: 400, marginLeft: '6px' }}>
              shown to students after request accepted
            </span>
          </label>
          <input
            type="tel"
            value={phone} onChange={e => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Email address</label>
          <input type="email" value={profile.email} readOnly />
          <div className="form-hint">Email cannot be changed</div>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">✓ Profile updated successfully</div>}

        <button type="submit" className="btn-primary" disabled={loading}
          style={{ padding: '11px' }}>
          {loading ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
