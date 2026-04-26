import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import StayRequestForm from '@/components/listings/StayRequestForm'
import ReviewForm from '@/components/listings/ReviewForm'
import DeleteReviewButton from '@/components/listings/DeleteReviewButton'

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get profile if logged in
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Fetch listing — only active listings for public
  const { data: listing } = await supabase
    .from('listings')
    .select(`
      id, title, description, type, address, locality,
      price_per_month, security_deposit, available_from,
      is_furnished, gender_preference, max_occupancy,
      status, host_id, created_at,
      listing_images (id, url, is_primary),
      amenities (id, name),
      profiles (id, full_name, phone, created_at)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!listing) notFound()

  // If listing is not active and viewer is not the host or admin
  if (
    listing.status !== 'active' &&
    listing.host_id !== user?.id &&
    profile?.role !== 'admin'
  ) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '8px' }}>
          Listing not available
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          This listing is no longer available or is under review.
        </p>
        <Link href="/search" style={{
          padding: '10px 24px',
          background: '#1D9E75', color: '#fff',
          borderRadius: '8px', textDecoration: 'none',
          fontSize: '14px', fontWeight: 500,
        }}>
          Browse other rooms
        </Link>
      </div>
    )
  }

  // Check if student already sent a request
  let existingRequest = null
  if (user && profile?.role === 'guest') {
    const { data } = await supabase
      .from('stay_requests')
      .select('id, status')
      .eq('guest_id', user.id)
      .eq('listing_id', listing.id)
      .in('status', ['pending', 'accepted'])
      .maybeSingle()
    existingRequest = data
  }

  // Add this query alongside the existing ones
  let canReview = false
  let alreadyReviewed = false

  if (user && profile?.role === 'guest') {
    // Check if student had an accepted request for this listing
    const { data: acceptedReq } = await supabase
      .from('stay_requests')
      .select('id')
      .eq('guest_id', user.id)
      .eq('listing_id', listing.id)
      .eq('status', 'accepted')
      .maybeSingle()

    canReview = !!acceptedReq

    // Check if already reviewed
    if (canReview) {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('guest_id', user.id)
        .eq('listing_id', listing.id)
        .maybeSingle()

      alreadyReviewed = !!existingReview
    }
  }

  // Check if current user is the host of this listing
  const isHost = user?.id === listing.host_id

  // Get current user's own review ID (to allow student to delete their own)
  let userReviewId: string | null = null
  if (user && profile?.role === 'guest') {
    const { data: myReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('guest_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle()
    userReviewId = myReview?.id ?? null
  }

  // Get reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, guest_id, profiles(full_name)')
    .eq('listing_id', listing.id)
    .order('created_at', { ascending: false })

  const avgRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const primaryImage = listing.listing_images?.find((i: any) => i.is_primary)
                    ?? listing.listing_images?.[0]
  const otherImages  = listing.listing_images?.filter((i: any) => i.id !== primaryImage?.id) ?? []

  const [activeImage, setActiveImage_] = [primaryImage?.url ?? null, () => {}]

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <Link href="/search" style={{
        fontSize: '13px', color: 'var(--color-text-secondary)',
        textDecoration: 'none', display: 'inline-block', marginBottom: '20px',
      }}>
        ← Back to search
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px', alignItems: 'flex-start' }}>
        {/* Left column */}
        <div>
          {/* Image gallery */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              width: '100%', height: '340px',
              borderRadius: '12px', overflow: 'hidden',
              background: '#F1EFE8', marginBottom: '8px',
            }}>
              {primaryImage
                ? <img
                    src={primaryImage.url}
                    alt={listing.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                : <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '48px',
                  }}>🏠</div>
              }
            </div>
            {otherImages.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {otherImages.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    style={{
                      width: '80px', height: '60px',
                      borderRadius: '6px', objectFit: 'cover',
                      flexShrink: 0, cursor: 'pointer',
                      border: '2px solid transparent',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Title and badges */}
          <div style={{ marginBottom: '16px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 500, marginBottom: '8px' }}>
              {listing.title}
            </h1>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {[
                listing.type?.toUpperCase(),
                listing.is_furnished ? 'Furnished' : 'Unfurnished',
                listing.gender_preference === 'any' ? 'Any gender'
                  : listing.gender_preference === 'male' ? 'Boys only' : 'Girls only',
                `Max ${listing.max_occupancy} person(s)`,
              ].map(tag => (
                <span key={tag} style={{
                  fontSize: '12px', padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'var(--color-background-secondary)',
                  border: '0.5px solid var(--color-border-tertiary)',
                  color: 'var(--color-text-secondary)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              📍 {listing.locality}, Nagpur — {listing.address}
            </div>
            {listing.available_from && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                Available from: {new Date(listing.available_from).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            )}
          </div>

          {/* Price */}
          <div style={{
            padding: '16px',
            background: 'var(--color-background-secondary)',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex', gap: '24px', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Monthly rent</div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: '#1D9E75' }}>
                ₹{listing.price_per_month.toLocaleString()}
              </div>
            </div>
            {listing.security_deposit > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>Security deposit</div>
                <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  ₹{listing.security_deposit.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '10px' }}>About this room</h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                {listing.description}
              </p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities && listing.amenities.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '12px' }}>Amenities</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {listing.amenities.map((a: any) => (
                  <span key={a.id} style={{
                    padding: '6px 14px',
                    background: '#E1F5EE',
                    border: '0.5px solid #5DCAA5',
                    borderRadius: '20px',
                    fontSize: '13px', color: '#085041',
                  }}>
                    {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: 500 }}>Reviews</h2>
              {avgRating && (
                <div style={{ fontSize: '13px', color: '#BA7517' }}>
                  ⭐ {avgRating} ({reviews?.length} review{reviews?.length !== 1 ? 's' : ''})
                </div>
              )}
            </div>

            {/* Review form — only for students with accepted request */}
            {canReview && !alreadyReviewed && user && (
              <ReviewForm listingId={listing.id} userId={user.id} />
            )}

            {canReview && alreadyReviewed && (
              <div style={{
                padding: '10px 14px',
                background: '#E1F5EE',
                border: '0.5px solid #5DCAA5',
                borderRadius: '8px',
                fontSize: '13px', color: '#085041',
                marginTop: '10px', marginBottom: '16px',
              }}>
                ✓ You have already reviewed this listing
              </div>
            )}

            {!reviews || reviews.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary)', padding: '16px 0' }}>
                No reviews yet for this listing.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                {reviews.map((r: any) => {
                  // Student can delete their own review
                  // Host can delete any review on their listing
                  const canDelete =
                    (user?.id === r.guest_id) || isHost

                  return (
                    <div key={r.id} style={{
                      padding: '14px',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: '10px',
                      background: 'var(--color-background-primary)',
                    }}>
                      {/* Top row — name, stars, delete button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                        gap: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>
                            {r.profiles?.full_name ?? 'Student'}
                          </span>
                          <span style={{ fontSize: '14px', color: '#F5A623' }}>
                            {'★'.repeat(r.rating)}
                            <span style={{ color: '#DDD' }}>{'★'.repeat(5 - r.rating)}</span>
                          </span>
                        </div>

                        {/* Delete button — shown to review owner or host */}
                        <DeleteReviewButton
                          reviewId={r.id}
                          canDelete={canDelete}
                        />
                      </div>

                      {/* Comment */}
                      {r.comment && (
                        <p style={{
                          fontSize: '13px',
                          color: 'var(--color-text-secondary)',
                          lineHeight: 1.6, marginBottom: '6px',
                        }}>
                          {r.comment}
                        </p>
                      )}

                      {/* Date */}
                      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                        {new Date(r.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}
                        {isHost && user?.id !== r.guest_id && (
                          <span style={{
                            marginLeft: '8px', fontSize: '10px',
                            color: '#854F0B', background: '#FAEEDA',
                            padding: '1px 6px', borderRadius: '3px', fontWeight: 500,
                          }}>
                            Host view
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Host info + Stay request */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {/* Host info card */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              Listed by
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                background: '#FAEEDA', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 500, color: '#633806',
                flexShrink: 0,
              }}>
                {(listing.profiles as any)?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  {(listing.profiles as any)?.full_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Member since {new Date((listing.profiles as any)?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Phone — only if logged in */}
            {user && (listing.profiles as any)?.phone ? (
              <div style={{
                padding: '10px 14px',
                background: '#E1F5EE',
                border: '0.5px solid #5DCAA5',
                borderRadius: '8px',
                fontSize: '14px', fontWeight: 500,
                color: '#085041',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                📞 {(listing.profiles as any).phone}
              </div>
            ) : !user ? (
              <Link href={`/login?redirectTo=/listings/${listing.id}`} style={{
                display: 'block', textAlign: 'center',
                padding: '10px 14px',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: '8px',
                fontSize: '13px', color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}>
                Login to see contact details
              </Link>
            ) : null}
          </div>

          {/* Stay request section */}
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h2 style={{ fontSize: '15px', fontWeight: 500, marginBottom: '16px' }}>
              Send stay request
            </h2>

            {!user ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                  Login to send a stay request to this host
                </p>
                <Link href={`/login?redirectTo=/listings/${listing.id}`} style={{
                  display: 'block', padding: '11px',
                  background: '#1D9E75', color: '#fff',
                  borderRadius: '8px', textDecoration: 'none',
                  fontSize: '14px', fontWeight: 500, textAlign: 'center',
                }}>
                  Login to request
                </Link>
              </div>
            ) : profile?.role === 'host' ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Switch to a student account to send stay requests.
              </p>
            ) : profile?.role === 'admin' ? (
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                Admin view — stay requests are for students only.
              </p>
            ) : existingRequest ? (
              <div style={{
                padding: '14px',
                background: existingRequest.status === 'accepted' ? '#E1F5EE' : '#FAEEDA',
                border: `0.5px solid ${existingRequest.status === 'accepted' ? '#5DCAA5' : '#EF9F27'}`,
                borderRadius: '8px',
                fontSize: '13px',
                color: existingRequest.status === 'accepted' ? '#085041' : '#633806',
              }}>
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                  {existingRequest.status === 'accepted'
                    ? '✓ Your request was accepted!'
                    : '⏳ Request already sent'}
                </div>
                <div style={{ fontSize: '12px' }}>
                  {existingRequest.status === 'accepted'
                    ? 'The host will contact you soon. Check your dashboard for details.'
                    : 'You already have a pending request for this listing. Check your dashboard for status.'}
                </div>
                <Link href="/dashboard" style={{
                  display: 'inline-block', marginTop: '10px',
                  fontSize: '12px', color: '#085041',
                  textDecoration: 'none', fontWeight: 500,
                }}>
                  View in dashboard →
                </Link>
              </div>
            ) : (
              <StayRequestForm
                listingId={listing.id}
                hostId={listing.host_id}
                userId={user.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
