import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminListingActions from '@/components/admin/AdminListingActions'

export default async function AdminAllListingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const adminSupabase = createAdminClient()
  const statusFilter  = searchParams.status

  let query = adminSupabase
    .from('listings')
    .select(`
      id, title, type, locality, price_per_month,
      status, rejection_reason, created_at,
      listing_images (url, is_primary),
      profiles (full_name, email)
    `)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: listings } = await query

  const tabs = ['all', 'active', 'pending', 'rejected', 'inactive']

  const statusStyle = (s: string) => ({
    bg:
      s === 'active'   ? '#E1F5EE' :
      s === 'pending'  ? '#FAEEDA' :
      s === 'rejected' ? '#FCEBEB' : '#F1EFE8',
    text:
      s === 'active'   ? '#085041' :
      s === 'pending'  ? '#633806' :
      s === 'rejected' ? '#791F1F' : '#444441',
  })

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>All listings</h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {listings?.length ?? 0} listing(s) {statusFilter && statusFilter !== 'all' ? `— ${statusFilter}` : ''}
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        marginBottom: '20px',
      }}>
        {tabs.map(t => {
          const active = (statusFilter ?? 'all') === t
          return (
            <a
              key={t}
              href={`/admin/listings${t === 'all' ? '' : `?status=${t}`}`}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? '#534AB7' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                borderBottom: `2px solid ${active ? '#534AB7' : 'transparent'}`,
                marginBottom: '-0.5px',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </a>
          )
        })}
      </div>

      {!listings || listings.length === 0 ? (
        <div style={{
          padding: '60px', textAlign: 'center',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          background: 'var(--color-background-secondary)',
          fontSize: '14px', color: 'var(--color-text-secondary)',
        }}>
          No {statusFilter && statusFilter !== 'all' ? statusFilter : ''} listings found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {listings.map((l: any) => {
            const sc  = statusStyle(l.status)
            const img = l.listing_images?.find((i: any) => i.is_primary)?.url
                     ?? l.listing_images?.[0]?.url

            return (
              <div key={l.id} style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}>
                {/* Thumbnail */}
                <div style={{
                  width: '64px', height: '64px',
                  borderRadius: '8px',
                  background: '#F1EFE8',
                  flexShrink: 0, overflow: 'hidden',
                }}>
                  {img
                    ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🏠</div>
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{l.title}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 500,
                      padding: '2px 8px', borderRadius: '20px',
                      background: sc.bg, color: sc.text,
                    }}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                    {l.locality}, Nagpur · ₹{l.price_per_month}/month · {l.type?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                    Host: {l.profiles?.full_name} ({l.profiles?.email})
                  </div>

                  {/* Show rejection/deletion reason */}
                  {l.rejection_reason && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      color: '#791F1F',
                      background: '#FCEBEB',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}>
                      Reason: {l.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <AdminListingActions
                  listingId={l.id}
                  currentStatus={l.status}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
