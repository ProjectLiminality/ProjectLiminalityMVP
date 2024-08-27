const fs = require('fs').promises;
const path = require('path');
const { dialog } = require('electron');

function setupHandlers(ipcMain, store) {
  // ... existing handlers ...

  ipcMain.handle('read-file', async (event, filePath) => {
    try {
      const data = await fs.promises.readFile(filePath);
      return data.toString('base64');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  });
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

  ipcMain.handle('get-media-file-path', async (event, repoName) => {
    const dreamVaultPath = store.get('dreamVaultPath');
    const repoPath = path.join(dreamVaultPath, repoName);
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.mp3', '.wav', '.ogg'];
    
    try {
      for (const ext of supportedExtensions) {
        const filePath = path.join(repoPath, `${repoName}${ext}`);
        try {
          await fs.access(filePath);
          return filePath;
        } catch (error) {
          // File doesn't exist, continue to next extension
        }
      }
      
      console.log(`No matching media file found for ${repoName}`);
      return null;
    } catch (error) {
      console.error(`Error searching for media file for ${repoName}:`, error);
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
}

module.exports = { setupHandlers };
