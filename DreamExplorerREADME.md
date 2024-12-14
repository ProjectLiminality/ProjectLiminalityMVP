# Dream Explorer: Web-Based Knowledge Gardening System

## Introduction

Dream Explorer is a web-based implementation of Project Liminality, an innovative knowledge management system that revolutionizes the way we structure and interact with information. It transcends the traditional "second brain" paradigm by introducing the concept of an "interbrain" - a dynamic, relational approach to organizing knowledge.

## Core Concepts

### Dream Nodes

The fundamental unit of Dream Explorer is the "Dream Node," which is represented by a Git repository. Dream Nodes can embody two primary concepts:

1. **Dreams**: Abstract ideas, concepts, or any form of knowledge.
2. **Dreamers**: Representations of people or peers.

This dual nature allows for a flexible and interconnected knowledge structure.

### Dream Talk and Dream Song

Each Dream Node consists of two main components:

- **Dream Talk**: A concise, symbolic representation of the idea (like a thumbnail or icon).
- **Dream Song**: A more elaborate explanation or exploration of the idea, typically represented by the README file of the repository.

### The Interbrain

Dream Explorer structures knowledge based on social relationships and interactions, creating an "interbrain." This approach allows users to organize information along the lines of their actual relational fields, transcending static, top-down categorization.

## Key Features

- **Git-Based Structure**: Utilizes Git repositories as submodules, allowing for version control and collaborative evolution of ideas.
- **Web-Based Interface**: Accessible through any modern web browser, hosted on GitHub Pages.
- **Relational Organization**: Knowledge is structured based on connections between ideas (Dreams) and people (Dreamers).
- **Holonic Organization**: Facilitates the self-organization of knowledge into a coherent holarchy of ideas.
- **Visual Representation**: Utilizes React Three Fiber for immersive 3D visualization of the knowledge network.

## Technical Implementation

- **Frontend**: React-based web application with React Three Fiber for 3D visualizations.
- **Backend**: Static site hosted on GitHub Pages, utilizing Git submodules for content management.
- **Data Structure**: JSON file describing the DreamVault structure, generated and updated through GitHub Actions.

## Getting Started

1. Visit the Dream Explorer website: [URL to be added]
2. Navigate through the 3D space to explore different Dream Nodes.
3. Click on nodes to view Dream Talks (thumbnails) and access Dream Songs (README files).
4. Use the search and filter functions to find specific Dreams or Dreamers.

## Contributing

We welcome contributions to the Dream Explorer project! Contributing guidelines will be added in the future. Stay tuned for updates on how to get involved.

## Future Enhancements

- Integration with AI-powered tools for knowledge synthesis and discovery.
- Collaborative features for real-time interaction within the Dream Explorer space.
- Mobile-optimized version for on-the-go access to the interbrain.

## License

Dream Explorer is released under the [GNU AFFERO GENERAL PUBLIC LICENSE](LICENSE).

## Repository Structure

```
DreamExplorer/
│
├── backend/
│   ├── generate_structure.py  # Python script to generate JSON structure
│   └── dreamvault_structure.json  # Generated JSON file describing DreamVault structure
│
├── src/
│   ├── components/
│   │   ├── DreamSpace.js  # 3D canvas component (fullscreen)
│   │   ├── DreamNode.js  # Component for individual DreamNodes
│   │   ├── DreamTalk.js  # Component to display DreamTalk (PNG/GIF)
│   │   ├── DreamSong.js  # Component to display DreamSong (README)
│   │   └── Camera.js  # Camera component for 3D space
│   ├── utils/
│   │   └── SemanticSearch.js  # Utility for semantic search functionality
│   ├── App.js  # Main React component
│   └── index.js  # Entry point for React app
│
├── public/
│   └── index.html  # HTML template for the React app
│
├── DreamVault/  # Folder containing submodules for each DreamNode
│   ├── DreamNode1/  # Submodule
│   ├── DreamNode2/  # Submodule
│   └── ...
│
├── package.json  # Node.js dependencies and scripts
├── README.md  # This file
└── .github/
    └── workflows/
        └── update_structure.yml  # GitHub Actions workflow to update JSON file
```

### Backend Components

- `generate_structure.py`: Python script that scans the DreamVault folder and generates a JSON file describing the structure of all DreamNodes. It includes information about each node's Dreamtalk (GIF/PNG) and README file.

- `dreamvault_structure.json`: The generated JSON file that serves as the primary data source for the frontend. It contains the structure of the DreamVault, including file paths to Dreamtalk media and README files for each DreamNode.

### Frontend Components

- `DreamSpace.js`: The main 3D canvas component that fills the screen and contains all DreamNodes.

- `DreamNode.js`: Component representing individual DreamNodes. It manages the node's position, rotation, and scale within the DreamSpace.

- `DreamTalk.js`: Component to display the DreamTalk image (PNG or GIF) on the front of a DreamNode.

- `DreamSong.js`: Component to display the DreamSong (README content) on the back of a DreamNode.

- `Camera.js`: Component to manage the camera within the 3D space.

- `SemanticSearch.js`: Utility for performing semantic search on the DreamVault structure JSON file.

- `App.js`: The main React component that orchestrates the entire application.

- `index.js`: Entry point for the React application.

### Non-Visual Components

- `DreamGraph.js`: A non-visual React component that manages the spatial relationships between DreamNodes. It updates node positions based on user interactions and search results.

### GitHub Actions

- `update_structure.yml`: A GitHub Actions workflow that runs the `generate_structure.py` script periodically or on push events to update the `dreamvault_structure.json` file.

---
