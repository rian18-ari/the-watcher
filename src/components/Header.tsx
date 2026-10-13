import React from 'react'
import { usePortStore } from '../hooks/usePortStore'
import { WatcherLogo } from './WatcherLogo'

export const Header: React.FC = () => {
  const ports = usePortStore((s) => s.ports)
  const activeCount = ports.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '28px 24px 16px 24px',
        boxSizing: 'border-box',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* Top Bar: Official Eye Logo + Pill Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <WatcherLogo size={36} variant="white" />
        </div>

        {/* Pill Badge: "2 ports" / "0 ports" */}
        <div
          style={{
            border: '1.5px solid var(--border-pill-white)',
            borderRadius: 'var(--radius-pill)',
            padding: '5px 14px',
            fontSize: '13.5px',
            fontWeight: 600,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}
        >
          {activeCount} {activeCount === 1 ? 'port' : 'ports'}
        </div>
      </div>

      {/* Main Title: "Services" */}
      <div
        style={{
          fontSize: '38px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)'
        }}
      >
        Services
      </div>
    </div>
  )
}
