const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
});
