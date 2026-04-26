import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HostDashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone')
    .eq('id', user.id)
    .single()

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, locality, price_per_month,
      status, type, created_at,
      listing_images (url, is_primary)
    `)
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  const { data: requests } = await supabase
    .from('stay_requests')
    .select(`
      id, status, move_in_date, created_at,
      profiles (full_name),
      listings (title, locality)
    `)
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: deletionLogs } = await supabase
    .from('deleted_listing_logs')
    .select('id, listing_title, reason, deleted_at')
    .eq('host_id', user.id)
    .order('deleted_at', { ascending: false })
    .limit(5)

  const stats = {
    total:   listings?.length ?? 0,
    active:  listings?.filter(l => l.status === 'active').length  ?? 0,
    pending: listings?.filter(l => l.status === 'pending').length ?? 0,
    newReqs: requests?.filter((r: any) => r.status === 'pending').length ?? 0,
  }

  const statusColor = (s: string) => ({
    bg:   s === 'active' ? '#E1F5EE' : s === 'pending' ? '#FAEEDA' : s === 'rejected' ? '#FCEBEB' : '#F1EFE8',
    text: s === 'active' ? '#085041' : s === 'pending' ? '#633806' : s === 'rejected' ? '#791F1F' : '#444441',
  })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
          Welcome back, {profile?.full_name}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
          Here's what's happening with your listings
        </p>
      </div>

      {/* Phone warning */}
      {!profile?.phone && (
        <div style={{
          padding: '12px 16px',
          background: '#FAEEDA',
          border: '0.5px solid #EF9F27',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#633806',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <span>Add your phone number so students can contact you</span>
          <Link href="/host/profile" style={{
            fontSize: '12px',
            color: '#854F0B',
            textDecoration: 'none',
            fontWeight: 500,
          }}>
            Add now →
          </Link>
        </div>
      )}

      {/* Pending approval notice */}
      {stats.pending > 0 && (
        <div style={{
          padding: '12px 16px',
          background: '#E6F1FB',
          border: '0.5px solid #85B7EB',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#0C447C',
          marginBottom: '20px',
        }}>
          {stats.pending} listing(s) are waiting for admin approval before going live to students.
        </div>
      )}

      {/* Deletion notices */}
      {deletionLogs && deletionLogs.length > 0 && (
        <div style={{
          padding: '16px',
          background: '#FCEBEB',
          border: '0.5px solid #F5BCBC',
          borderRadius: '10px',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '13px', fontWeight: 500,
            color: '#791F1F', marginBottom: '10px',
          }}>
            🗑 Admin removed {deletionLogs.length} of your listing(s)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deletionLogs.map((log: any) => (
              <div key={log.id} style={{
                padding: '10px 12px',
                background: '#fff',
                border: '0.5px solid #F5BCBC',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#791F1F', marginBottom: '4px' }}>
                  "{log.listing_title}"
                </div>
                <div style={{ fontSize: '12px', color: '#A33030', marginBottom: '4px' }}>
                  Reason: {log.reason}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                  Deleted on {new Date(log.deleted_at).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '10px', fontSize: '12px',
            color: '#854F0B', background: '#FAEEDA',
            padding: '8px 12px', borderRadius: '6px',
          }}>
            Please fix the issues mentioned above and submit a new listing that follows our guidelines.
          </div>
        </div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total listings', value: stats.total,   color: '#378ADD' },
          { label: 'Active',         value: stats.active,  color: '#1D9E75' },
          { label: 'Pending review', value: stats.pending, color: '#BA7517' },
          { label: 'New requests',   value: stats.newReqs, color: '#D85A30' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '16px',
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 500, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* My listings */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500 }}>My listings</h2>
            <Link href="/host/listings/new" style={{
              fontSize: '12px',
              padding: '6px 12px',
              background: '#1D9E75',
              color: '#fff',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
            }}>
              + Add new
            </Link>
          </div>

          {!listings || listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              No listings yet.{' '}
              <Link href="/host/listings/new" style={{ color: '#1D9E75', textDecoration: 'none' }}>
                Add your first room
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {listings.slice(0, 5).map((l: any) => {
                const sc = statusColor(l.status)
                const img = l.listing_images?.find((i: any) => i.is_primary)?.url
                  ?? l.listing_images?.[0]?.url

                return (
                  <div key={l.id} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '10px',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: '8px',
                    alignItems: 'center',
                  }}>
                    {/* Thumbnail */}
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '6px',
                      background: '#F1EFE8',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}>
                      {img ? (
                        <img
                          src={img}
                          alt={l.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}>
                          🏠
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {l.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                        {l.locality} · ₹{l.price_per_month}/mo
                      </div>
                    </div>

                    {/* Status + edit */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 500,
                        padding: '2px 8px', borderRadius: '20px',
                        background: sc.bg, color: sc.text,
                      }}>
                        {l.status}
                      </span>
                      <Link href={`/host/listings/${l.id}/edit`} style={{
                        fontSize: '11px', color: '#378ADD', textDecoration: 'none',
                      }}>
                        Edit
                      </Link>
                    </div>
                  </div>
                )
              })}

              {listings.length > 5 && (
                <Link href="/host/listings" style={{
                  textAlign: 'center', fontSize: '12px',
                  color: '#378ADD', textDecoration: 'none',
                  padding: '8px',
                }}>
                  View all {listings.length} listings →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Recent requests */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500 }}>Recent requests</h2>
            <Link href="/host/requests" style={{ fontSize: '12px', color: '#378ADD', textDecoration: 'none' }}>
              View all
            </Link>
          </div>

          {!requests || requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              No requests yet. Once a student contacts you, it will show here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {requests.map((r: any) => {
                const rc = statusColor(r.status)
                return (
                  <div key={r.id} style={{
                    padding: '10px 12px',
                    border: '0.5px solid var(--color-border-tertiary)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                          {(r.profiles as any)?.full_name ?? 'Student'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {(r.listings as any)?.title}
                        </div>
                        {r.move_in_date && (
                          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                            Move-in: {r.move_in_date}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: '10px', fontWeight: 500,
                        padding: '2px 8px', borderRadius: '20px',
                        background: rc.bg, color: rc.text,
                        flexShrink: 0,
                      }}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
      }}>
        {[
          { label: 'Add new listing',   href: '/host/listings/new',  color: '#1D9E75' },
          { label: 'View all requests', href: '/host/requests',       color: '#378ADD' },
          { label: 'Edit profile',      href: '/host/profile',        color: '#BA7517' },
        ].map(a => (
          <Link key={a.href} href={a.href} style={{
            display: 'block',
            padding: '14px',
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: 500,
            color: a.color,
            textAlign: 'center',
          }}>
            {a.label} →
          </Link>
        ))}
      </div>
    </div>
  )
}
