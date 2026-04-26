import { redirect }     from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RequestActions   from '@/components/host/RequestActions'

export default async function HostRequestsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const supabase = await createClient()

  // Step 1 — get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Step 2 — verify host role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name, id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'host') {
    redirect('/dashboard')
  }

  // Step 3 — fetch requests using host's own ID
  // Simple query first — no joins, just raw rows
  const { data: rawRequests, error: requestError } = await supabase
    .from('stay_requests')
    .select('*')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Step 4 — if still empty, try without RLS using a workaround
  // This tells us if it's an RLS issue or a data issue
  let requests: any[] = []

  if (requestError) {
    console.error('REQUEST FETCH ERROR:', requestError)
  }

  if (!rawRequests || rawRequests.length === 0) {
    // RLS might be blocking — fetch via listings the host owns
    // This is an alternative approach that works even with RLS issues
    const { data: hostListings } = await supabase
      .from('listings')
      .select('id')
      .eq('host_id', user.id)

    const listingIds = hostListings?.map(l => l.id) ?? []

    if (listingIds.length > 0) {
      const { data: requestsByListing, error: altError } = await supabase
        .from('stay_requests')
        .select('*')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })

      if (!altError && requestsByListing) {
        requests = requestsByListing
      }
    }
  } else {
    requests = rawRequests
  }

  // Step 5 — apply status filter
  const statusFilter = searchParams.status
  const filteredRequests = statusFilter && statusFilter !== 'all'
    ? requests.filter(r => r.status === statusFilter)
    : requests

  // Step 6 — enrich with guest and listing info
  const enriched = await Promise.all(
    filteredRequests.map(async (req) => {
      const [{ data: guest }, { data: listing }] = await Promise.all([
        supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', req.guest_id)
          .single(),
        supabase
          .from('listings')
          .select('id, title, locality, price_per_month')
          .eq('id', req.listing_id)
          .single(),
      ])
      return { ...req, guest, listing }
    })
  )

  const allCount      = requests.length
  const pendingCount  = requests.filter(r => r.status === 'pending').length
  const acceptedCount = requests.filter(r => r.status === 'accepted').length
  const rejectedCount = requests.filter(r => r.status === 'rejected').length

  const statusStyle = (s: string) => ({
    bg:
      s === 'accepted' ? '#E1F5EE' :
      s === 'pending'  ? '#FAEEDA' :
      s === 'rejected' ? '#FCEBEB' : '#F1EFE8',
    text:
      s === 'accepted' ? '#085041' :
      s === 'pending'  ? '#633806' :
      s === 'rejected' ? '#791F1F' : '#5F5E5A',
    label:
      s === 'accepted' ? '✓ Accepted' :
      s === 'pending'  ? '⏳ Pending'  :
      s === 'rejected' ? '✕ Rejected' :
      s === 'cancelled'? 'Cancelled'  : s,
  })

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
          Stay requests
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {allCount} total request{allCount !== 1 ? 's' : ''} for your rooms
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        marginBottom: '24px',
        overflowX: 'auto',
      }}>
        {[
          { key: 'all',      label: 'All',      count: allCount      },
          { key: 'pending',  label: 'Pending',  count: pendingCount  },
          { key: 'accepted', label: 'Accepted', count: acceptedCount },
          { key: 'rejected', label: 'Rejected', count: rejectedCount },
        ].map(tab => {
          const active = (statusFilter ?? 'all') === tab.key
          return (
            <a
              key={tab.key}
              href={`/host/requests${tab.key === 'all' ? '' : `?status=${tab.key}`}`}
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? '#1D9E75' : 'var(--color-text-secondary)',
                textDecoration: 'none',
                borderBottom: `2px solid ${active ? '#1D9E75' : 'transparent'}`,
                marginBottom: '-0.5px',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {tab.label}
              {tab.count > 0 && (
                <span style={{
                  fontSize: '11px', fontWeight: 500,
                  padding: '1px 7px', borderRadius: '10px',
                  background: active ? '#1D9E75' : 'var(--color-background-tertiary)',
                  color: active ? '#fff' : 'var(--color-text-tertiary)',
                }}>
                  {tab.count}
                </span>
              )}
            </a>
          )
        })}
      </div>

      {/* Empty state */}
      {enriched.length === 0 ? (
        <div style={{
          padding: '60px 24px',
          textAlign: 'center',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          background: 'var(--color-background-primary)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            {statusFilter && statusFilter !== 'all'
              ? `No ${statusFilter} requests`
              : 'No requests yet'}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            {allCount === 0
              ? 'When students send stay requests for your rooms, they will appear here'
              : `No requests with status "${statusFilter}"`}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {enriched.map((r: any) => {
            const sc = statusStyle(r.status)
            return (
              <div key={r.id} style={{
                background: 'var(--color-background-primary)',
                border: `0.5px solid ${
                  r.status === 'accepted' ? '#5DCAA5' :
                  r.status === 'rejected' ? '#F5BCBC' :
                  r.status === 'pending'  ? '#EF9F27' :
                  'var(--color-border-tertiary)'
                }`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Status bar */}
                <div style={{
                  padding: '8px 20px',
                  background:
                    r.status === 'accepted' ? '#E1F5EE' :
                    r.status === 'rejected' ? '#FCEBEB' :
                    r.status === 'pending'  ? '#FAEEDA' :
                    'var(--color-background-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: sc.text }}>
                    {sc.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                    {new Date(r.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })} at {new Date(r.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>

                <div style={{
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '24px',
                }}>
                  {/* Left — Student + Request info */}
                  <div>
                    <div style={{
                      fontSize: '11px', fontWeight: 600,
                      color: 'var(--color-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      marginBottom: '12px',
                    }}>
                      Student info
                    </div>

                    {/* Avatar + name */}
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '12px', marginBottom: '14px',
                    }}>
                      <div style={{
                        width: '44px', height: '44px',
                        borderRadius: '50%',
                        background: '#E1F5EE',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px', fontWeight: 600,
                        color: '#085041', flexShrink: 0,
                      }}>
                        {r.guest?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 500 }}>
                          {r.guest?.full_name ?? 'Unknown'}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          {r.guest?.email ?? 'No email'}
                        </div>
                      </div>
                    </div>

                    {/* Phone */}
                    {r.guest?.phone ? (
                      <div style={{
                        padding: '10px 14px',
                        background: '#E1F5EE',
                        border: '0.5px solid #5DCAA5',
                        borderRadius: '8px',
                        fontSize: '14px', fontWeight: 500,
                        color: '#085041', marginBottom: '14px',
                      }}>
                        📞 {r.guest.phone}
                      </div>
                    ) : (
                      <div style={{
                        padding: '8px 12px',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--color-text-tertiary)',
                        marginBottom: '14px',
                      }}>
                        No phone number provided
                      </div>
                    )}

                    {/* Move-in + duration */}
                    <div style={{
                      display: 'flex', flexDirection: 'column',
                      gap: '6px', fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                    }}>
                      {r.move_in_date && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>📅</span>
                          <span>Move-in:</span>
                          <strong style={{ color: 'var(--color-text-primary)' }}>
                            {r.move_in_date}
                          </strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>⏱</span>
                        <span>Duration:</span>
                        <strong style={{ color: 'var(--color-text-primary)' }}>
                          {r.duration_months} month{r.duration_months > 1 ? 's' : ''}
                        </strong>
                      </div>
                    </div>

                    {/* Message */}
                    {r.message && (
                      <div style={{
                        marginTop: '14px',
                        padding: '12px',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        borderLeft: '3px solid var(--color-border-secondary)',
                      }}>
                        "{r.message}"
                      </div>
                    )}
                  </div>

                  {/* Right — Room + Actions */}
                  <div>
                    <div style={{
                      fontSize: '11px', fontWeight: 600,
                      color: 'var(--color-text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                      marginBottom: '12px',
                    }}>
                      Room requested
                    </div>

                    <div style={{
                      padding: '14px',
                      background: 'var(--color-background-secondary)',
                      borderRadius: '8px',
                      marginBottom: '16px',
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                        {r.listing?.title ?? 'Room'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                        📍 {r.listing?.locality ?? 'Nagpur'}, Nagpur
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 500, color: '#1D9E75' }}>
                        ₹{r.listing?.price_per_month?.toLocaleString()}/month
                      </div>
                    </div>

                    {/* Actions */}
                    {r.status === 'pending' && (
                      <>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--color-text-secondary)',
                          marginBottom: '10px',
                        }}>
                          Accept or reject this request:
                        </div>
                        <RequestActions requestId={r.id} />
                      </>
                    )}

                    {r.status === 'accepted' && (
                      <div style={{
                        padding: '14px',
                        background: '#E1F5EE',
                        border: '0.5px solid #5DCAA5',
                        borderRadius: '8px',
                        fontSize: '13px', color: '#085041',
                      }}>
                        <div style={{ fontWeight: 500, marginBottom: '6px' }}>
                          ✓ You accepted this request
                        </div>
                        <div style={{ fontSize: '12px', lineHeight: 1.5 }}>
                          Contact the student on{' '}
                          <strong>{r.guest?.phone ?? 'their registered number'}</strong>{' '}
                          to finalize the booking.
                        </div>
                      </div>
                    )}

                    {r.status === 'rejected' && (
                      <div style={{
                        padding: '14px',
                        background: '#FCEBEB',
                        border: '0.5px solid #F5BCBC',
                        borderRadius: '8px',
                        fontSize: '13px', color: '#791F1F',
                      }}>
                        <div style={{ fontWeight: 500, marginBottom: '6px' }}>
                          ✕ You rejected this request
                        </div>
                        {r.rejection_reason && (
                          <div style={{ fontSize: '12px' }}>
                            Reason given: {r.rejection_reason}
                          </div>
                        )}
                      </div>
                    )}

                    {r.status === 'cancelled' && (
                      <div style={{
                        padding: '14px',
                        background: '#F1EFE8',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: 'var(--color-text-secondary)',
                      }}>
                        Student cancelled this request.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
