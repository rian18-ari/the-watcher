import React from 'react'
import { MonitorOff, ShieldCheck, Gauge, Bell, Power, ArrowLeft, RefreshCw } from 'lucide-react'
import { usePortStore } from '../hooks/usePortStore'

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      width: '44px',
      height: '24px',
      borderRadius: '9999px',
      background: checked ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.15)',
      padding: '2px',
      boxSizing: 'border-box',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      transition: 'background 0.2s ease',
      flexShrink: 0
    }}
  >
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: '#ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
        transform: checked ? 'translateX(20px)' : 'translateX(0px)',
        transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    />
  </div>
)

export const SettingsView: React.FC = () => {
  const settings = usePortStore((s) => s.settings)
  const updateSettings = usePortStore((s) => s.updateSettings)
  const setCurrentView = usePortStore((s) => s.setCurrentView)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '0 24px 28px 24px',
        boxSizing: 'border-box',
        overflowY: 'auto'
      }}
    >
      {/* 1. Fullscreen Protection (User's primary request) */}
      <div
        style={{
          width: '100%',
          padding: '18px 20px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-card)',
          border: '1.2px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: settings.disableOnFullscreen ? 'var(--accent-cyan-bg)' : 'rgba(255, 255, 255, 0.05)',
                color: settings.disableOnFullscreen ? 'var(--accent-cyan)' : 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <MonitorOff size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                Mute saat Fullscreen
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: 1.45 }}>
                Mencegah panel shelf muncul secara tidak sengaja saat bermain game, menonton video/film, atau presentasi layar penuh.
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.disableOnFullscreen}
            onChange={(checked) => updateSettings({ disableOnFullscreen: checked })}
          />
        </div>

        {settings.disableOnFullscreen && (
          <div
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '11px',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>🛡️ DirectX, D3D fullscreen apps & browser F11 otomatis terdeteksi.</span>
          </div>
        )}
      </div>

      {/* 2. Edge Trigger Sensitivity (Dwell Delay) */}
      <div
        style={{
          width: '100%',
          padding: '18px 20px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-card)',
          border: '1.2px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Gauge size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
              Sensitivitas Hover Tepian
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', lineHeight: 1.45 }}>
              Waktu jeda kursor harus berada di ujung layar sebelum panel meluncur terbuka.
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '4px' }}>
          {[
            { label: '50ms', desc: 'Cepat', val: 50 },
            { label: '90ms', desc: 'Standar', val: 90 },
            { label: '180ms', desc: 'Tenang', val: 180 }
          ].map((item) => {
            const isSelected = settings.dwellDelay === item.val
            return (
              <button
                key={item.val}
                onClick={() => updateSettings({ dwellDelay: item.val })}
                style={{
                  padding: '8px 4px',
                  borderRadius: '10px',
                  border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-card)',
                  background: isSelected ? 'var(--accent-cyan-bg)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.label}</span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>{item.desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Process & Scanning Controls */}
      <div
        style={{
          width: '100%',
          padding: '18px 20px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-card)',
          border: '1.2px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Toggle Show System Processes */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <ShieldCheck size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                Tampilkan Proses OS
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Menampilkan proses latar belakang sistem Windows di daftar Services.
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.showSystemProcesses}
            onChange={(checked) => updateSettings({ showSystemProcesses: checked })}
          />
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }} />

        {/* Scan Interval */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={14} color="var(--text-tertiary)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
              Interval Pemindaian Port
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { label: '1 Detik', val: 1000 },
              { label: '2 Detik', val: 2000 },
              { label: '5 Detik', val: 5000 }
            ].map((item) => {
              const isSelected = settings.scanInterval === item.val
              return (
                <button
                  key={item.val}
                  onClick={() => updateSettings({ scanInterval: item.val })}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '8px',
                    border: isSelected ? '1.5px solid var(--accent-cyan)' : '1px solid var(--border-card)',
                    background: isSelected ? 'var(--accent-cyan-bg)' : 'rgba(255, 255, 255, 0.02)',
                    color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 4. Windows Startup & Notifications */}
      <div
        style={{
          width: '100%',
          padding: '18px 20px',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-card)',
          background: 'var(--bg-card)',
          border: '1.2px solid var(--border-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        {/* Auto start on boot */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Power size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                Start on Windows Boot
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Otomatis menjalankan The Watcher saat komputer dinyalakan.
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.autoStartOnBoot}
            onChange={(checked) => updateSettings({ autoStartOnBoot: checked })}
          />
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }} />

        {/* Notify on new port */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <Bell size={18} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', lineHeight: 1.25 }}>
                Notifikasi Port Baru
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                Tampilkan toast notifikasi saat server lokal baru mulai berjalan.
              </div>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.notifyOnNewPort}
            onChange={(checked) => updateSettings({ notifyOnNewPort: checked })}
          />
        </div>
      </div>

      {/* Back to Services Pill Button */}
      <button
        onClick={() => setCurrentView('services')}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-pill)',
          border: '1.2px solid var(--border-pill-white)',
          background: 'rgba(255, 255, 255, 0.05)',
          color: '#ffffff',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          cursor: 'pointer',
          marginTop: '6px',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
        }}
      >
        <ArrowLeft size={16} />
        <span>Kembali ke Services</span>
      </button>

      {/* About footer */}
      <div
        style={{
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '4px',
          fontFamily: 'var(--font-mono)'
        }}
      >
        The Watcher v0.1.0 • Windows x64
      </div>
    </div>
  )
}
