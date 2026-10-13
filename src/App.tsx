import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePortStore } from './hooks/usePortStore'
import { useEdgeHover } from './hooks/useEdgeHover'
import { Header } from './components/Header'
import { WatcherLogo } from './components/WatcherLogo'
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
          background: 'var(--bg-deep)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRight: '1px solid var(--border-subtle)',
          borderTopRightRadius: 'var(--radius-panel)',
          borderBottomRightRadius: 'var(--radius-panel)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '0 16px 50px rgba(0, 0, 0, 0.75), 0 0 1px rgba(255, 255, 255, 0.15)' : 'none',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        {/* Header from Reference */}
        <Header />

        {/* Scrollable Cards List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            padding: '0 24px 28px 24px',
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
                padding: '40px 20px',
                color: 'var(--text-secondary)',
                gap: '16px'
              }}
            >
              <div
                style={{
                  width: '84px',
                  height: '58px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)'
                }}
              >
                <WatcherLogo height={32} variant="white" />
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '17px',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                    marginBottom: '6px'
                  }}
                >
                  No active ports
                </div>
                <div
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--text-tertiary)',
                    lineHeight: 1.5,
                    maxWidth: '260px',
                    margin: '0 auto'
                  }}
                >
                  Run <code>npm run dev</code> or any local server in terminal to automatically track it here.
                </div>
              </div>
            </div>
          ) : (
            ports.map((portItem) => (
              <PortCard key={`${portItem.port}-${portItem.pid}`} item={portItem} />
            ))
          )}
        </div>
      </motion.aside>
    </div>
  )
}
