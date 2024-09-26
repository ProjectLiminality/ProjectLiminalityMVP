const fs = require('fs').promises;
const path = require('path');

async function readDreamSongCanvas(repoName) {
  const dreamVaultPath = process.env.DREAM_VAULT_PATH;
  if (!dreamVaultPath) {
    throw new Error('DREAM_VAULT_PATH environment variable is not set');
  }
  const canvasPath = path.join(dreamVaultPath, repoName, 'DreamSong.canvas');
  try {
    const data = await fs.readFile(canvasPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading DreamSong.canvas for ${repoName}:`, error);
    return null;
  }
}

async function parseGitModules(repoName) {
  // TODO: Implement parsing of .gitmodules file
  return [];
}

async function getDreamSongDependencies(repoName) {
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

function computePositiveDelta(currentSubmodules, dreamSongDependencies) {
  return dreamSongDependencies.filter(dep => !currentSubmodules.includes(dep));
}

async function identifyFriendsToNotify(newSubmodules, friendsList) {
  // TODO: Implement logic to identify friends who should be notified
  // This will require additional backend functionality to check which friends have which repositories
  return [];
}

module.exports = {
  parseGitModules,
  getDreamSongDependencies,
  computePositiveDelta,
  identifyFriendsToNotify
};
