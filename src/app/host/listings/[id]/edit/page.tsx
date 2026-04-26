import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditListingForm from '@/components/host/EditListingForm'

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'host') redirect('/dashboard')

  // Fetch listing — verify it belongs to this host
  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      id, title, type, locality, address,
      price_per_month, security_deposit,
      available_from, is_furnished,
      gender_preference, max_occupancy,
      description, status,
      listing_images (id, url, is_primary),
      amenities (id, name)
    `)
    .eq('id', resolvedParams.id)
    .eq('host_id', user.id)
    .single()

  console.log(listing)

  if (error) {
    console.error(error)
    return <p>Error loading listing</p>
  }

  // If listing not found or doesn't belong to host
  if (!listing) {
    return <p>Listing not found</p>
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 500, marginBottom: '4px' }}>
          Edit listing
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Saving changes will send your listing for admin re-approval
        </p>
      </div>
      <EditListingForm listing={listing} />
    </div>
  )
}
