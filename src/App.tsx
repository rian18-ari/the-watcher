import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePortStore } from './hooks/usePortStore'
import { useEdgeHover } from './hooks/useEdgeHover'
import { Header, AsteriskIcon } from './components/Header'
import { PortCard } from './components/PortCard'

export const App: React.FC = () => {
  const isOpen = usePortStore((s) => s.isOpen)
  const ports = usePortStore((s) => s.ports)
  const setPorts = usePortStore((s) => s.setPorts)
  const { handlePanelMouseEnter, handlePanelMouseLeave } = useEdgeHover()

  useEffect(() => {
    const bridge = window.watcher || window.edgemon
    if (!bridge) return

    // Initial state load
    bridge.loadState().then(({ ports }) => {
      setPorts(ports)
    })

    // Real-time port broadcast listener
    const unsubPorts = bridge.onPortsUpdate((updated) => {
      setPorts(updated)
    })

    // Real-time shelf toggle listener (from tray, shortcut, notification)
    const unsubToggle = bridge.onToggleShelf?.((forceOpen) => {
      const current = usePortStore.getState().isOpen
      const next = typeof forceOpen === 'boolean' ? forceOpen : !current
      usePortStore.getState().setIsOpen(next)
    })

    return () => {
      unsubPorts()
      if (unsubToggle) unsubToggle()
    }
  }, [setPorts])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none'
      }}
    >
      <motion.aside
        onMouseEnter={handlePanelMouseEnter}
        onMouseLeave={handlePanelMouseLeave}
        initial={{ x: -430 }}
        animate={{ x: isOpen ? 0 : -430 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        style={{
          width: '420px',
          maxWidth: '100%',
          height: '100vh',
          background: 'radial-gradient(ellipse 360px 220px at bottom left, rgba(234, 88, 12, 0.09), transparent 75%), var(--bg-deep)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRight: '1px solid var(--border-hairline)',
          borderTopRightRadius: 'var(--radius-panel)',
          borderBottomRightRadius: 'var(--radius-panel)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '0 16px 50px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.2)' : 'none',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Editorial Header */}
        <Header />

        {/* Scrollable Port Rows List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
          }}
        >
          {ports.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 28px',
                color: 'var(--text-secondary)',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'var(--accent-yellow-dim)',
                  border: '1px solid var(--accent-yellow-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(255, 184, 0, 0.08)'
                }}
              >
                <AsteriskIcon size={22} color="var(--accent-yellow)" />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '16px',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    marginBottom: '6px'
                  }}
                >
                  No Active Ports
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.55,
                    maxWidth: '280px',
                    margin: '0 auto'
                  }}
                >
                  Listening on localhost sockets (:3000, :5173, :8080, ...). Run any dev server or background script in terminal to track it here.
                </div>
              </div>

              <div
                style={{
                  border: '1px solid var(--border-hairline)',
                  borderRadius: 'var(--radius-btn)',
                  padding: '4px 10px',
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.08em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}
              >
                SCANNING LOCALHOST • 2s
              </div>
            </div>
          ) : (
            ports.map((portItem) => (
              <PortCard key={`${portItem.port}-${portItem.pid}`} item={portItem} />
            ))
          )}
        </div>

        {/* Editorial Footer Strip */}
        <div
          style={{
            borderTop: '1px solid var(--border-hairline)',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            flexShrink: 0,
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          <div>THE WATCHER.© 2026</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--accent-yellow)'
              }}
            />
            <span>EDGE HUD ACTIVE</span>
          </div>
        </div>
      </motion.aside>
    </div>
  )
}
