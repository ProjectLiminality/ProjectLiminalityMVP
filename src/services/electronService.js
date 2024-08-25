export async function readMetadata(repoName) {
  return window.electron.fileSystem.readMetadata(repoName);
}

export async function getMediaFilePath(repoName) {
  return window.electron.fileSystem.getMediaFilePath(repoName);
}

export async function getFileStats(filePath) {
  return window.electron.fileSystem.getFileStats(filePath);
}

export async function scanDreamVault() {
  return window.electron.scanDreamVault();
}

export function isElectronAvailable() {
  return !!window.electron;
}
