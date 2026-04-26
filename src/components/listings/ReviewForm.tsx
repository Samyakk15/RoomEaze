'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ReviewForm({
  listingId,
  userId,
}: {
  listingId: string
  userId:    string
}) {
  const [rating,  setRating]  = useState(0)
  const [hover,   setHover]   = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) { setError('Please select a star rating'); return }
    setLoading(true)
    setError('')

    const { error: insertErr } = await supabase
      .from('reviews')
      .insert({
        listing_id: listingId,
        guest_id:   userId,
        rating,
        comment:    comment.trim() || null,
      })

    if (insertErr) {
      // Already reviewed
      if (insertErr.code === '23505') {
        setError('You have already reviewed this listing.')
      } else {
        setError(insertErr.message)
      }
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) {
    return (
      <div style={{
        padding: '14px 16px',
        background: '#E1F5EE',
        border: '0.5px solid #5DCAA5',
        borderRadius: '10px',
        fontSize: '13px', color: '#085041',
        fontWeight: 500,
      }}>
        ✓ Thank you for your review!
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{
      border: '0.5px solid var(--color-border-tertiary)',
      borderRadius: '10px',
      padding: '16px',
      background: 'var(--color-background-secondary)',
      marginTop: '12px',
    }}>
      <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
        Leave a review
      </div>

      {/* Star rating */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', padding: '2px',
              fontSize: '28px',
              color: star <= (hover || rating) ? '#F5A623' : '#DDD',
              transition: 'color .1s',
            }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', alignSelf: 'center', marginLeft: '6px' }}>
            {['','Poor','Fair','Good','Very good','Excellent'][rating]}
          </span>
        )}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your experience with this room and host (optional)..."
        maxLength={400}
        style={{
          width: '100%', padding: '9px 12px',
          border: '0.5px solid var(--color-border-secondary)',
          borderRadius: '8px', fontSize: '13px',
          background: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
          resize: 'vertical', minHeight: '80px',
          outline: 'none', marginBottom: '10px',
        }}
      />
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '10px' }}>
        {comment.length}/400
      </div>

      {error && (
        <div style={{
          padding: '8px 12px', background: '#FCEBEB',
          border: '0.5px solid #F5BCBC', borderRadius: '7px',
          fontSize: '12px', color: '#791F1F', marginBottom: '10px',
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating === 0}
        style={{
          padding: '9px 20px',
          background: rating === 0 ? '#ccc' : '#1D9E75',
          color: '#fff', border: 'none', borderRadius: '8px',
          fontSize: '13px', fontWeight: 500,
          cursor: rating === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Submitting...' : 'Submit review'}
      </button>
    </form>
  )
}
