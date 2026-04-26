'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [role,     setRole]     = useState<'guest'|'host'|''>('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!role) { setError('Please select your account type'); return }
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user)  { setError('Something went wrong. Try again.'); setLoading(false); return }

    await new Promise(r => setTimeout(r, 800))

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    const userRole = profile?.role ?? role
    if (userRole === 'host')  router.push('/host/dashboard')
    else                      router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: '#f5f4f1',
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: 700, color: '#1D9E75', textDecoration: 'none' }}>
            RoomEaze
          </a>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
            Create your account — it&apos;s free
          </div>
        </div>

        <div className="form-box">
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div className="form-field">
              <label className="form-label">Full name <span className="required">*</span></label>
              <input
                type="text" required
                value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Email address <span className="required">*</span></label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password <span className="required">*</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} required minLength={8}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShow(s => !s)} style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', fontSize: '13px', color: '#888',
                }}>
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Role selector */}
            <div className="form-field">
              <label className="form-label">I am a... <span className="required">*</span></label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '4px' }}>
                {[
                  { value: 'guest', emoji: '🎓', title: 'Student', sub: 'Looking for a room' },
                  { value: 'host',  emoji: '🏠', title: 'Room Owner', sub: 'Want to list a room' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setRole(opt.value as any)}
                    style={{
                      padding: '16px 12px', textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${role === opt.value ? '#1D9E75' : '#e2e0db'}`,
                      borderRadius: '10px', transition: 'all .15s',
                      background: role === opt.value ? '#E1F5EE' : '#fafaf9',
                    }}
                  >
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>{opt.emoji}</div>
                    <div style={{
                      fontSize: '14px', fontWeight: 600,
                      color: role === opt.value ? '#085041' : '#333',
                    }}>{opt.title}</div>
                    <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{opt.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#1D9E75', fontWeight: 500, textDecoration: 'none' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  )
}
