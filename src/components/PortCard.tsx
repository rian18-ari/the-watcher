import React, { useState, useEffect } from 'react'
import { ArrowUpRight, X, Shield } from 'lucide-react'
import type { ActivePort } from '../../shared/types'
import { usePortStore } from '../hooks/usePortStore'

interface PortCardProps {
  item: ActivePort
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min}m`
  const hr = Math.floor(min / 60)
  return `${hr}h ${min % 60}m`
}

export const PortCard: React.FC<PortCardProps> = ({ item }) => {
  const killPort = usePortStore((s) => s.killPort)
  const openUrl = usePortStore((s) => s.openUrl)
  const [elapsed, setElapsed] = useState(() => Date.now() - item.firstSeen)
  const [killing, setKilling] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - item.firstSeen)
    }, 1000)
    return () => clearInterval(timer)
  }, [item.firstSeen])

  const handleOpenBrowser = () => {
    openUrl(`http://localhost:${item.port}`)
  }

  const handleKill = async () => {
    if (item.isSystem) return
    setKilling(true)
    await killPort(item.pid)
  }

  const displayName = item.projectDirName || item.scriptName || item.processName
  const secondaryName = item.projectDirName && item.scriptName ? item.scriptName : null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        padding: '14px 20px',
        boxSizing: 'border-box',
        borderBottom: '1px solid var(--border-hairline)',
        background: isHovered
          ? 'rgba(255, 255, 255, 0.035)'
          : 'transparent',
        transition: 'background 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
        position: 'relative'
      }}
    >
      {/* Top Line: Port & Project Name + Label Badge + Action Outline Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Left: Port Number + Project Title + Label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            flex: 1,
            overflow: 'hidden'
          }}
        >
          {/* Port Badge with Amber/Yellow Accent */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '-0.02em',
              color: item.isSystem ? 'var(--text-secondary)' : 'var(--accent-yellow)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <span>:{item.port}</span>
          </div>

          {/* Project / Command Name */}
          <span
            style={{
              fontWeight: 600,
              fontSize: '13.5px',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              letterSpacing: '-0.015em'
            }}
            title={displayName}
          >
            {displayName}
          </span>

          {/* Swiss Minimal Label: [ DEV ] or [ SYSTEM ] */}
          <span
            style={{
              fontSize: '8.5px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              padding: '2px 5px',
              borderRadius: '3px',
              flexShrink: 0,
              color: item.isSystem ? 'var(--text-tertiary)' : 'var(--accent-yellow)',
              background: item.isSystem ? 'rgba(255, 255, 255, 0.06)' : 'var(--accent-yellow-dim)',
              border: item.isSystem ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid var(--accent-yellow-border)'
            }}
          >
            {item.isSystem ? 'System' : 'Dev'}
          </span>
        </div>

        {/* Right: Outline Wireframe Actions (Matching Reference Buttons) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {/* Open Button */}
          <button
            onClick={handleOpenBrowser}
            title={`Open http://localhost:${item.port}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              borderRadius: 'var(--radius-btn)',
              border: '1px solid var(--border-hairline)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-primary)',
              fontSize: '10px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hairline)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            }}
          >
            <span>Open</span>
            <ArrowUpRight size={11} strokeWidth={2.2} />
          </button>

          {/* Kill / Protected Button */}
          {!item.isSystem ? (
            <button
              onClick={handleKill}
              disabled={killing}
              title={`Kill PID ${item.pid}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: 'var(--radius-btn)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                background: 'rgba(239, 68, 68, 0.04)',
                color: '#f87171',
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: killing ? 'not-allowed' : 'pointer',
                opacity: killing ? 0.4 : 1,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!killing) {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)'
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                }
              }}
              onMouseLeave={(e) => {
                if (!killing) {
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)'
                }
              }}
            >
              <span>{killing ? '...' : 'Kill'}</span>
              <X size={10} strokeWidth={2.2} />
            </button>
          ) : (
            <div
              title="System process protected"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '3px 7px',
                borderRadius: 'var(--radius-btn)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-tertiary)',
                fontSize: '9.5px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              <Shield size={10} strokeWidth={2} />
              <span>OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Metadata Line: Script/Path + PID + Elapsed Timer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '10.5px',
          color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '-0.01em',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ color: 'var(--text-secondary)' }}>{item.processName}</span>
          <span style={{ opacity: 0.4 }}>/</span>
          <span>PID {item.pid}</span>
          {secondaryName && (
            <>
              <span style={{ opacity: 0.4 }}>/</span>
              <span style={{ color: 'var(--text-muted)' }}>{secondaryName}</span>
            </>
          )}
        </div>

        <div style={{ flexShrink: 0, fontSize: '10px', color: 'var(--text-muted)' }}>
          {formatDuration(elapsed)}
        </div>
      </div>
    </div>
  )
}
