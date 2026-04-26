import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import SearchFilters from '@/components/search/SearchFilters'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    locality?: string
    type?: string
    min_price?: string
    max_price?: string
    is_furnished?: string
    gender?: string
    page?: string
  }>
}) {
  const resolvedParams = await searchParams
  const supabase   = await createClient()
  const PAGE_SIZE  = 12
  const page       = Number(resolvedParams.page ?? 1)
  const from       = (page - 1) * PAGE_SIZE
  const to         = from + PAGE_SIZE - 1

  let query = supabase
    .from('listings')
    .select(`
      id, title, locality, price_per_month, security_deposit,
      type, is_furnished, gender_preference, max_occupancy,
      available_from, created_at,
      listing_images (url, is_primary)
    `, { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (resolvedParams.locality) query = query.eq('locality', resolvedParams.locality)
  if (resolvedParams.type)     query = query.eq('type', resolvedParams.type)
  if (resolvedParams.min_price) query = query.gte('price_per_month', Number(resolvedParams.min_price))
  if (resolvedParams.max_price) query = query.lte('price_per_month', Number(resolvedParams.max_price))
  if (resolvedParams.is_furnished === 'true')  query = query.eq('is_furnished', true)
  if (resolvedParams.is_furnished === 'false') query = query.eq('is_furnished', false)
  if (resolvedParams.gender && resolvedParams.gender !== 'any') {
    query = query.eq('gender_preference', resolvedParams.gender)
  }

  const { data: listings, count } = await query

  const totalPages  = Math.ceil((count ?? 0) / PAGE_SIZE)
  const hasFilters  = !!(
    resolvedParams.locality || resolvedParams.type ||
    resolvedParams.min_price || resolvedParams.max_price ||
    resolvedParams.is_furnished || resolvedParams.gender
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
          Rooms in Nagpur
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          {count ?? 0} room{count !== 1 ? 's' : ''} found
          {resolvedParams.locality ? ` in ${resolvedParams.locality}` : ''}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Filter sidebar */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <SearchFilters currentFilters={resolvedParams} />
        </div>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!listings || listings.length === 0 ? (
            <div style={{
              padding: '60px 24px', textAlign: 'center',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '12px',
              background: 'var(--color-background-primary)',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
                No rooms found
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
                Try adjusting your filters or clearing them
              </div>
              {hasFilters && (
                <Link href="/search" style={{
                  padding: '10px 20px', background: '#1D9E75', color: '#fff',
                  borderRadius: '8px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 500,
                }}>
                  Clear all filters
                </Link>
              )}
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}>
                {listings.map((l: any) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {page > 1 && (
                    <Link
                      href={buildUrl(resolvedParams, page - 1)}
                      style={paginationBtn}
                    >
                      ← Previous
                    </Link>
                  )}
                  <span style={{
                    padding: '8px 16px', fontSize: '13px',
                    color: 'var(--color-text-secondary)',
                  }}>
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link
                      href={buildUrl(resolvedParams, page + 1)}
                      style={paginationBtn}
                    >
                      Next →
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function buildUrl(params: any, newPage: number) {
  const p = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v && k !== 'page') p.set(k, String(v))
  })
  p.set('page', String(newPage))
  return `/search?${p.toString()}`
}

const paginationBtn: React.CSSProperties = {
  padding: '8px 16px',
  border: '0.5px solid var(--color-border-secondary)',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  background: 'var(--color-background-primary)',
}

function ListingCard({ listing }: { listing: any }) {
  const img = listing.listing_images?.find((i: any) => i.is_primary)?.url
           ?? listing.listing_images?.[0]?.url

  const genderLabel =
    listing.gender_preference === 'male'   ? 'Boys only' :
    listing.gender_preference === 'female' ? 'Girls only' : 'Any gender'

  return (
    <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--color-background-primary)',
        transition: 'border-color .15s',
        cursor: 'pointer',
      }}>
        {/* Image */}
        <div style={{
          width: '100%', height: '180px',
          background: '#F1EFE8', position: 'relative',
          overflow: 'hidden',
        }}>
          {img
            ? <img src={img} alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{
                width: '100%', height: '100%',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '40px',
              }}>🏠</div>
          }
          {/* Type badge */}
          <div style={{
            position: 'absolute', top: '8px', left: '8px',
            background: 'rgba(0,0,0,0.65)', color: '#fff',
            fontSize: '10px', fontWeight: 500,
            padding: '3px 8px', borderRadius: '4px',
            textTransform: 'uppercase',
          }}>
            {listing.type}
          </div>
          {/* Furnished badge */}
          {listing.is_furnished && (
            <div style={{
              position: 'absolute', top: '8px', right: '8px',
              background: '#1D9E75', color: '#fff',
              fontSize: '10px', fontWeight: 500,
              padding: '3px 8px', borderRadius: '4px',
            }}>
              Furnished
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px' }}>
          <div style={{
            fontSize: '14px', fontWeight: 500,
            marginBottom: '4px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {listing.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            📍 {listing.locality}, Nagpur
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            {[
              genderLabel,
              `Max ${listing.max_occupancy}`,
            ].map(tag => (
              <span key={tag} style={{
                fontSize: '10px', padding: '2px 8px',
                borderRadius: '20px',
                background: 'var(--color-background-secondary)',
                border: '0.5px solid var(--color-border-tertiary)',
                color: 'var(--color-text-secondary)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 500, color: '#1D9E75' }}>
                ₹{listing.price_per_month.toLocaleString()}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                /month
              </span>
            </div>
            {listing.security_deposit > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
                ₹{listing.security_deposit.toLocaleString()} deposit
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
