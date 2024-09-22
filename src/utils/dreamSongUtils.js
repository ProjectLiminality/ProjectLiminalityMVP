// Function to parse DreamSong.canvas data
export function parseDreamSongCanvas(canvasData) {
  if (typeof canvasData !== 'object' || canvasData === null) {
    console.error('Invalid DreamSong.canvas data:', canvasData);
    return { nodes: [], edges: [] };
  }
  return {
    nodes: canvasData.nodes || [],
    edges: canvasData.edges || []
  };
}

// Function to perform topological sorting of nodes
export function topologicalSort(nodes, edges) {
  const graph = new Map();
  const inDegree = new Map();

  // Initialize graph and in-degree
  nodes.forEach(node => {
    graph.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph and calculate in-degree
  edges.forEach(edge => {
    if (graph.has(edge.fromNode) && graph.has(edge.toNode)) {
      graph.get(edge.fromNode).push(edge.toNode);
      inDegree.set(edge.toNode, inDegree.get(edge.toNode) + 1);
    }
  });

  // Queue for nodes with no incoming edges
  const queue = nodes.filter(node => inDegree.get(node.id) === 0).map(node => node.id);
  const sortedNodes = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    sortedNodes.push(nodes.find(node => node.id === nodeId));

    graph.get(nodeId).forEach(neighbor => {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) {
        queue.push(neighbor);
      }
    });
  }

  // Check for cycles
  if (sortedNodes.length !== nodes.length) {
    console.warn('The graph contains a cycle');
  }

  return sortedNodes;
}

// Function to process DreamSong data
export function processDreamSongData(canvasData) {
  const { nodes, edges } = parseDreamSongCanvas(canvasData);
  const sortedNodes = topologicalSort(nodes, edges);
  return sortedNodes;
}
