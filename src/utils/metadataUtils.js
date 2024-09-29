const fs = require('fs').promises;
const path = require('path');

async function readMetadata(dreamVaultPath, repoName) {
  const metadataPath = path.join(dreamVaultPath, repoName, '.pl');
  try {
    const data = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // If the file doesn't exist, return an empty object
      return {};
    }
    throw error;
  }
}

async function writeMetadata(dreamVaultPath, repoName, metadata) {
  const metadataPath = path.join(dreamVaultPath, repoName, '.pl');
  await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
}

async function updateBidirectionalRelationships(dreamVaultPath, currentRepoName, oldMetadata, newMetadata) {
  const oldRelatedNodes = oldMetadata.relatedNodes || [];
  const newRelatedNodes = newMetadata.relatedNodes || [];

  const addedNodes = newRelatedNodes.filter(node => !oldRelatedNodes.includes(node));
  const removedNodes = oldRelatedNodes.filter(node => !newRelatedNodes.includes(node));

  for (const nodeName of addedNodes) {
    await updateRelatedNode(dreamVaultPath, nodeName, currentRepoName, true);
  }

  for (const nodeName of removedNodes) {
    await updateRelatedNode(dreamVaultPath, nodeName, currentRepoName, false);
  }
}

async function updateRelatedNode(dreamVaultPath, nodeName, currentRepoName, isAdding) {
  const nodeMetadataPath = path.join(dreamVaultPath, nodeName, '.pl');
  try {
    const data = await fs.readFile(nodeMetadataPath, 'utf8');
    const metadata = JSON.parse(data);

    if (!metadata.relatedNodes) {
      metadata.relatedNodes = [];
    }

    if (isAdding && !metadata.relatedNodes.includes(currentRepoName)) {
      metadata.relatedNodes.push(currentRepoName);
    } else if (!isAdding) {
      metadata.relatedNodes = metadata.relatedNodes.filter(name => name !== currentRepoName);
    }

    await fs.writeFile(nodeMetadataPath, JSON.stringify(metadata, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error updating related node ${nodeName}:`, error);
    // Continue with other updates even if one fails
  }
}

module.exports = {
  updateBidirectionalRelationships,
  readMetadata,
  writeMetadata
};
