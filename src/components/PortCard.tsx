import React, { useState, useEffect } from 'react'
import { ArrowUpRight, ChevronUp, Shield } from 'lucide-react'
import type { ActivePort } from '../../shared/types'
import { usePortStore } from '../hooks/usePortStore'

interface PortCardProps {
  item: ActivePort
}

function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  if (totalSec < 60) return `${totalSec}s`
  const min = Math.floor(totalSec / 60)
  const sec = totalSec % 60
  if (min < 60) {
    return sec > 0 ? `${min}m ${sec}s` : `${min}m`
  }
  const hr = Math.floor(min / 60)
  const remMin = min % 60
  if (hr < 24) {
    return remMin > 0 ? `${hr}h ${remMin}m` : `${hr}h`
  }
  const days = Math.floor(hr / 24)
  const remHr = hr % 24
  return remHr > 0 ? `${days}d ${remHr}h` : `${days}d`
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
  const secondaryDetail = item.isSystem
    ? item.processName
    : item.projectDirName && item.scriptName
      ? item.scriptName
      : item.processName !== displayName
        ? item.processName
        : null

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%',
        padding: '18px 20px 16px 20px',
        boxSizing: 'border-box',
        borderRadius: 'var(--radius-card)',
        background: isHovered ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1.2px solid ${isHovered ? 'rgba(255, 255, 255, 0.28)' : 'var(--border-card)'}`,
        transition: 'all 0.18s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.35)' : 'none',
        position: 'relative'
      }}
    >
      {/* Top Row: Name + Port on Left | Action Pill Buttons on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          width: '100%'
        }}
      >
        {/* Left: Process/Project Name & Port */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            flex: 1
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontWeight: 700,
              lineHeight: 1.18,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={displayName}
          >
            {displayName}
          </div>

          <div
            style={{
              fontSize: '17px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginTop: '4px',
              letterSpacing: '-0.01em'
            }}
          >
            : {item.port}
          </div>
        </div>

        {/* Right: Actions (Pill buttons matching reference) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0,
            paddingTop: '2px'
          }}
        >
          {!item.isSystem ? (
            <>
              {/* Open Pill Button (Cyan border) */}
              <button
                onClick={handleOpenBrowser}
                title={`Open http://localhost:${item.port}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.2px solid var(--accent-cyan-border)',
                  background: 'var(--accent-cyan-bg)',
                  color: 'var(--accent-cyan)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)'
                  e.currentTarget.style.background = 'rgba(56, 189, 248, 0.18)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan-border)'
                  e.currentTarget.style.background = 'var(--accent-cyan-bg)'
                }}
              >
                <span>Open</span>
                <ArrowUpRight size={13} strokeWidth={2.4} />
              </button>

              {/* Kill Pill Button (Red border) */}
              <button
                onClick={handleKill}
                disabled={killing}
                title={`Kill PID ${item.pid}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: '1.2px solid var(--accent-red-border)',
                  background: 'var(--accent-red-bg)',
                  color: 'var(--accent-red)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: killing ? 'not-allowed' : 'pointer',
                  opacity: killing ? 0.45 : 1,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (!killing) {
                    e.currentTarget.style.borderColor = 'var(--accent-red)'
                    e.currentTarget.style.background = 'rgba(248, 113, 113, 0.18)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!killing) {
                    e.currentTarget.style.borderColor = 'var(--accent-red-border)'
                    e.currentTarget.style.background = 'var(--accent-red-bg)'
                  }
                }}
              >
                <span>{killing ? '...' : 'Kill'}</span>
                <ChevronUp size={13} strokeWidth={2.4} />
              </button>
            </>
          ) : (
            /* System OS Protected Pill Badge */
            <div
              title="Protected System Process"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 12px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--badge-os-bg)',
                color: 'var(--badge-os-text)',
                fontSize: '12.5px',
                fontWeight: 600,
                letterSpacing: '0.02em'
              }}
            >
              <Shield size={13} strokeWidth={2.2} fill="currentColor" />
              <span>OS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: PID / Process Detail on Left | Elapsed Duration on Right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12.5px',
          color: 'var(--text-tertiary)',
          width: '100%',
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
          <span>PID {item.pid}</span>
          {secondaryDetail && (
            <>
              <span style={{ opacity: 0.5 }}>/</span>
              <span
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={secondaryDetail}
              >
                {secondaryDetail}
              </span>
            </>
          )}
        </div>

        <div
          style={{
            flexShrink: 0,
            marginLeft: '8px',
            fontSize: '12.5px',
            color: 'var(--text-tertiary)'
          }}
        >
          {formatDuration(elapsed)}
        </div>
      </div>
    </div>
  )
}
