import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { initDatabase, saveToDisk } from './database'
import { registerAllHandlers } from './ipc'
import { connect, reload, isConnected } from './services/animalhub-bridge.service'
import { getSetting } from './services/settings.service'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // electron-vite sets ELECTRON_RENDERER_URL in dev mode
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  await initDatabase()
  registerAllHandlers()
  createWindow()

  // Auto-connect to AnimalHub if path is configured
  const hubPath = getSetting('animalhub_path')
  if (hubPath) {
    try {
      await connect(hubPath)
    } catch (e) {
      console.error('AnimalHub auto-connect failed:', e)
    }
  }

  // Hourly polling to reload AnimalHub data
  setInterval(() => {
    if (isConnected()) {
      try {
        reload()
      } catch (e) {
        console.error('AnimalHub reload failed:', e)
      }
    }
  }, 3600000) // 1 hour in milliseconds

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  saveToDisk()
})
