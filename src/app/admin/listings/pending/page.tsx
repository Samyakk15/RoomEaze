import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ApproveRejectButtons from '@/components/admin/ApproveRejectButtons'

export default async function PendingListingsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (!profile || profile.role !== 'admin') redirect('/')

  const adminSupabase = createAdminClient()

  const { data: listings } = await adminSupabase
    .from('listings')
    .select(`
      id, title, type, locality, address,
      price_per_month, security_deposit,
      is_furnished, gender_preference,
      max_occupancy, description, created_at,
      listing_images (url, is_primary),
      amenities (name),
      profiles (full_name, email, phone)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
          Pending approvals
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {listings?.length ?? 0} listing(s) waiting for review
        </p>
      </div>

      {!listings || listings.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '12px',
          background: 'var(--color-background-secondary)',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
        }}>
          ✓ All caught up — no listings waiting for review
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {listings.map((l: any) => {
            const img = l.listing_images?.find((i: any) => i.is_primary)?.url
                     ?? l.listing_images?.[0]?.url

            return (
              <div key={l.id} style={{
                background: 'var(--color-background-primary)',
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                {/* Image strip */}
                {l.listing_images?.length > 0 && (
                  <div style={{ display: 'flex', gap: '4px', height: '160px', overflow: 'hidden' }}>
                    {l.listing_images.slice(0, 4).map((img: any, i: number) => (
                      <img
                        key={i}
                        src={img.url}
                        alt=""
                        style={{
                          flex: i === 0 ? 2 : 1,
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    {/* Listing details */}
                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '6px' }}>
                        {l.title}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                        📍 {l.locality}, Nagpur — {l.address}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                        {[
                          l.type?.toUpperCase(),
                          l.is_furnished ? 'Furnished' : 'Unfurnished',
                          l.gender_preference === 'any' ? 'Any gender'
                            : l.gender_preference === 'male' ? 'Boys only' : 'Girls only',
                          `Max ${l.max_occupancy} person(s)`,
                        ].map(tag => (
                          <span key={tag} style={{
                            fontSize: '11px',
                            padding: '3px 10px',
                            borderRadius: '20px',
                            background: 'var(--color-background-secondary)',
                            border: '0.5px solid var(--color-border-tertiary)',
                            color: 'var(--color-text-secondary)',
                          }}>{tag}</span>
                        ))}
                      </div>

                      <div style={{ fontSize: '18px', fontWeight: 500, color: '#1D9E75', marginBottom: '4px' }}>
                        ₹{l.price_per_month}/month
                      </div>
                      {l.security_deposit > 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                          ₹{l.security_deposit} security deposit
                        </div>
                      )}

                      {l.description && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.6,
                          marginBottom: '12px',
                        }}>
                          {l.description}
                        </p>
                      )}

                      {l.amenities?.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {l.amenities.map((a: any) => (
                            <span key={a.name} style={{
                              fontSize: '11px',
                              padding: '3px 10px',
                              borderRadius: '20px',
                              background: '#E1F5EE',
                              color: '#085041',
                            }}>
                              {a.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Host info + actions */}
                    <div style={{
                      width: '220px',
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}>
                      <div style={{
                        padding: '14px',
                        background: 'var(--color-background-secondary)',
                        borderRadius: '10px',
                        border: '0.5px solid var(--color-border-tertiary)',
                      }}>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
                          Host info
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                          {l.profiles?.full_name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                          {l.profiles?.email}
                        </div>
                        {l.profiles?.phone && (
                          <div style={{ fontSize: '12px', color: '#085041' }}>
                            📞 {l.profiles.phone}
                          </div>
                        )}
                        <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginTop: '6px' }}>
                          Submitted {new Date(l.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <ApproveRejectButtons listingId={l.id} />
                    </div>
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
