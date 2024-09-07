export async function readMetadata(repoName) {
  return window.electron.fileSystem.readMetadata(repoName);
}

export async function writeMetadata(repoName, metadata) {
  return window.electron.fileSystem.writeMetadata(repoName, metadata);
}

export async function getMediaFilePath(repoName) {
  return window.electron.fileSystem.getMediaFilePath(repoName);
}

export async function readFile(filePath) {
  return window.electron.fileSystem.readFile(filePath);
}

export async function getFileStats(filePath) {
  return window.electron.fileSystem.getFileStats(filePath);
}

export async function listFiles(repoName) {
  return window.electron.fileSystem.listFiles(repoName);
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
