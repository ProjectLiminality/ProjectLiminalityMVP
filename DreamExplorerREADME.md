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
│   │   ├── Camera.js  # Camera component for 3D space
│   │   └── SemanticSearch/  # Submodule for semantic search functionality
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

- `DreamSpace`: The main 3D canvas component that fills the screen and contains all DreamNodes.
  - Responsibilities:
    - Render the 3D environment
    - Manage the overall layout of DreamNodes
    - Handle global interactions (e.g., camera movement, global events)
    - Orchestrate the position, scale, and rotation of its children (DreamNodes)
    - Spawn and position nodes
    - Receive and handle events like clicking on nodes
    - Pass interaction information to appropriate utility functions for calculations
  - Interactions:
    - With Camera: Controls the viewpoint of the 3D space
    - With DreamNodes: Renders, updates their positions, and manages their lifecycle
    - With utility functions: Sends interaction data and receives updated positioning information

- `DreamNode`: Component representing individual DreamNodes.
  - Responsibilities:
    - Render its visual representation
    - Handle interactions specific to the node (e.g., click, hover)
    - Toggle between DreamTalk and DreamSong views
  - Interactions:
    - With DreamSpace: Receives positioning updates and interaction handlers

- `DreamTalk`: Component to display the visual representation (PNG or GIF) on the front of a DreamNode.
  - Responsibilities:
    - Render the visual content
    - Handle media-specific interactions
  - Interactions:
    - With DreamNode: Receives display toggle signals

- `DreamSong`: Component to display the textual content (README) on the back of a DreamNode.
  - Responsibilities:
    - Render the textual content
    - Handle text-specific interactions (e.g., scrolling)
  - Interactions:
    - With DreamNode: Receives display toggle signals

- `Camera`: Component to manage the camera within the 3D space.
  - Responsibilities:
    - Control the viewpoint and movement in the 3D environment
    - Handle camera-specific interactions (e.g., zoom, pan)
  - Interactions:
    - With DreamSpace: Provides viewpoint information

- `SemanticSearch`: A component containing both the search bar and search functionality.
  - Responsibilities:
    - Provide user interface for search input
    - Process search queries
    - Return search results
  - Interactions:
    - With DreamSpace: Sends search results for node positioning
    - With App: Receives search queries, returns results

- `App`: The main React component that orchestrates the entire application.
  - Responsibilities:
    - Manage overall application state
    - Handle routing (if applicable)
    - Coordinate interactions between high-level components
  - Interactions:
    - With all other components: Manages data flow and state changes

### Utility Functions and Custom Hooks

- `useDreamSpaceManager`: A custom hook to manage DreamSpace state and operations.
  - Responsibilities:
    - Manage the state of nodes (position, scale, rotation)
    - Provide functions for node interactions (e.g., onClick, onHover)
    - Calculate node positions for different layouts (e.g., spherical, search results)
  - Interactions:
    - With DreamSpace: Provides state and functions for managing nodes

- Other utility functions (as needed):
  - Spherical layout calculation
  - Search result layout calculation
  - Node interaction handlers
  - etc.

### Data Flow and State Management

- Use React Context or a state management library (e.g., Redux, MobX) for managing application-wide state.
- Implement a unidirectional data flow pattern to manage state changes and component interactions.
- Utilize custom hooks for encapsulating and sharing stateful logic between components.

### Component Communication

- Use props for parent-to-child communication.
- Implement callback functions for child-to-parent communication.
- Use context or a state management solution for communication between unrelated components.

### Performance Considerations

- Implement virtualization techniques for rendering large numbers of DreamNodes.
- Use React.memo, useMemo, and useCallback hooks to optimize rendering performance.
- Consider using Web Workers for computationally intensive tasks (e.g., complex layout calculations).

This updated structure provides a high-level overview of the components, their responsibilities, and interactions, with the DreamSpace component taking on a more central role in managing the 3D environment and node interactions. The addition of custom hooks and utility functions helps to modularize the logic and keep the components focused on their primary responsibilities.

### GitHub Actions

- `update_structure.yml`: A GitHub Actions workflow that runs the `generate_structure.py` script periodically or on push events to update the `dreamvault_structure.json` file.

---
