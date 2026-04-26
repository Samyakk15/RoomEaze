'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'guest' | 'host' | ''>('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!role) {
      setError('Please select whether you are a student or room owner')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role:      role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    // Wait a moment for the DB trigger to create the profile row
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Fetch the profile to confirm role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const userRole = profile?.role ?? role

    // Redirect based on role
    if (userRole === 'host') {
      router.replace('/host/dashboard')
    } else if (userRole === 'admin') {
      router.replace('/admin/dashboard')
    } else {
      router.replace('/dashboard')
    }

    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--color-background-tertiary)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '16px',
        padding: '32px',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>
          Create your account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
          Join RoomEaze — Nagpur&apos;s student housing platform
        </p>

        <form onSubmit={handleRegister}>
          {/* Full name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Full name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
              style={{ width: '100%' }}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              style={{ width: '100%' }}
            />
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, display: 'block', marginBottom: '10px' }}>
              I am a...
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Student card */}
              <div
                onClick={() => setRole('guest')}
                style={{
                  padding: '16px',
                  border: `2px solid ${role === 'guest' ? '#1D9E75' : 'var(--color-border-tertiary)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: role === 'guest' ? '#E1F5EE' : 'var(--color-background-secondary)',
                  transition: 'all .15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🎓</div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: role === 'guest' ? '#085041' : 'var(--color-text-primary)',
                }}>
                  Student
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Looking for a room
                </div>
              </div>

              {/* Host card */}
              <div
                onClick={() => setRole('host')}
                style={{
                  padding: '16px',
                  border: `2px solid ${role === 'host' ? '#BA7517' : 'var(--color-border-tertiary)'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: role === 'host' ? '#FAEEDA' : 'var(--color-background-secondary)',
                  transition: 'all .15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>🏠</div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: role === 'host' ? '#633806' : 'var(--color-text-primary)',
                }}>
                  Room Owner
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Want to list a room
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'var(--color-background-danger)',
              border: '0.5px solid var(--color-border-danger)',
              color: 'var(--color-text-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: loading ? 'var(--color-background-secondary)' : '#1D9E75',
              color: loading ? 'var(--color-text-secondary)' : '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '20px' }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#1D9E75', textDecoration: 'none', fontWeight: 500 }}>
            Login
          </a>
        </p>
      </div>
    </div>
  )
}
