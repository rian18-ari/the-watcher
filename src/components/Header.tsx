import React from 'react'
import { usePortStore } from '../hooks/usePortStore'

export const AsteriskIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = '#ffffff' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <line x1="12" y1="2" x2="12" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" />
  </svg>
)

export const Header: React.FC = () => {
  const ports = usePortStore((s) => s.ports)
  const activeCount = ports.length

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* 1. Top Bar: Asterisk + 3-line typographic stamp + Minimal Hamburger lines */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px 14px 20px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AsteriskIcon size={22} color="#ffffff" />
          <div
            style={{
              fontSize: '8.5px',
              fontWeight: 600,
              letterSpacing: '0.08em',
              lineHeight: 1.25,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase'
            }}
          >
            <div>THE WATCHER.©</div>
            <div>PORT MONITOR.</div>
            <div>LOCAL RUNTIME.</div>
          </div>
        </div>

        {/* Minimal Swiss 2-bar glyph & live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-btn)',
              padding: '3px 8px',
              fontSize: '9.5px',
              fontFamily: 'var(--font-mono)',
              color: activeCount > 0 ? 'var(--accent-yellow)' : 'var(--text-tertiary)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '50%',
                background: activeCount > 0 ? 'var(--accent-yellow)' : 'var(--text-muted)',
                boxShadow: activeCount > 0 ? '0 0 6px var(--accent-yellow)' : 'none'
              }}
            />
            <span>{activeCount} {activeCount === 1 ? 'PORT' : 'PORTS'}</span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              width: '16px',
              opacity: 0.65
            }}
            title="Edge HUD Active"
          >
            <div style={{ height: '1.5px', background: '#fff', width: '100%' }} />
            <div style={{ height: '1.5px', background: '#fff', width: '100%' }} />
          </div>
        </div>
      </div>

      {/* 2. Hero Editorial Headline: The Watcher.© / Ports. (Yellow) / Listening. */}
      <div
        style={{
          padding: '4px 20px 16px 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            fontSize: '26px',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.035em',
            color: 'var(--text-primary)'
          }}
        >
          <div>The Watcher.©</div>
          <div style={{ color: 'var(--accent-yellow)' }}>Ports.</div>
          <div>Listening.</div>
        </div>
      </div>

      {/* 3. Hairline Rule */}
      <div style={{ height: '1px', background: 'var(--border-hairline)', width: '100%' }} />

      {/* 4. Sub-Navigation / Metadata Ticker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-tertiary)',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>PORT</span>
          <span>RUNTIME</span>
          <span>PID</span>
          <span>LOCALHOST</span>
        </div>

        <div
          style={{
            border: '1px solid var(--border-hairline)',
            borderRadius: '4px',
            padding: '2px 7px',
            fontSize: '8.5px',
            color: 'var(--text-secondary)',
            letterSpacing: '0.06em'
          }}
        >
          LIVE SCAN
        </div>
      </div>

      {/* 5. Hairline Rule */}
      <div style={{ height: '1px', background: 'var(--border-hairline)', width: '100%' }} />

      {/* 6. Editorial Section Title: "Services" / "Active Ports" */}
      <div
        style={{
          padding: '14px 20px 10px 20px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between'
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)'
            }}
          >
            Services
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)'
            }}
          >
            {activeCount} Active
          </div>
        </div>

        {/* Editorial Subtitle Metadata & Description */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginTop: '8px',
            fontSize: '10.5px',
            color: 'var(--text-secondary)'
          }}
        >
          <span style={{ fontWeight: 600, color: '#fff' }}>Localhost HUD</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>Zero-Config</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>Edge Auto-Reveal</span>
        </div>
      </div>

      {/* 7. Bottom Hairline before Port items */}
      <div style={{ height: '1px', background: 'var(--border-hairline)', width: '100%' }} />
    </div>
  )
}
