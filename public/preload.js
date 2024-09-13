const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fileSystem: {
    getMediaFilePath: (repoName, fileName) => ipcRenderer.invoke('get-media-file-path', repoName, fileName),
    getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
    readMetadata: (repoName) => ipcRenderer.invoke('read-metadata', repoName),
    writeMetadata: (repoName, metadata) => ipcRenderer.invoke('write-metadata', repoName, metadata),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    listFiles: (repoName) => ipcRenderer.invoke('list-files', repoName),
    renameRepo: (oldName, newName) => ipcRenderer.invoke('rename-repo', oldName, newName),
  },
  getDreamVaultPath: () => ipcRenderer.invoke('get-dream-vault-path'),
  setDreamVaultPath: (path) => ipcRenderer.invoke('set-dream-vault-path', path),
  scanDreamVault: () => ipcRenderer.invoke('scan-dream-vault'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  isElectron: true
});

