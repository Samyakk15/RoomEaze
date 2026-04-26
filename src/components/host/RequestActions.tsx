'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RequestActions({ requestId }: { requestId: string }) {
  const [loading, setLoading]           = useState<'accept' | 'reject' | null>(null)
  const [showRejectInput, setShowRejectInput] = useState(false)
  const [reason, setReason]             = useState('')
  const router = useRouter()

  async function accept() {
    setLoading('accept')
    const supabase = createClient()
    await supabase
      .from('stay_requests')
      .update({ status: 'accepted' })
      .eq('id', requestId)
    setLoading(null)
    router.refresh()
  }

  async function reject() {
    if (!reason.trim()) return
    setLoading('reject')
    const supabase = createClient()
    await supabase
      .from('stay_requests')
      .update({ status: 'rejected', rejection_reason: reason.trim() })
      .eq('id', requestId)
    setLoading(null)
    setShowRejectInput(false)
    router.refresh()
  }

  if (showRejectInput) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '200px' }}>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason for rejection..."
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '12px',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: '6px',
            resize: 'none',
            minHeight: '60px',
            background: 'var(--color-background-primary)',
            color: 'var(--color-text-primary)',
          }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={reject}
            disabled={!reason.trim() || loading === 'reject'}
            style={{
              flex: 1, padding: '7px',
              background: loading === 'reject' ? '#ccc' : '#E24B4A',
              color: '#fff', border: 'none',
              borderRadius: '6px', fontSize: '12px',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            {loading === 'reject' ? '...' : 'Confirm reject'}
          </button>
          <button
            onClick={() => { setShowRejectInput(false); setReason('') }}
            style={{
              padding: '7px 10px',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              border: '0.5px solid var(--color-border-secondary)',
              borderRadius: '6px',
              fontSize: '12px', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={accept}
        disabled={loading === 'accept'}
        style={{
          padding: '8px 16px',
          background: loading === 'accept' ? '#ccc' : '#1D9E75',
          color: '#fff',
          border: 'none',
          borderRadius: '7px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: loading === 'accept' ? 'not-allowed' : 'pointer',
        }}
      >
        {loading === 'accept' ? '...' : '✓ Accept'}
      </button>
      <button
        onClick={() => setShowRejectInput(true)}
        style={{
          padding: '8px 16px',
          background: 'transparent',
          color: '#E24B4A',
          border: '0.5px solid #F5BCBC',
          borderRadius: '7px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        ✕ Reject
      </button>
    </div>
  )
}
