'use client'

import Link from 'next/link'

export default function HostNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {[
        { label: 'Overview',      href: '/host/dashboard' },
        { label: 'My listings',   href: '/host/listings' },
        { label: 'Add listing',   href: '/host/listings/new' },
        { label: 'Stay requests', href: '/host/requests' },
        { label: 'Profile',       href: '/host/profile' },
      ].map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            textDecoration: 'none',
            background: 'transparent',
            display: 'block',
            transition: 'background .15s',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.background = 'var(--color-background-primary)'
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.background = 'transparent'
          }}
        >
          {link.label}
        </Link>
      ))}

      <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', marginTop: '8px', paddingTop: '8px' }}>
        <Link
          href="/"
          style={{
            padding: '9px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            color: 'var(--color-text-tertiary)',
            textDecoration: 'none',
            display: 'block',
          }}
        >
          ← Back to site
        </Link>
      </div>
    </nav>
  )
}
