'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function DeleteReviewButton({
  reviewId,
  canDelete,
}: {
  reviewId:  string
  canDelete: boolean
}) {
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const router = useRouter()

  if (!canDelete) return null

  async function handleDelete() {
    setLoading(true)
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      alert('Could not delete review: ' + error.message)
      setLoading(false)
      setConfirming(false)
      return
    }

    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
          Delete this review?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            padding: '3px 10px',
            background: '#E24B4A', color: '#fff',
            border: 'none', borderRadius: '5px',
            fontSize: '11px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          {loading ? '...' : 'Yes'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: '3px 10px',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '5px', fontSize: '11px', cursor: 'pointer',
          }}
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        padding: '3px 10px',
        background: 'transparent',
        color: '#E24B4A',
        border: '0.5px solid #F5BCBC',
        borderRadius: '5px', fontSize: '11px',
        cursor: 'pointer', fontWeight: 500,
      }}
    >
      Delete
    </button>
  )
}
