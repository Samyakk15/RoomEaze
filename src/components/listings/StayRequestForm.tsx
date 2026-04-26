'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function StayRequestForm({
  listingId,
  hostId,
  userId,
}: {
  listingId: string
  hostId:    string
  userId:    string
}) {
  const [moveInDate, setMoveInDate] = useState('')
  const [duration,   setDuration]   = useState('1')
  const [message,    setMessage]    = useState('')
  const [loading,    setLoading]    = useState(false)
  const [submitted,  setSubmitted]  = useState(false)
  const [error,      setError]      = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!moveInDate) {
      setError('Please select a move-in date')
      return
    }

    setLoading(true)

    const { data: existing } = await supabase
      .from('stay_requests')
      .select('id')
      .eq('guest_id', userId)
      .eq('listing_id', listingId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle()

    if (existing) {
      setError('You already have an active request for this listing.')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase
      .from('stay_requests')
      .insert({
        listing_id:      listingId,
        guest_id:        userId,
        host_id:         hostId,
        move_in_date:    moveInDate,
        duration_months: Number(duration),
        message:         message.trim() || null,
        status:          'pending',
      })

    if (insertErr) {
      setError('Failed to send request: ' + insertErr.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="alert-success" style={{ textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>
          Request sent successfully!
        </div>
        <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '16px' }}>
          The host will review your request and contact you soon.
        </div>
        <a href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          View in dashboard →
        </a>
      </div>
    )
  }

  return (
    <div className="form-box">
      <div className="form-section-title">Send stay request</div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="form-field">
            <label className="form-label">
              Move-in date <span className="required">*</span>
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={e => setMoveInDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-field">
            <label className="form-label">Duration</label>
            <select value={duration} onChange={e => setDuration(e.target.value)}>
              {[1,2,3,4,5,6,8,10,12,18,24].map(n => (
                <option key={n} value={n}>{n} month{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">
              Message to host
              <span style={{ fontSize: '11px', color: '#999', fontWeight: 400, marginLeft: '6px' }}>
                (optional but recommended)
              </span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself, mention your college, purpose of stay..."
              maxLength={300}
              style={{ minHeight: '90px' }}
            />
            <div className="form-hint">{message.length}/300</div>
          </div>

          {error && <div className="alert-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Sending request...' : 'Send stay request'}
          </button>

          <p style={{ fontSize: '11px', color: '#999', textAlign: 'center' }}>
            The host will contact you directly after reviewing your request
          </p>
        </div>
      </form>
    </div>
  )
}
