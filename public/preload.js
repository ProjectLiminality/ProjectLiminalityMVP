const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  isElectron: true
};

contextBridge.exposeInMainWorld('electron', electronAPI);
console.log('Electron API exposed to renderer');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('window.electron:', window.electron);
});
