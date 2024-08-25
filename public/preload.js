const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

const electronAPI = {
  fileSystem: {
    openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
    getDreamVaultPath: () => ipcRenderer.invoke('get-dream-vault-path'),
    setDreamVaultPath: (path) => ipcRenderer.invoke('set-dream-vault-path', path),
    scanDreamVault: () => ipcRenderer.invoke('scan-dream-vault'),
    getMediaFilePath: (repoName) => ipcRenderer.invoke('get-media-file-path', repoName),
    getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
    readMetadata: (repoName) => ipcRenderer.invoke('read-metadata', repoName),
  },
  isElectron: true
};

contextBridge.exposeInMainWorld('electron', electronAPI);

console.log('Electron API exposed to renderer:', electronAPI);

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('window.electron:', window.electron);
});
