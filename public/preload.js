const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  fileSystem: {
    getMediaFilePath: (repoName) => ipcRenderer.invoke('get-media-file-path', repoName),
    getDreamSongMediaFilePath: (repoName, fileName) => ipcRenderer.invoke('get-dreamsong-media-file-path', repoName, fileName),
    getFileStats: (filePath) => ipcRenderer.invoke('get-file-stats', filePath),
    readMetadata: (repoName) => ipcRenderer.invoke('read-metadata', repoName),
    writeMetadata: (repoName, metadata) => ipcRenderer.invoke('write-metadata', repoName, metadata),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    readDreamSongCanvas: (repoName) => ipcRenderer.invoke('read-dreamsong-canvas', repoName),
    listFiles: (repoName) => ipcRenderer.invoke('list-files', repoName),
    renameRepo: (oldName, newName) => ipcRenderer.invoke('rename-repo', oldName, newName),
    createNewNode: (nodeName) => ipcRenderer.invoke('create-new-node', nodeName),
    addFileToNode: (nodeName, file) => ipcRenderer.invoke('add-file-to-node', nodeName, file),
    stageFile: (nodeName, fileName) => ipcRenderer.invoke('stage-file', nodeName, fileName),
    commitChanges: (nodeName, commitMessage) => ipcRenderer.invoke('commit-changes', nodeName, commitMessage),
    getAllRepoNamesAndTypes: () => ipcRenderer.invoke('get-all-repo-names-and-types'),
    addSubmodule: (parentRepoName, submoduleRepoName) => ipcRenderer.invoke('add-submodule', parentRepoName, submoduleRepoName),
    updateSubmodules: (repoName) => ipcRenderer.invoke('update-submodules', repoName),
    copyRepositoryToDreamVault: (sourcePath, repoName) => ipcRenderer.invoke('copy-repository-to-dreamvault', sourcePath, repoName),
    unbundleRepositoryToDreamVault: (bundlePath, repoName) => ipcRenderer.invoke('unbundle-repository-to-dreamvault', bundlePath, repoName),
    createEmailDraft: (repoName) => ipcRenderer.invoke('create-email-draft', repoName),
  },
  getDreamVaultPath: () => ipcRenderer.invoke('get-dream-vault-path'),
  setDreamVaultPath: (path) => ipcRenderer.invoke('set-dream-vault-path', path),
  scanDreamVault: () => ipcRenderer.invoke('scan-dream-vault'),
  openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
  isElectron: true,
  openInFinder: (repoName) => ipcRenderer.invoke('open-in-finder', repoName),
  openInGitFox: (repoName) => ipcRenderer.invoke('open-in-gitfox', repoName),
});

