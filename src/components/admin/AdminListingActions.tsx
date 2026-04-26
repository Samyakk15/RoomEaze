'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminListingActions({
  listingId,
  currentStatus,
}: {
  listingId: string
  currentStatus: string
}) {
  const [mode, setMode]     = useState<'idle' | 'delete'>('idle')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function approve() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('listings')
      .update({ status: 'active', rejection_reason: null })
      .eq('id', listingId)
    setLoading(false)
    router.refresh()
  }

  async function deactivate() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('listings')
      .update({ status: 'inactive' })
      .eq('id', listingId)
    setLoading(false)
    router.refresh()
  }

  async function deleteListing() {
    if (!reason.trim()) return
    setLoading(true)
    const supabase = createClient()

    // Step 1 — get listing details and images before deleting
    const { data: listingData } = await supabase
      .from('listings')
      .select('title, host_id, listing_images(url)')
      .eq('id', listingId)
      .single()

    // Step 2 — log the deletion so host can see it
    if (listingData?.host_id) {
      await supabase
        .from('deleted_listing_logs')
        .insert({
          host_id:       listingData.host_id,
          listing_title: listingData.title,
          reason:        reason.trim(),
        })
    }

    // Step 3 — delete images from storage
    const images = (listingData as any)?.listing_images ?? []
    if (images.length > 0) {
      const paths = images
        .map((img: any) => {
          try {
            const url  = new URL(img.url)
            const path = url.pathname
              .split('/storage/v1/object/public/listing-images/')[1]
            return path ? decodeURIComponent(path) : null
          } catch { return null }
        })
        .filter(Boolean) as string[]

      if (paths.length > 0) {
        await supabase.storage.from('listing-images').remove(paths)
      }
    }

    // Step 4 — delete the listing row
    await supabase.from('listings').delete().eq('id', listingId)

    setLoading(false)
    setMode('idle')
    setReason('')
    router.refresh()
  }

  // ── DELETE MODE ──────────────────────────────────────
  if (mode === 'delete') {
    const deleteReasons = [
      'Scam or fraudulent listing',
      'Violates platform guidelines',
      'Fake photos or misleading info',
      'Repeatedly reposting rejected listing',
      'Abusive or inappropriate content',
    ]

    return (
      <div style={{
        width: '220px', flexShrink: 0,
        padding: '12px',
        background: '#FCEBEB',
        border: '0.5px solid #F5BCBC',
        borderRadius: '10px',
        display: 'flex', flexDirection: 'column', gap: '8px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 500, color: '#791F1F' }}>
          Reason for deletion
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {deleteReasons.map(r => (
            <div
              key={r}
              onClick={() => setReason(r)}
              style={{
                fontSize: '10px', padding: '3px 7px',
                borderRadius: '4px', cursor: 'pointer',
                border: `1px solid ${reason === r ? '#E24B4A' : '#F5BCBC'}`,
                background: reason === r ? '#E24B4A' : '#fff',
                color: reason === r ? '#fff' : '#791F1F',
              }}
            >
              {r}
            </div>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Type reason..."
          style={{
            width: '100%', padding: '7px',
            fontSize: '11px',
            border: '0.5px solid #F5BCBC',
            borderRadius: '6px', resize: 'none', minHeight: '55px',
            background: '#fff', color: '#791F1F',
          }}
        />

        <button
          onClick={deleteListing}
          disabled={!reason.trim() || loading}
          style={{
            padding: '8px',
            background: !reason.trim() ? '#ccc' : '#C0392B',
            color: '#fff', border: 'none',
            borderRadius: '6px', fontSize: '12px',
            fontWeight: 500,
            cursor: !reason.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Deleting...' : 'Confirm delete'}
        </button>

        <button
          onClick={() => { setMode('idle'); setReason('') }}
          style={{
            padding: '6px', background: 'transparent',
            color: '#791F1F',
            border: '0.5px solid #F5BCBC',
            borderRadius: '6px', fontSize: '11px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  // ── IDLE MODE ────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      gap: '6px', width: '130px', flexShrink: 0,
    }}>
      {/* View */}
      <a
        href={`/listings/${listingId}`}
        target="_blank"
        rel="noreferrer"
        style={{
          padding: '7px 12px', textAlign: 'center',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: '7px', fontSize: '12px',
          color: 'var(--color-text-secondary)',
          textDecoration: 'none',
        }}
      >
        View
      </a>

      {/* Approve — shown for pending or rejected */}
      {(currentStatus === 'pending' || currentStatus === 'rejected') && (
        <button
          onClick={approve}
          disabled={loading}
          style={{
            padding: '7px 12px',
            background: '#1D9E75', color: '#fff',
            border: 'none', borderRadius: '7px',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          Approve
        </button>
      )}

      {/* Deactivate — shown for active */}
      {currentStatus === 'active' && (
        <button
          onClick={deactivate}
          disabled={loading}
          style={{
            padding: '7px 12px',
            background: 'transparent',
            color: '#BA7517',
            border: '0.5px solid #EF9F27',
            borderRadius: '7px', fontSize: '12px',
            fontWeight: 500, cursor: 'pointer',
          }}
        >
          Deactivate
        </button>
      )}

      {/* Delete — shown for all */}
      <button
        onClick={() => setMode('delete')}
        style={{
          padding: '7px 12px',
          background: 'transparent',
          color: '#C0392B',
          border: '0.5px solid #E8B4B4',
          borderRadius: '7px', fontSize: '12px',
          fontWeight: 500, cursor: 'pointer',
        }}
      >
        Delete
      </button>
    </div>
  )
}
