import React from 'react'
import { Radio } from 'lucide-react'
import { usePortStore } from '../hooks/usePortStore'

export const Header: React.FC = () => {
  const ports = usePortStore((s) => s.ports)
  const activeCount = ports.length

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 18px',
        borderBottom: '1px solid var(--divider)',
        background: 'rgba(255, 255, 255, 0.02)',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)',
            flexShrink: 0
          }}
        >
          <Radio size={15} color="#fff" />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '-0.2px' }}>
            Port Monitor
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: activeCount > 0 ? 'var(--status-running)' : 'var(--text-tertiary)',
                boxShadow: activeCount > 0 ? '0 0 8px var(--status-running-glow)' : 'none'
              }}
            />
            {activeCount > 0
              ? `${activeCount} active port${activeCount > 1 ? 's' : ''}`
              : 'No active ports'}
          </div>
        </div>
      </div>
    </header>
  )
}
