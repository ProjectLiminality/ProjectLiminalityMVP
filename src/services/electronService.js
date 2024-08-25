export async function readMetadata(repoName) {
  return window.electronAPI.fileSystem.readMetadata(repoName);
}

export async function getMediaFilePath(repoName) {
  return window.electronAPI.fileSystem.getMediaFilePath(repoName);
}

export async function getFileStats(filePath) {
  return window.electronAPI.fileSystem.getFileStats(filePath);
}
