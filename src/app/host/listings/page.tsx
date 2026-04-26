import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import DeleteButton from '@/components/host/DeleteButton'

export default async function HostListingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'host') redirect('/dashboard')

  const { data: listings } = await supabase
    .from('listings')
    .select(`
      id, title, locality, price_per_month, status,
      type, is_furnished, gender_preference,
      rejection_reason, created_at,
      listing_images (url, is_primary)
    `)
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch deletion logs (listings removed by admin)
  const { data: deletionLogs } = await supabase
    .from('deleted_listing_logs')
    .select('id, listing_title, reason, deleted_at')
    .eq('host_id', user.id)
    .order('deleted_at', { ascending: false })

  const statusStyle = (s: string) => ({
    bg:   s === 'active'   ? '#E1F5EE'
        : s === 'pending'  ? '#FAEEDA'
        : s === 'rejected' ? '#FCEBEB'
        : '#F1EFE8',
    text: s === 'active'   ? '#085041'
        : s === 'pending'  ? '#633806'
        : s === 'rejected' ? '#791F1F'
        : '#444441',
  })

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '24px',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 500 }}>My listings</h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {listings?.length ?? 0} total listings
          </p>
        </div>
        <Link href="/host/listings/new" style={{
          padding: '10px 20px',
          background: '#1D9E75',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontSize: '13px',
          fontWeight: 500,
        }}>
          + Add new listing
        </Link>
      </div>

      {/* Empty state */}
      {!listings || listings.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          background: 'var(--color-background-primary)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No listings yet
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Add your first room to start receiving requests from students
          </div>
          <Link href="/host/listings/new" style={{
            padding: '10px 24px',
            background: '#1D9E75',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            Add your first listing
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {listings.map((l: any) => {
            const sc  = statusStyle(l.status)
            const img = l.listing_images?.find((i: any) => i.is_primary)?.url
                     ?? l.listing_images?.[0]?.url

            return (
              <div key={l.id} style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}>
                {/* Image */}
                <div style={{
                  width: '80px', height: '80px',
                  borderRadius: '8px',
                  background: '#F1EFE8',
                  flexShrink: 0,
                  overflow: 'hidden',
                }}>
                  {img
                    ? <img src={img} alt={l.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '28px',
                      }}>🏠</div>
                  }
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 500 }}>{l.title}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 500,
                      padding: '2px 8px', borderRadius: '20px',
                      background: sc.bg, color: sc.text,
                    }}>
                      {l.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                    📍 {l.locality}, Nagpur
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <span>₹{l.price_per_month}/month</span>
                    <span>{l.type?.toUpperCase()}</span>
                    <span>{l.is_furnished ? 'Furnished' : 'Unfurnished'}</span>
                    <span>{l.gender_preference === 'any' ? 'Any gender' : l.gender_preference === 'male' ? 'Boys only' : 'Girls only'}</span>
                  </div>

                  {/* Rejection reason */}
                  {l.status === 'rejected' && l.rejection_reason && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#FCEBEB',
                      border: '0.5px solid #F5BCBC',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#791F1F',
                    }}>
                      Rejected: {l.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <Link href={`/listings/${l.id}`} style={{
                    padding: '7px 14px',
                    border: '0.5px solid var(--color-border-secondary)',
                    borderRadius: '7px',
                    fontSize: '12px',
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}>
                    View
                  </Link>
                  <Link href={`/host/listings/${l.id}/edit`} style={{
                    padding: '7px 14px',
                    border: '0.5px solid #85B7EB',
                    borderRadius: '7px',
                    fontSize: '12px',
                    color: '#378ADD',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}>
                    Edit
                  </Link>
                  <DeleteButton listingId={l.id} title={l.title} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Deletion logs — listings removed by admin */}
      {deletionLogs && deletionLogs.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px', color: '#791F1F' }}>
            🗑 Deleted by admin
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '14px' }}>
            These listings were permanently removed by an admin. Contact support if you believe this was a mistake.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {deletionLogs.map((log: any) => (
              <div key={log.id} style={{
                background: '#FCEBEB',
                border: '0.5px solid #F5BCBC',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '8px',
                  background: '#F5BCBC',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '18px',
                  flexShrink: 0,
                }}>
                  🗑
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#791F1F', marginBottom: '2px' }}>
                    {log.listing_title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#A33030', marginBottom: '4px' }}>
                    Reason: {log.reason}
                  </div>
                  <div style={{ fontSize: '11px', color: '#C07070' }}>
                    Deleted on {new Date(log.deleted_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
