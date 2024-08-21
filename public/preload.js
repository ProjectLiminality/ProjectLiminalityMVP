const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  isElectron: true
});
};

console.log('Exposing electron API:', electronAPI);

contextBridge.exposeInMainWorld('electron', electronAPI);
console.log('Electron API exposed to renderer');

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('window.electron:', window.electron);
});
