const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const isDev = require('electron-is-dev');

// Silence console output in production
if (!isDev) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
const Store = require('electron-store');
const { setupHandlers } = require('./ipcHandlers');
const fs = require('fs').promises;

const store = new Store();

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
      sandbox: true,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
    },
  });

  // Set Content Security Policy
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; img-src 'self' data:; media-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval';"]
      }
    })
  });

  // Load the index.html from a url
  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Open the DevTools in development mode.
  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  // Setup IPC handlers
  setupHandlers(ipcMain, store);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
