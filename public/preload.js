const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script is running');

const electronAPI = {
  openDirectoryDialog: async () => {
    console.log('Calling openDirectoryDialog');
    try {
      const result = await ipcRenderer.invoke('open-directory-dialog');
      console.log('openDirectoryDialog result:', result);
      return result;
    } catch (error) {
      console.error('Error in openDirectoryDialog:', error);
      throw error;
    }
  },
  openFileDialog: async () => {
    console.log('Calling openFileDialog');
    try {
      const result = await ipcRenderer.invoke('open-file-dialog');
      console.log('openFileDialog result:', result);
      return result;
    } catch (error) {
      console.error('Error in openFileDialog:', error);
      throw error;
    }
  },
  isElectron: true
};

console.log('Exposing electron API:', electronAPI);

try {
  contextBridge.exposeInMainWorld('electron', electronAPI);
  console.log('Electron API exposed to renderer');
} catch (error) {
  console.error('Failed to expose Electron API:', error);
}

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event fired');
  console.log('window.electron:', window.electron);
});
