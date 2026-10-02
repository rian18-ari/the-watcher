import { app, ipcMain, shell } from 'electron'
import { join } from 'node:path'
import { createWindow, setInteractive, sendToRenderer } from './window'
import { startPortWatcher, stopPortWatcher, getActivePorts, killPort, setPortsListener } from './portWatcher'
import { createTray, updateTrayPorts, destroyTray } from './tray'

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
}

app.whenReady().then(() => {
  const win = createWindow()

  // Initialize System Tray
  createTray()

  // Load the renderer UI
  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Hook port updates to renderer and system tray
  setPortsListener((ports) => {
    sendToRenderer('ports:update', ports)
    updateTrayPorts(ports.length)
  })

  // Start the background Port Watcher (scans every 2 seconds)
  startPortWatcher(2000)

  // Setup IPC Handlers
  ipcMain.handle('state:load', () => {
    return { ports: getActivePorts() }
  })

  ipcMain.handle('port:kill', async (_event, pid: number) => {
    return await killPort(pid)
  })

  ipcMain.handle('url:open', async (_event, url: string) => {
    await shell.openExternal(url)
  })

  ipcMain.handle('window:set-interactive', (_event, interactive: boolean) => {
    setInteractive(interactive)
  })
})

app.on('window-all-closed', () => {
  stopPortWatcher()
  destroyTray()
  app.quit()
})
