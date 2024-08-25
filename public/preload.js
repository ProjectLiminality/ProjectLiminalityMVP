const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

contextBridge.exposeInMainWorld('electronAPI', {
  fileSystem: {
    openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
    getDreamVaultPath: () => ipcRenderer.invoke('get-dream-vault-path'),
    setDreamVaultPath: (path) => ipcRenderer.invoke('set-dream-vault-path', path),
    scanDreamVault: () => ipcRenderer.invoke('scan-dream-vault'),
    getMediaFilePath: (repoName) => ipcRenderer.invoke('get-media-file-path', repoName),
    getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
  },
  isElectron: true
});

console.log('Electron API exposed to renderer');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('window.electronAPI:', window.electronAPI);
});
