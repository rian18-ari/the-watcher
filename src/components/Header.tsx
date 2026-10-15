import React from 'react'
import { Settings, ArrowLeft } from 'lucide-react'
import { usePortStore } from '../hooks/usePortStore'
import { WatcherLogo } from './WatcherLogo'

export const Header: React.FC = () => {
  const ports = usePortStore((s) => s.ports)
  const currentView = usePortStore((s) => s.currentView)
  const setCurrentView = usePortStore((s) => s.setCurrentView)
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
      {/* Top Bar: Official Eye Logo + Pill Badge & Settings Toggle */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '26px',
          width: '100%'
        }}
      >
        <div
          onClick={() => setCurrentView('services')}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          title="The Watcher"
        >
          <WatcherLogo height={42} variant="white" />
        </div>

        {/* Right side controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentView === 'services' ? (
            <>
              {/* Pill Badge: "2 ports" / "0 ports" */}
              <div
                style={{
                  border: '1.5px solid var(--border-pill-white)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '5px 14px',
                  fontSize: '13px',
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

              {/* Settings Gear Button */}
              <button
                onClick={() => setCurrentView('settings')}
                title="Settings"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.2px solid var(--border-card)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-secondary)'
                  e.currentTarget.style.borderColor = 'var(--border-card)'
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                }}
              >
                <Settings size={16} />
              </button>
            </>
          ) : (
            /* Back to Services Pill Button */
            <button
              onClick={() => setCurrentView('services')}
              style={{
                border: '1.5px solid var(--border-pill-white)',
                borderRadius: 'var(--radius-pill)',
                padding: '5px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
              }}
            >
              <ArrowLeft size={14} />
              <span>Services</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Title: "Services" or "Settings" */}
      <div
        style={{
          fontSize: '38px',
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.025em',
          color: 'var(--text-primary)'
        }}
      >
        {currentView === 'services' ? 'Services' : 'Settings'}
      </div>
    </div>
  )
}
