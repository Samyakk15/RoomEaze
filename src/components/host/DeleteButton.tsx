'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DeleteButton({
  listingId,
  title,
}: {
  listingId: string
  title:     string
}) {
  const [step, setStep]     = useState<'idle' | 'confirm' | 'deleting'>('idle')
  const router = useRouter()

  async function handleDelete() {
    setStep('deleting')
    const supabase = createClient()

    // Step 1 — get all image URLs
    const { data: images } = await supabase
      .from('listing_images')
      .select('url')
      .eq('listing_id', listingId)

    // Step 2 — delete images from Supabase storage
    if (images && images.length > 0) {
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

    // Step 3 — delete DB row
    // Cascade handles: listing_images, amenities, stay_requests, reviews
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', listingId)

    if (error) {
      alert('Delete failed: ' + error.message)
      setStep('idle')
      return
    }

    router.push('/host/listings')
    router.refresh()
  }

  // ── Idle ──────────────────────────────────────────
  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        style={{
          padding: '7px 14px',
          border: '0.5px solid #F5BCBC',
          borderRadius: '7px',
          fontSize: '12px',
          color: '#E24B4A',
          background: 'transparent',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
    )
  }

  // ── Confirm ──────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px',
      }}>
        <div style={{
          background: 'var(--color-background-primary)',
          borderRadius: '14px',
          padding: '28px',
          maxWidth: '420px',
          width: '100%',
          border: '0.5px solid var(--color-border-tertiary)',
        }}>
          <div style={{ fontSize: '20px', marginBottom: '12px' }}>🗑️</div>
          <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px' }}>
            Delete this listing?
          </div>
          <div style={{
            fontSize: '14px',
            color: 'var(--color-text-secondary)',
            marginBottom: '8px',
            lineHeight: 1.5,
          }}>
            You are about to permanently delete:
          </div>
          <div style={{
            padding: '10px 14px',
            background: 'var(--color-background-secondary)',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '16px',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '13px',
            color: '#791F1F',
            background: '#FCEBEB',
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '20px',
            lineHeight: 1.5,
          }}>
            This will permanently delete the listing, all its photos, and all stay requests from students. This cannot be undone.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setStep('idle')}
              style={{
                flex: 1, padding: '10px',
                border: '0.5px solid var(--color-border-secondary)',
                borderRadius: '8px',
                background: 'transparent',
                color: 'var(--color-text-secondary)',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              style={{
                flex: 1, padding: '10px',
                background: '#C0392B', color: '#fff',
                border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 500, cursor: 'pointer',
              }}
            >
              Yes, delete permanently
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Deleting ──────────────────────────────────────
  return (
    <div style={{
      padding: '7px 14px',
      border: '0.5px solid #F5BCBC',
      borderRadius: '7px',
      fontSize: '12px',
      color: '#ccc',
      background: 'transparent',
    }}>
      Deleting...
    </div>
  )
}
