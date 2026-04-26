'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [show,     setShow]     = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', data.user.id).single()

    const redirectTo = searchParams.get('redirectTo')
    if (redirectTo) { router.push(redirectTo); router.refresh(); return }

    if (profile?.role === 'admin')     router.push('/admin/dashboard')
    else if (profile?.role === 'host') router.push('/host/dashboard')
    else                               router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: '#f5f4f1',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <a href="/" style={{ fontSize: '24px', fontWeight: 700, color: '#1D9E75', textDecoration: 'none' }}>
            RoomEaze
          </a>
          <div style={{ fontSize: '14px', color: '#888', marginTop: '4px' }}>
            Welcome back — sign in to continue
          </div>
        </div>

        <div className="form-box">
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            <div className="form-field">
              <label className="form-label">Email address</label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={show ? 'text' : 'password'} required
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
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

            {error && <div className="alert-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '20px' }}>
          Don&apos;t have an account?{' '}
          <a href="/register" style={{ color: '#1D9E75', fontWeight: 500, textDecoration: 'none' }}>
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}
