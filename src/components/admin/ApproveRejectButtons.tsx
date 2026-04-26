'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ApproveRejectButtons({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState<'approve' | 'reject' | 'delete' | null>(null)
  const [mode, setMode]       = useState<'idle' | 'reject' | 'delete'>('idle')
  const [reason, setReason]   = useState('')
  const router = useRouter()

  // ── Approve ──────────────────────────────────────────
  async function approve() {
    setLoading('approve')
    const supabase = createClient()

    const { error } = await supabase
      .from('listings')
      .update({ status: 'active', rejection_reason: null })
      .eq('id', listingId)

    if (error) {
      alert('Approve failed: ' + error.message)
      setLoading(null)
      return
    }

    setLoading(null)
    router.refresh()
  }

  // ── Reject ──────────────────────────────────────────
  async function reject() {
    if (!reason.trim()) return
    setLoading('reject')
    const supabase = createClient()

    const { error } = await supabase
      .from('listings')
      .update({
        status:           'rejected',
        rejection_reason: reason.trim(),
      })
      .eq('id', listingId)

    if (error) {
      alert('Reject failed: ' + error.message)
      setLoading(null)
      return
    }

    setLoading(null)
    setMode('idle')
    setReason('')
    router.refresh()
  }

  // ── Delete completely ─────────────────────────────────
  async function deleteListing() {
    if (!reason.trim()) return
    setLoading('delete')
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

    setLoading(null)
    setMode('idle')
    setReason('')
    router.refresh()
  }

  // ──────────────────────────────────────────────────────
  // REJECT MODE UI
  // ──────────────────────────────────────────────────────
  if (mode === 'reject') {
    const quickReasons = [
      'Incomplete information',
      'Fake or duplicate listing',
      'Wrong location',
      'Poor quality images',
      'Price seems incorrect',
      'Inappropriate content',
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{
          fontSize: '12px', fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: '2px',
        }}>
          Rejection reason
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {quickReasons.map(r => (
            <div
              key={r}
              onClick={() => setReason(r)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                border: `1px solid ${reason === r ? '#E24B4A' : 'var(--color-border-tertiary)'}`,
                background: reason === r ? '#FCEBEB' : 'var(--color-background-primary)',
                color: reason === r ? '#791F1F' : 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              {r}
            </div>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Or type a custom reason..."
          style={{
            width: '100%', padding: '8px',
            fontSize: '12px',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: '6px', resize: 'none', minHeight: '60px',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
          }}
        />

        <button
          onClick={reject}
          disabled={!reason.trim() || loading === 'reject'}
          style={{
            padding: '9px',
            background: !reason.trim() ? '#ccc' : '#E24B4A',
            color: '#fff', border: 'none',
            borderRadius: '7px', fontSize: '13px',
            fontWeight: 500,
            cursor: !reason.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'reject' ? 'Rejecting...' : 'Confirm reject'}
        </button>

        <button
          onClick={() => { setMode('idle'); setReason('') }}
          style={{
            padding: '7px', background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────
  // DELETE MODE UI
  // ──────────────────────────────────────────────────────
  if (mode === 'delete') {
    const deleteReasons = [
      'Scam or fraudulent listing',
      'Abusive or inappropriate content',
      'Violates platform guidelines',
      'Repeatedly reposting rejected listing',
      'Fake photos or misleading info',
    ]

    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '8px',
        padding: '12px',
        background: '#FCEBEB',
        border: '0.5px solid #F5BCBC',
        borderRadius: '10px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#791F1F' }}>
          ⚠️ Permanently delete this listing
        </div>
        <div style={{ fontSize: '12px', color: '#A33030', marginBottom: '4px' }}>
          This cannot be undone. The host will see the reason you provide.
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {deleteReasons.map(r => (
            <div
              key={r}
              onClick={() => setReason(r)}
              style={{
                fontSize: '11px', padding: '3px 8px',
                borderRadius: '4px',
                border: `1px solid ${reason === r ? '#E24B4A' : '#F5BCBC'}`,
                background: reason === r ? '#E24B4A' : '#fff',
                color: reason === r ? '#fff' : '#791F1F',
                cursor: 'pointer',
              }}
            >
              {r}
            </div>
          ))}
        </div>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Describe why this listing is being deleted..."
          style={{
            width: '100%', padding: '8px',
            fontSize: '12px',
            border: '0.5px solid #F5BCBC',
            borderRadius: '6px', resize: 'none', minHeight: '70px',
            background: '#fff', color: '#791F1F',
          }}
        />

        <button
          onClick={deleteListing}
          disabled={!reason.trim() || loading === 'delete'}
          style={{
            padding: '10px',
            background: !reason.trim() ? '#ccc' : '#C0392B',
            color: '#fff', border: 'none',
            borderRadius: '7px', fontSize: '13px',
            fontWeight: 500,
            cursor: !reason.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {loading === 'delete' ? 'Deleting...' : '🗑 Permanently delete listing'}
        </button>

        <button
          onClick={() => { setMode('idle'); setReason('') }}
          style={{
            padding: '7px', background: 'transparent',
            color: '#791F1F',
            border: '0.5px solid #F5BCBC',
            borderRadius: '7px', fontSize: '12px', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
      </div>
    )
  }

  // ──────────────────────────────────────────────────────
  // DEFAULT IDLE MODE UI
  // ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Approve */}
      <button
        onClick={approve}
        disabled={loading === 'approve'}
        style={{
          padding: '10px',
          background: loading === 'approve' ? '#ccc' : '#1D9E75',
          color: '#fff', border: 'none',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 500,
          cursor: loading === 'approve' ? 'not-allowed' : 'pointer',
        }}
      >
        {loading === 'approve' ? 'Approving...' : '✓ Approve listing'}
      </button>

      {/* Reject */}
      <button
        onClick={() => { setMode('reject'); setReason('') }}
        style={{
          padding: '10px', background: 'transparent',
          color: '#E24B4A',
          border: '0.5px solid #F5BCBC',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer',
        }}
      >
        ✕ Reject listing
      </button>

      {/* Delete */}
      <button
        onClick={() => { setMode('delete'); setReason('') }}
        style={{
          padding: '10px', background: 'transparent',
          color: '#C0392B',
          border: '0.5px solid #E8B4B4',
          borderRadius: '8px', fontSize: '13px',
          fontWeight: 500, cursor: 'pointer',
        }}
      >
        🗑 Delete permanently
      </button>
    </div>
  )
}
