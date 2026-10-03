import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePortStore } from './hooks/usePortStore'
import { useEdgeHover } from './hooks/useEdgeHover'
import { Header } from './components/Header'
import { PortCard } from './components/PortCard'
import { Radio } from 'lucide-react'

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
        initial={{ x: -420 }}
        animate={{ x: isOpen ? 0 : -420 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        style={{
          width: '410px',
          maxWidth: '100%',
          height: '100vh',
          background: 'var(--bg-deep)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-active)',
          borderTopRightRadius: 'var(--radius-panel)',
          borderBottomRightRadius: 'var(--radius-panel)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isOpen ? '0 10px 40px rgba(0, 0, 0, 0.6)' : 'none',
          pointerEvents: 'auto',
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}
      >
        <Header />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
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
                padding: '24px',
                color: 'var(--text-secondary)',
                gap: '14px'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Radio size={20} color="var(--status-running)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  No active ports detected
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5, maxWidth: '260px' }}>
                  Whenever a local server runs on your machine (Vite, Next.js, Docker, Python, etc.), it will automatically appear here.
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
