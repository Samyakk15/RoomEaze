import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const adminSupabase = createAdminClient()

  const [
    { count: totalUsers },
    { count: totalListings },
    { count: pendingListings },
    { count: activeListings },
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('listings').select('*', { count: 'exact', head: true }),
    adminSupabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminSupabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const { data: recentListings } = await adminSupabase
    .from('listings')
    .select('id, title, status, created_at, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
        Admin dashboard
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
        Welcome, {profile.full_name}
      </p>

      {/* Pending alert */}
      {(pendingListings ?? 0) > 0 && (
        <div style={{
          padding: '14px 16px',
          background: '#FAEEDA',
          border: '0.5px solid #EF9F27',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#633806',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span>{pendingListings} listing(s) waiting for your approval</span>
          <a href="/admin/listings/pending" style={{
            padding: '6px 14px',
            background: '#BA7517',
            color: '#fff',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            Review now
          </a>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
        {[
          { label: 'Total users',   value: totalUsers    ?? 0, color: '#378ADD' },
          { label: 'Total listings',value: totalListings ?? 0, color: '#534AB7' },
          { label: 'Active listings',value: activeListings?? 0, color: '#1D9E75' },
          { label: 'Pending review',value: pendingListings?? 0, color: '#BA7517' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px',
            borderRadius: '10px',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 500, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Nav links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px' }}>
        {[
          { label: 'Pending approvals', href: '/admin/listings/pending', color: '#BA7517' },
          { label: 'All listings',      href: '/admin/listings',         color: '#534AB7' },
          { label: 'All users',         href: '/admin/users',            color: '#378ADD' },
          { label: 'Back to site',      href: '/',                       color: '#1D9E75' },
        ].map(link => (
          <a key={link.href} href={link.href} style={{
            padding: '14px 18px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            color: link.color,
            background: 'var(--color-background-primary)',
            display: 'block',
          }}>
            {link.label} →
          </a>
        ))}
      </div>

      {/* Recent listings */}
      <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '14px' }}>Recently submitted listings</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {recentListings?.map((l: any) => (
          <div key={l.id} style={{
            padding: '12px 16px',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px',
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500 }}>{l.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                by {l.profiles?.full_name ?? 'Unknown'}
              </div>
            </div>
            <span style={{
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 500,
              background:
                l.status === 'active'   ? '#E1F5EE' :
                l.status === 'pending'  ? '#FAEEDA' :
                l.status === 'rejected' ? '#FCEBEB' : '#F1EFE8',
              color:
                l.status === 'active'   ? '#085041' :
                l.status === 'pending'  ? '#633806' :
                l.status === 'rejected' ? '#791F1F' : '#444441',
            }}>
              {l.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
