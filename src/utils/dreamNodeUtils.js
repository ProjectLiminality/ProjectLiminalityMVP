export function processNodesData(nodesData) {
  // Filter nodes of type 'file' and extract the middle part of the file path
  const filteredNodes = nodesData
    .filter(node => node.type === 'file')
    .map(node => {
      const pathParts = node.file.split('/');
      return pathParts.length === 3 ? pathParts[1] : null;
    })
    .filter(Boolean);

  // Create connections based on the filtered nodes
  const connections = [];
  for (let i = 0; i < filteredNodes.length - 1; i++) {
    connections.push({
      startRepoName: filteredNodes[i],
      endRepoName: filteredNodes[i + 1]
    });
  }

  return connections;
}
