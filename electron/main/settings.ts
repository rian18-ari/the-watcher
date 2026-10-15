import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { WatcherSettings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'

let currentSettings: WatcherSettings = { ...DEFAULT_SETTINGS }
const listeners: Array<(settings: WatcherSettings) => void> = []

function getSettingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function initSettings(): WatcherSettings {
  try {
    const file = getSettingsPath()
    if (existsSync(file)) {
      const data = JSON.parse(readFileSync(file, 'utf-8'))
      currentSettings = { ...DEFAULT_SETTINGS, ...data }
    } else {
      currentSettings = { ...DEFAULT_SETTINGS }
      saveToDisk(currentSettings)
    }
  } catch (err) {
    console.error('[settings] Failed loading settings:', err)
    currentSettings = { ...DEFAULT_SETTINGS }
  }

  // Sync autoStartOnBoot with actual Windows setting
  try {
    const loginItem = app.getLoginItemSettings()
    currentSettings.autoStartOnBoot = loginItem.openAtLogin
  } catch {
    // Ignore
  }

  return currentSettings
}

export function getSettings(): WatcherSettings {
  return { ...currentSettings }
}

export function saveSettings(partial: Partial<WatcherSettings>): WatcherSettings {
  currentSettings = { ...currentSettings, ...partial }
  saveToDisk(currentSettings)

  // Apply auto-start change if modified
  if (partial.autoStartOnBoot !== undefined) {
    try {
      app.setLoginItemSettings({
        openAtLogin: partial.autoStartOnBoot,
        path: process.execPath,
        args: ['--hidden']
      })
    } catch (err) {
      console.error('[settings] Failed to set login item:', err)
    }
  }

  for (const listener of listeners) {
    try {
      listener(currentSettings)
    } catch {
      // Ignore
    }
  }

  return { ...currentSettings }
}

export function onSettingsChanged(callback: (settings: WatcherSettings) => void): () => void {
  listeners.push(callback)
  return () => {
    const idx = listeners.indexOf(callback)
    if (idx !== -1) listeners.splice(idx, 1)
  }
}

function saveToDisk(settings: WatcherSettings): void {
  try {
    const file = getSettingsPath()
    writeFileSync(file, JSON.stringify(settings, null, 2), 'utf-8')
  } catch (err) {
    console.error('[settings] Failed saving settings to disk:', err)
  }
}
