const fs = require('fs').promises;
const path = require('path');

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
  updateBidirectionalRelationships
};
