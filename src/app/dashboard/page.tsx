import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CancelRequestButton from '@/components/student/CancelRequestButton'

export default async function StudentDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile)                redirect('/login')
  if (profile.role === 'host')  redirect('/host/dashboard')
  if (profile.role === 'admin') redirect('/admin/dashboard')

  // Fetch all stay requests for this student
  const { data: requests } = await supabase
    .from('stay_requests')
    .select(`
      id, status, move_in_date, duration_months,
      message, created_at, rejection_reason,
      host_id,
      listings (
        id, title, locality, price_per_month, type,
        listing_images (url, is_primary)
      )
    `)
    .eq('guest_id', user.id)
    .order('created_at', { ascending: false })

  // For accepted requests, fetch host contact info
  const enrichedRequests = await Promise.all(
    (requests ?? []).map(async (req: any) => {
      if (req.status === 'accepted' && req.host_id) {
        const { data: host } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', req.host_id)
          .single()
        return { ...req, host_name: host?.full_name, host_phone: host?.phone }
      }
      return req
    })
  )

  const stats = {
    total:    enrichedRequests?.length ?? 0,
    pending:  enrichedRequests?.filter(r => r.status === 'pending').length   ?? 0,
    accepted: enrichedRequests?.filter(r => r.status === 'accepted').length  ?? 0,
    rejected: enrichedRequests?.filter(r => r.status === 'rejected').length  ?? 0,
  }

  const statusStyle = (s: string) => ({
    bg:
      s === 'accepted'  ? '#E1F5EE' :
      s === 'pending'   ? '#FAEEDA' :
      s === 'rejected'  ? '#FCEBEB' :
      s === 'cancelled' ? '#F1EFE8' : '#F1EFE8',
    text:
      s === 'accepted'  ? '#085041' :
      s === 'pending'   ? '#633806' :
      s === 'rejected'  ? '#791F1F' :
      s === 'cancelled' ? '#5F5E5A' : '#5F5E5A',
    label:
      s === 'accepted'  ? '✓ Accepted' :
      s === 'pending'   ? '⏳ Pending' :
      s === 'rejected'  ? '✕ Rejected' :
      s === 'cancelled' ? 'Cancelled'  : s,
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '28px',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '4px' }}>
            Welcome, {profile.full_name}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            Student dashboard — track your room requests
          </p>
        </div>
        <Link href="/search" style={{
          padding: '10px 20px',
          background: '#1D9E75', color: '#fff',
          borderRadius: '8px', textDecoration: 'none',
          fontSize: '13px', fontWeight: 500,
        }}>
          Browse rooms →
        </Link>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px', marginBottom: '28px',
      }}>
        {[
          { label: 'Total sent',  value: stats.total,    color: '#378ADD' },
          { label: 'Pending',     value: stats.pending,  color: '#BA7517' },
          { label: 'Accepted',    value: stats.accepted, color: '#1D9E75' },
          { label: 'Rejected',    value: stats.rejected, color: '#E24B4A' },
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
            <div style={{ fontSize: '26px', fontWeight: 500, color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Requests list */}
      <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '14px' }}>
        My stay requests
      </h2>

      {!enrichedRequests || enrichedRequests.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          background: 'var(--color-background-primary)',
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏠</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            No requests yet
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Browse rooms and send a stay request to a host to get started
          </div>
          <Link href="/search" style={{
            padding: '10px 24px',
            background: '#1D9E75', color: '#fff',
            borderRadius: '8px', textDecoration: 'none',
            fontSize: '14px', fontWeight: 500,
          }}>
            Browse rooms
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {enrichedRequests.map((r: any) => {
            const sc  = statusStyle(r.status)
            const img = r.listings?.listing_images?.find((i: any) => i.is_primary)?.url
                     ?? r.listings?.listing_images?.[0]?.url

            return (
              <div key={r.id} style={{
                background: 'var(--color-background-primary)',
                border: `0.5px solid ${
                  r.status === 'accepted' ? '#5DCAA5' :
                  r.status === 'rejected' ? '#F5BCBC' :
                  'var(--color-border-tertiary)'
                }`,
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', gap: '0', flexWrap: 'wrap' }}>
                  {/* Room thumbnail */}
                  <div style={{
                    width: '120px', minHeight: '120px',
                    flexShrink: 0, background: '#F1EFE8',
                    overflow: 'hidden',
                  }}>
                    {img
                      ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{
                          width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '32px',
                        }}>🏠</div>
                    }
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '16px', minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                      <div>
                        <Link href={`/listings/${r.listings?.id}`} style={{
                          fontSize: '15px', fontWeight: 500,
                          color: 'var(--color-text-primary)',
                          textDecoration: 'none',
                        }}>
                          {r.listings?.title ?? 'Room listing'}
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          📍 {r.listings?.locality}, Nagpur · ₹{r.listings?.price_per_month?.toLocaleString()}/month
                        </div>
                      </div>

                      {/* Status badge */}
                      <span style={{
                        fontSize: '12px', fontWeight: 500,
                        padding: '4px 12px', borderRadius: '20px',
                        background: sc.bg, color: sc.text,
                        flexShrink: 0, height: 'fit-content',
                      }}>
                        {sc.label}
                      </span>
                    </div>

                    {/* Request details */}
                    <div style={{
                      display: 'flex', gap: '16px',
                      fontSize: '12px', color: 'var(--color-text-secondary)',
                      flexWrap: 'wrap', marginBottom: '10px',
                    }}>
                      {r.move_in_date && (
                        <span>Move-in: <strong style={{ color: 'var(--color-text-primary)' }}>{r.move_in_date}</strong></span>
                      )}
                      <span>Duration: <strong style={{ color: 'var(--color-text-primary)' }}>{r.duration_months} month(s)</strong></span>
                      <span>Sent: {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>

                    {/* Message sent */}
                    {r.message && (
                      <div style={{
                        fontSize: '12px', color: 'var(--color-text-secondary)',
                        fontStyle: 'italic', marginBottom: '10px',
                        padding: '6px 10px',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '6px',
                        borderLeft: '3px solid var(--color-border-secondary)',
                      }}>
                        Your message: "{r.message}"
                      </div>
                    )}

                    {/* ACCEPTED — show host contact */}
                    {r.status === 'accepted' && (
                      <div style={{
                        padding: '12px 16px',
                        background: '#E1F5EE',
                        border: '0.5px solid #5DCAA5',
                        borderRadius: '8px',
                        marginBottom: '10px',
                      }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#085041', marginBottom: '6px' }}>
                          🎉 Request accepted! Contact the host to finalize.
                        </div>
                        <div style={{ fontSize: '13px', color: '#0F6E56', marginBottom: '8px' }}>
                          Host: <strong>{r.host_name ?? 'Host'}</strong>
                          {r.host_phone && (
                            <> &nbsp;·&nbsp; 📞 <strong>{r.host_phone}</strong></>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <Link 
                            href={`/listings/${r.listings?.id}`}
                            style={{
                              padding: '7px 14px',
                              background: '#1D9E75', color: '#fff',
                              borderRadius: '7px', textDecoration: 'none',
                              fontSize: '12px', fontWeight: 500,
                            }}
                          >
                            View room details
                          </Link>
                          <Link 
                            href={`/search`}
                            style={{
                              padding: '7px 14px',
                              background: 'var(--color-background-primary)',
                              border: '0.5px solid var(--color-border-secondary)',
                              color: 'var(--color-text-secondary)',
                              borderRadius: '7px', textDecoration: 'none',
                              fontSize: '12px', fontWeight: 500,
                            }}
                          >
                            Browse more rooms
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* REJECTED — show reason */}
                    {r.status === 'rejected' && (
                      <div style={{
                        padding: '10px 14px',
                        background: '#FCEBEB',
                        border: '0.5px solid #F5BCBC',
                        borderRadius: '8px',
                        fontSize: '12px', color: '#791F1F',
                        marginBottom: '10px',
                      }}>
                        <strong>Request rejected.</strong>
                        {r.rejection_reason && <> Reason: {r.rejection_reason}</>}
                        <div style={{ marginTop: '4px', fontSize: '11px' }}>
                          You can send a request to other rooms.
                        </div>
                      </div>
                    )}

                    {/* PENDING — cancel option */}
                    {r.status === 'pending' && (
                      <CancelRequestButton requestId={r.id} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Profile section */}
      <div style={{
        marginTop: '40px',
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '20px' }}>My profile</h2>
        <StudentProfileForm profile={profile} />
      </div>
    </div>
  )
}

// Inline profile form — server renders initial values
import StudentProfileForm from '@/components/student/StudentProfileForm'
