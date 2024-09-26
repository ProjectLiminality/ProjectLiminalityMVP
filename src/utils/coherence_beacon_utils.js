import { readDreamSongCanvas } from './fileUtils';

export async function parseGitModules(repoName) {
  // TODO: Implement parsing of .gitmodules file
  return [];
}

export async function getDreamSongDependencies(repoName) {
  const canvasData = await readDreamSongCanvas(repoName);
  if (!canvasData || !canvasData.nodes) {
    return [];
  }

  const fileNodes = canvasData.nodes.filter(node => node.type === 'file' && node.file);
  const externalDependencies = fileNodes
    .map(node => node.file)
    .filter(filePath => !filePath.startsWith(repoName + '/'))
    .map(filePath => filePath.split('/')[0]);

  return [...new Set(externalDependencies)]; // Remove duplicates
}

export function computePositiveDelta(currentSubmodules, dreamSongDependencies) {
  return dreamSongDependencies.filter(dep => !currentSubmodules.includes(dep));
}

export async function identifyFriendsToNotify(newSubmodules, friendsList) {
  // TODO: Implement logic to identify friends who should be notified
  // This will require additional backend functionality to check which friends have which repositories
  return [];
}
