const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectoryDialog: () => ipcRenderer.send('open-directory-dialog'),
  onSelectedDirectory: (callback) => ipcRenderer.on('selected-directory', callback),
  removeSelectedDirectoryListener: () => ipcRenderer.removeAllListeners('selected-directory')
});
