import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import HostNav from './host-nav'
export default async function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirectTo=/host/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')        // ← was 'users' — that's the bug
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role === 'guest') {
    redirect('/dashboard')
  }

  if (profile.role === 'admin') {
    redirect('/admin/dashboard')
  }

  // Only hosts reach here
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-background-tertiary)' }}>
      {/* Top bar */}
      <div style={{
        background: 'var(--color-background-primary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '56px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link href="/" style={{
              fontSize: '18px',
              fontWeight: 500,
              color: '#1D9E75',
              textDecoration: 'none',
            }}>
              RoomEaze
            </Link>
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: '14px' }}>/</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              Host
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: '#FAEEDA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 500,
              color: '#633806',
            }}>
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              {profile.full_name}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{
          width: '200px',
          flexShrink: 0,
        }}>
          <HostNav />
        </div>

        {/* Page content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
