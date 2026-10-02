import React, { useState, useEffect } from 'react'
import { Globe, Square, Cpu, ShieldCheck } from 'lucide-react'
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
  const secondaryName = item.projectDirName && item.scriptName ? item.scriptName : item.processName

  return (
    <div
      style={{
        background: item.isSystem ? 'rgba(22, 27, 34, 0.5)' : 'var(--bg-card)',
        borderRadius: 'var(--radius-card)',
        border: item.isSystem ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid var(--border-light)',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxSizing: 'border-box',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Top row: Port + Names & Label + Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Left: Port badge + Title + Label tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: 0,
            flex: 1,
            marginRight: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Port Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: item.isSystem ? 'rgba(255, 255, 255, 0.06)' : 'rgba(34, 197, 94, 0.12)',
              border: item.isSystem ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(34, 197, 94, 0.25)',
              color: item.isSystem ? 'var(--text-secondary)' : 'var(--status-running)',
              padding: '2px 7px',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
              fontSize: '12px',
              flexShrink: 0
            }}
          >
            {!item.isSystem && (
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: 'var(--status-running)',
                  boxShadow: '0 0 6px var(--status-running)'
                }}
              />
            )}
            <span>:{item.port}</span>
          </div>

          {/* Titles & Label */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              flex: 1,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                minWidth: 0,
                overflow: 'hidden'
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  color: item.isSystem ? 'var(--text-secondary)' : 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={displayName}
              >
                {displayName}
              </span>

              {/* Tag Label next to app/web name */}
              <span
                style={{
                  fontSize: '10px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  flexShrink: 0,
                  background: item.isSystem ? 'rgba(255, 255, 255, 0.07)' : 'rgba(99, 102, 241, 0.15)',
                  color: item.isSystem ? 'var(--text-tertiary)' : '#818cf8',
                  border: item.isSystem ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(99, 102, 241, 0.25)'
                }}
              >
                {item.isSystem ? 'System' : 'Dev'}
              </span>
            </div>

            {secondaryName && secondaryName !== displayName && (
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={secondaryName}
              >
                {secondaryName}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
          <button
            onClick={handleOpenBrowser}
            title={`Open http://localhost:${item.port}`}
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              borderRadius: '6px',
              padding: '4px 7px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '11px',
              fontWeight: 500
            }}
          >
            <Globe size={11} />
            <span>Open</span>
          </button>

          {!item.isSystem ? (
            <button
              onClick={handleKill}
              disabled={killing}
              title={`Kill PID ${item.pid} and free port ${item.port}`}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '6px',
                padding: '4px 7px',
                cursor: killing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: 500,
                opacity: killing ? 0.5 : 1
              }}
            >
              <Square size={9} fill="#f87171" />
              <span>{killing ? '...' : 'Kill'}</span>
            </button>
          ) : (
            <div
              title="System process protected to prevent OS instability"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '10.5px',
                color: 'var(--text-tertiary)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '3px 6px',
                borderRadius: '5px'
              }}
            >
              <ShieldCheck size={11} color="var(--text-tertiary)" />
              <span>OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row: Process info and duration */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--divider)',
          paddingTop: '6px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-mono)',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          title={`${item.processName} (PID ${item.pid})`}
        >
          <Cpu size={11} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.processName}</span>
          <span style={{ opacity: 0.5, flexShrink: 0 }}>(PID {item.pid})</span>
        </div>

        <div style={{ flexShrink: 0, fontSize: '10.5px', marginLeft: '6px' }}>
          <span>{formatDuration(elapsed)}</span>
        </div>
      </div>
    </div>
  )
}
