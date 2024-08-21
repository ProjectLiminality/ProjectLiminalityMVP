const path = require('path');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      worldSafeExecuteJavaScript: true,
    },
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

  // Handle directory selection
  ipcMain.on('open-directory-dialog', (event) => {
    dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    }).then(result => {
      if (!result.canceled) {
        event.reply('selected-directory', result.filePaths[0]);
      }
    }).catch(err => {
      console.log(err);
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
