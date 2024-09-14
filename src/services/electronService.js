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
