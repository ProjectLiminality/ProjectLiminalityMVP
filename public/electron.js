const path = require('path');
const fs = require('fs').promises;
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');

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
      enableRemoteModule: false,
    },
  });

  // Set Content Security Policy
  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'self\'; script-src \'self\'']
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

  // IPC handlers
  ipcMain.handle('open-directory-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    return result.filePaths[0];
  });

  ipcMain.handle('get-dream-vault-path', () => {
    return store.get('dreamVaultPath', '');
  });

  ipcMain.handle('set-dream-vault-path', (event, path) => {
    store.set('dreamVaultPath', path);
  });

  ipcMain.handle('scan-dream-vault', async () => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      return [];
    }

    try {
      const entries = await fs.readdir(dreamVaultPath, { withFileTypes: true });
      const gitRepos = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const repoPath = path.join(dreamVaultPath, entry.name);
          const gitDir = path.join(repoPath, '.git');
          try {
            await fs.access(gitDir);
            gitRepos.push(entry.name);
          } catch (error) {
            // Not a git repository, skip
          }
        }
      }

      return gitRepos;
    } catch (error) {
      console.error('Error scanning DreamVault:', error);
      return [];
    }
  });

  ipcMain.handle('read-metadata', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const metadataPath = path.join(dreamVaultPath, repoName, '.pl');
    try {
      const data = await fs.readFile(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading metadata for ${repoName}:`, error);
      throw error;
    }
  });

  ipcMain.handle('get-media-file', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath', '');
    if (!dreamVaultPath) {
      throw new Error('Dream Vault path not set');
    }

    const repoPath = path.join(dreamVaultPath, repoName);
    const mediaFormats = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];

    for (const format of mediaFormats) {
      const mediaPath = path.join(repoPath, `${repoName}.${format}`);
      try {
        await fs.access(mediaPath);
        const data = await fs.readFile(mediaPath);
        return {
          type: format === 'mp4' ? 'video' : 'image',
          data: data.toString('base64'),
          format
        };
      } catch (error) {
        // File doesn't exist or can't be accessed, continue to next format
      }
    }

    return null; // No media file found
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
const fs = require('fs').promises;
const path = require('path');

ipcMain.handle('get-media-file-path', async (event, repoName) => {
  const dreamVaultPath = store.get('dreamVaultPath');
  const repoPath = path.join(dreamVaultPath, repoName);
  const mediaDir = path.join(repoPath, 'media');
  
  try {
    const files = await fs.readdir(mediaDir);
    const mediaFile = files.find(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.ogg'].includes(ext);
    });
    
    return mediaFile ? path.join(mediaDir, mediaFile) : null;
  } catch (error) {
    console.error(`Error reading media directory for ${repoName}:`, error);
    return null;
  }
});

ipcMain.handle('get-file-stats', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      mtime: stats.mtime
    };
  } catch (error) {
    console.error(`Error getting file stats for ${filePath}:`, error);
    return null;
  }
});
