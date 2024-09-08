const mainContainer = document.body; // Use the body as the main container
mainContainer.style.display = 'flex';
mainContainer.style.flexDirection = 'column';
mainContainer.style.alignItems = 'center'; // Center the content horizontally

const canvasContainer = document.createElement('div');
canvasContainer.id = 'canvas-container';
mainContainer.appendChild(canvasContainer);

// Function to fetch the directory listing and get the parent directory
async function fetchParentDirectory() {
  try {
    const response = await fetch('directory-listing.json');
    const directoryListing = await response.json();
    return directoryListing.parent_directory;
  } catch (error) {
    console.error('Error fetching directory listing:', error);
  }
}

// Function to fetch the DreamSong.canvas file and parse it
async function fetchCanvasData(parentDirectory) {
  try {
    const response = await fetch('DreamSong.canvas');
    const canvasData = await response.json();
    const sortedNodes = sortNodesByEdges(canvasData);
    renderLinearFlow(sortedNodes, parentDirectory);
  } catch (error) {
    console.error('Error fetching canvas data:', error);
  }
}

// Function to get the relative path of the file, excluding the canvas parent folder
function getFilePath(filePath, parentDirectory) {
  if (filePath.startsWith(parentDirectory + '/')) {
    return filePath.substring(parentDirectory.length + 1); // Remove the parent folder from the path
  }
  return filePath; // Return the original path if no parent folder match
}

// Function to sort nodes based on edges and handle non-directional links
function sortNodesByEdges(canvasData) {
  const nodes = canvasData.nodes;
  const edges = canvasData.edges;

  // Create a map for quick lookup of nodes by ID
  const nodeMap = new Map();
  nodes.forEach(node => nodeMap.set(node.id, node));

  // Separate unidirectional and non-directional edges
  const unidirectionalEdges = edges.filter(edge => !('toEnd' in edge));
  const nonDirectionalEdges = edges.filter(edge => 'toEnd' in edge);

  console.log('Unidirectional Edges:', unidirectionalEdges);
  console.log('Non-Directional Edges:', nonDirectionalEdges);

  // Create an adjacency list from unidirectional edges
  const adjList = new Map();
  unidirectionalEdges.forEach(edge => {
    if (!adjList.has(edge.fromNode)) {
      adjList.set(edge.fromNode, []);
    }
    adjList.get(edge.fromNode).push(edge.toNode);
  });

  // Find nodes that are part of the unidirectional flow
  const unidirectionalNodes = new Set();
  unidirectionalEdges.forEach(edge => {
    unidirectionalNodes.add(edge.fromNode);
    unidirectionalNodes.add(edge.toNode);
  });

  // Perform a topological sort only on the unidirectional nodes
  const sortedNodes = [];
  const visited = new Set();

  function dfs(nodeId) {
    if (visited.has(nodeId) || !unidirectionalNodes.has(nodeId)) return;
    visited.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    neighbors.forEach(neighborId => dfs(neighborId));

    sortedNodes.unshift(nodeMap.get(nodeId)); // Add node to the sorted list
  }

  // Find the starting nodes (nodes with no incoming edges)
  const incomingEdges = new Set(unidirectionalEdges.map(edge => edge.toNode));
  nodes.forEach(node => {
    if (unidirectionalNodes.has(node.id) && !incomingEdges.has(node.id)) {
      dfs(node.id);
    }
  });

  // Add remaining unidirectional nodes that were not part of any paths
  unidirectionalNodes.forEach(nodeId => {
    if (!visited.has(nodeId)) {
      sortedNodes.push(nodeMap.get(nodeId));
    }
  });

  console.log('Sorted Unidirectional Nodes:', sortedNodes);

  // Handle non-directional edges to combine nodes in the same container
  nonDirectionalEdges.forEach(edge => {
    const node1 = nodeMap.get(edge.fromNode);
    const node2 = nodeMap.get(edge.toNode);

    if (node1 && node2) {
      sortedNodes.forEach((node, index) => {
        if (Array.isArray(node)) {
          const [mediaNode, textNode] = node;
          if (mediaNode.id === node1.id || mediaNode.id === node2.id) {
            sortedNodes[index] = [mediaNode, textNode, node1.id === mediaNode.id ? node2 : node1];
            visited.add(node1.id);
            visited.add(node2.id);
          }
        } else if (node.id === node1.id || node.id === node2.id) {
          const combinedNode = node.id === node1.id ? node2 : node1;
          sortedNodes[index] = [node, combinedNode];
          visited.add(node.id);
          visited.add(combinedNode.id);
        }
      });
    }
  });

  // Add remaining nodes that were not part of any paths
  nodes.forEach(node => {
    if (!visited.has(node.id) && !unidirectionalNodes.has(node.id)) {
      sortedNodes.push(node);
    }
  });

  console.log('Final Sorted Nodes:', sortedNodes);
  return sortedNodes;
}

// Function to render the canvas data in a linear top-to-bottom flow with flip-flop pattern for combined elements
function renderLinearFlow(nodes, parentDirectory) {
  canvasContainer.innerHTML = ''; // Clear existing content
  let flipFlop = true;

  nodes.forEach(node => {
    if (Array.isArray(node)) {
      const combinedDiv = document.createElement('div');
      combinedDiv.className = 'container'; // Add container class
      combinedDiv.style.flexDirection = flipFlop ? 'row' : 'row-reverse';

      node.forEach(subNode => {
        if (subNode.type === 'file') {
          const mediaElement = createMediaElement(subNode.file, parentDirectory);
          combinedDiv.appendChild(mediaElement);
        } else if (subNode.type === 'text') {
          const textElement = document.createElement('div');
          textElement.className = 'text'; // Add text class
          textElement.innerHTML = convertMarkdownToHTML(subNode.text); // Convert markdown to HTML
          combinedDiv.appendChild(textElement);
        }
      });

      canvasContainer.appendChild(combinedDiv);
      flipFlop = !flipFlop; // Alternate the flip-flop pattern
    } else {
      if (node.type === 'file') {
        const mediaElement = createMediaElement(node.file, parentDirectory);
        canvasContainer.appendChild(mediaElement);
      } else if (node.type === 'text') {
        const textElement = document.createElement('div');
        textElement.className = 'text'; // Add text class
        textElement.innerHTML = convertMarkdownToHTML(node.text); // Convert markdown to HTML
        const textContainer = document.createElement('div');
        textContainer.className = 'text-container';
        textContainer.appendChild(textElement);
        canvasContainer.appendChild(textContainer);
      }
    }
  });
}

// Function to create media elements (image or video)
function createMediaElement(filePath, parentDirectory) {
  const videoExtensions = ['mp4', 'mov', 'webm', 'ogg']; // List of supported video extensions
  const fileExtension = filePath.split('.').pop().toLowerCase();
  const relativePath = getFilePath(filePath, parentDirectory);

  if (videoExtensions.includes(fileExtension)) {
    const videoElement = document.createElement('video');
    videoElement.className = 'media'; // Add media class
    videoElement.src = relativePath;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true; // Video is muted by default when autoplay
    videoElement.style.display = 'block'; // Ensure the video is displayed as a block element

    // Event listener to maintain current frame on pause
    videoElement.addEventListener('pause', () => {
      videoElement.style.objectFit = 'cover'; // Maintain the current frame
    });

    // Event listener to show controls on hover
    videoElement.addEventListener('mouseover', () => {
      videoElement.controls = true;
    });
    
    // Event listener to hide controls when not hovering
    videoElement.addEventListener('mouseout', () => {
      videoElement.controls = false;
    });

    return videoElement;
  } else {
    const imgElement = document.createElement('img');
    imgElement.className = 'media'; // Add media class
    imgElement.src = relativePath;
    return imgElement;
  }
}

// Function to convert markdown to HTML
function convertMarkdownToHTML(markdown) {
  if (!markdown) return ''; // Return an empty string if markdown is undefined

  return markdown
    // Convert headers
    .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
    .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
    .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Convert bold text
    .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
    // Convert bullet points
    .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
    // Convert new lines to <br>
    .replace(/\n/g, '<br>')
    // Merge consecutive <ul> tags
    .replace(/<\/ul><ul>/gim, '');
}

// Convert camel case to title case
function camelToTitleCase(camelCase) {
  const result = camelCase.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Function to initialize the header and title
async function initializeHeader() {
  const parentDirectory = await fetchParentDirectory();
  if (parentDirectory) {
    const title = camelToTitleCase(parentDirectory);
    document.title = title;

    // Create a new header container
    const headerContainer = document.createElement('div');
    headerContainer.id = 'header-container';
    headerContainer.style.textAlign = 'center'; // Center the content
    headerContainer.style.marginBottom = '200px'; // Add margin to the bottom
    headerContainer.style.width = '100%'; // Ensure the container takes full width

    // Create and append the header
    const header = document.createElement('h1');
    header.textContent = title;
    header.style.color = 'white'; // Set the header text color to white
    header.style.fontSize = '4em'; // Set the header font size
    headerContainer.appendChild(header);

    // Create and append the image
    const img = document.createElement('img');
    img.src = `${parentDirectory}.png`;
    img.style.maxWidth = '50%'; // Ensure the image does not exceed the container width
    img.style.display = 'block'; // Ensure the image is displayed as a block element
    img.style.margin = '0 auto'; // Center the image
    headerContainer.appendChild(img);

    // Insert the header container before the canvas container
    mainContainer.insertBefore(headerContainer, canvasContainer);

    return parentDirectory;
  } else {
    console.error('Parent directory not found in directory listing');
  }
}

// Initialize the rendering process
initializeHeader().then(parentDirectory => {
  if (parentDirectory) {
    fetchCanvasData(parentDirectory);
  }
});