'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CancelRequestButton({ requestId }: { requestId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const router = useRouter()

  async function cancel() {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('stay_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId)
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          Cancel this request?
        </span>
        <button
          onClick={cancel}
          disabled={loading}
          style={{
            padding: '5px 12px',
            background: '#E24B4A', color: '#fff',
            border: 'none', borderRadius: '6px',
            fontSize: '12px', fontWeight: 500, cursor: 'pointer',
          }}
        >
          {loading ? '...' : 'Yes, cancel'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            padding: '5px 12px',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
          }}
        >
          No, keep it
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        padding: '6px 14px',
        background: 'transparent',
        color: 'var(--color-text-tertiary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '6px', fontSize: '12px',
        cursor: 'pointer', fontWeight: 500,
      }}
    >
      Cancel request
    </button>
  )
}
