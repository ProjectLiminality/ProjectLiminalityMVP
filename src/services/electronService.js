export async function readFile(filePath) {
  if (!window.electron || !window.electron.fileSystem || typeof window.electron.fileSystem.readFile !== 'function') {
    console.warn('readFile function is not available in the electron context');
    return null;
  }
  try {
    return await window.electron.fileSystem.readFile(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return silently
      return null;
    }
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}


export async function readMetadata(repoName) {
  return window.electron.fileSystem.readMetadata(repoName);
}

export async function readDreamSongCanvas(repoName) {
  if (!window.electron || !window.electron.fileSystem || typeof window.electron.fileSystem.readDreamSongCanvas !== 'function') {
    console.error('readDreamSongCanvas function is not available in the electron context');
    return null;
  }
  return window.electron.fileSystem.readDreamSongCanvas(repoName);
}

export async function writeMetadata(repoName, metadata) {
  if (!window.electron || !window.electron.fileSystem || typeof window.electron.fileSystem.writeMetadata !== 'function') {
    console.error('writeMetadata function is not available in the electron context');
    throw new Error('writeMetadata function is not available');
  }
  return window.electron.fileSystem.writeMetadata(repoName, metadata);
}

export async function getMediaFilePath(repoName) {
  return window.electron.fileSystem.getMediaFilePath(repoName);
}

export async function getDreamSongMediaFilePath(repoName, fileName) {
  return window.electron.fileSystem.getDreamSongMediaFilePath(repoName, fileName);
}

export async function getFileStats(filePath) {
  return window.electron.fileSystem.getFileStats(filePath);
}

export async function listFiles(repoName) {
  if (!window.electron || !window.electron.fileSystem || typeof window.electron.fileSystem.listFiles !== 'function') {
    console.error('listFiles function is not available in the electron context');
    throw new Error('listFiles function is not available');
  }
  return window.electron.fileSystem.listFiles(repoName);
}

export async function renameRepo(oldName, newName) {
  if (!window.electron || !window.electron.fileSystem || typeof window.electron.fileSystem.renameRepo !== 'function') {
    console.error('renameRepo function is not available in the electron context');
    throw new Error('renameRepo function is not available');
  }
  try {
    const result = await window.electron.fileSystem.renameRepo(oldName, newName);
    if (!result) {
      throw new Error('Renaming operation failed');
    }
    return result;
  } catch (error) {
    console.error('Error in renameRepo:', error);
    throw error;
  }
}

export async function scanDreamVault() {
  return window.electron.scanDreamVault();
}

export async function getDreamVaultPath() {
  return window.electron.getDreamVaultPath();
}

export async function setDreamVaultPath(path) {
  return window.electron.setDreamVaultPath(path);
}

export const isElectronAvailable = () => {
  return !!window.electron;
};

export async function openDirectoryDialog() {
  if (isElectronAvailable()) {
    return window.electron.openDirectoryDialog();
  }
  throw new Error('Electron is not available');
}

export async function openInGitFox(repoName) {
  if (isElectronAvailable()) {
    return window.electron.openInGitFox(repoName);
  }
  throw new Error('Electron is not available');
}

export async function createNewNode(nodeName) {
  if (isElectronAvailable()) {
    if (!nodeName) {
      throw new Error('Node name is required');
    }
    console.log('Attempting to create new node with name:', nodeName);
    return window.electron.fileSystem.createNewNode(nodeName);
  }
  throw new Error('Electron is not available');
}

export async function addFileToNode(nodeName, fileData) {
  if (isElectronAvailable()) {
    if (!nodeName || !fileData) {
      throw new Error('Both nodeName and fileData are required');
    }
    console.log(`Attempting to add file ${fileData.name} to node ${nodeName}`);
    return window.electron.fileSystem.addFileToNode(nodeName, fileData);
  }
  throw new Error('Electron is not available');
}

export async function stageFile(nodeName, fileName) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.stageFile(nodeName, fileName);
  }
  throw new Error('Electron is not available');
}

export async function commitChanges(nodeName, commitMessage) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.commitChanges(nodeName, commitMessage);
  }
  throw new Error('Electron is not available');
}

export async function getAllRepoNamesAndTypes() {
  if (isElectronAvailable()) {
    const repos = await window.electron.fileSystem.getAllRepoNamesAndTypes();
    return Array.isArray(repos) ? repos : [];
  }
  throw new Error('Electron is not available');
}

export async function addSubmodule(parentRepoName, submoduleRepoName) {
  if (isElectronAvailable()) {
    console.log(`Attempting to add submodule ${submoduleRepoName} to ${parentRepoName}`);
    try {
      const result = await window.electron.fileSystem.addSubmodule(parentRepoName, submoduleRepoName);
      console.log(`Submodule addition result:`, result);
      return result;
    } catch (error) {
      console.error(`Error adding submodule:`, error);
      throw error;
    }
  }
  throw new Error('Electron is not available');
}

export async function updateSubmodules(repoName) {
  if (isElectronAvailable()) {
    console.log(`Updating submodules for ${repoName}`);
    try {
      const result = await window.electron.fileSystem.updateSubmodules(repoName);
      console.log(`Submodules update result:`, result);
      
      // Refresh the DreamSpace after updating submodules
      if (window.refreshDreamSpace) {
        window.refreshDreamSpace();
      }
      
      return result;
    } catch (error) {
      console.error(`Error updating submodules:`, error);
      return { message: `Error updating submodules: ${error.message}`, error: error.message };
    }
  }
  throw new Error('Electron is not available');
}

export async function triggerCoherenceBeacon(repoName) {
  if (isElectronAvailable()) {
    console.log(`Triggering Coherence Beacon for ${repoName}`);
    try {
      const result = await window.electron.fileSystem.triggerCoherenceBeacon(repoName);
      console.log(`Coherence Beacon result:`, result);
      return result;
    } catch (error) {
      console.error(`Error triggering Coherence Beacon:`, error);
      throw error;
    }
  }
  throw new Error('Electron is not available');
}

export async function createZipArchive(files) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.createZipArchive(files);
  }
  throw new Error('Electron is not available');
}

export async function copyRepositoryToDreamVault(sourcePath, repoName) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.copyRepositoryToDreamVault(sourcePath, repoName);
  }
  throw new Error('Electron is not available');
}

export async function unbundleRepositoryToDreamVault(bundlePath, repoName) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.unbundleRepositoryToDreamVault(bundlePath, repoName);
  }
  throw new Error('Electron is not available');
}

export async function handleZipArchive(zipPath) {
  if (isElectronAvailable()) {
    try {
      const result = await window.electron.fileSystem.handleZipArchive(zipPath);
      if (result.success) {
        console.log('Zip archive processed successfully');
        // You might want to trigger a refresh of the DreamSpace here
        if (window.refreshDreamSpace) {
          window.refreshDreamSpace();
        }
      } else {
        console.error('Error processing zip archive:', result.error);
        throw new Error(result.error);
      }
      return result;
    } catch (error) {
      console.error('Error handling zip archive:', error);
      throw error;
    }
  }
  throw new Error('Electron is not available');
}

export async function getPersonNodes() {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.getPersonNodes();
  }
  throw new Error('Electron is not available');
}

export async function createEmailDraft(repoName, personName) {
  if (isElectronAvailable()) {
    return window.electron.fileSystem.createEmailDraft(repoName, personName);
  }
  throw new Error('Electron is not available');
}

