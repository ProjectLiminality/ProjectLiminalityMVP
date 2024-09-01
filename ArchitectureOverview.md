# DreamVault Architecture Overview

## Component Structure

### 1. DreamTalk and DreamSong
- Functional components
- Purely presentational (JSX/CSS)
- Responsible for displaying media content and formatting

#### DreamTalk
- Displays media files (images, videos)
- Uses React hooks for dynamic content
- Receives media file path and display logic as props

#### DreamSong
- Displays repository metadata and additional information
- Analogous to DreamTalk in structure and purpose

### 2. DreamNode3D (Three.js Object)
- Custom Three.js Object3D subclass
- Represents the 3D structure of a DreamNode
- Responsibilities:
  - Manages CSS3DObject for visual representation
  - Handles interaction planes for raycasting
  - Manages its own position, rotation, and scale in 3D space

### 3. DreamNode (React Component)
- Functional component with hooks
- Corresponds to a git repository in the DreamVault
- Responsibilities:
  - Creates and manages a DreamNode3D instance
  - Uses effects to read metadata from the git repository
  - Manages React state and props
  - Handles self-contained user interactions (e.g., hover effects) at the React level
  - Updates DreamNode3D based on state changes
  - Communicates significant events (e.g., clicks) to DreamGraph

### 4. DreamSpace
- Main 3D space component
- Uses Three.js for the overall 3D environment
- Manages the Three.js scene, camera, and renderer
- Uses CSS3DRenderer from Three.js to integrate CSS3DObjects
- Handles raycasting for mouse interactions
- Renders DreamNode components

### 5. DreamGraph
- Central conductor component for the entire 3D space
- Manages the overall structure and major transformations of DreamNodes
- Responsibilities:
  - Maintains the state for all DreamNodes in the scene
  - Decides on and initiates major transformations (e.g., repositioning, major scale changes)
  - Handles complex interactions that affect multiple DreamNodes
  - Provides a centralized event system for communication between DreamNodes and the overall graph
  - Manages the high-level user interactions with the entire graph

## Integration of React and Three.js

- DreamNode3D (Three.js object) is created and managed by the DreamNode React component
- React handles component lifecycle and state management
- Three.js handles 3D rendering and low-level interactions
- Use of useRef hook to maintain reference to Three.js objects in React components
- Use of useEffect hook to manage Three.js object lifecycle and updates

## State Management

- React components manage their own local state using useState hook
- DreamSpace manages the overall scene state
- State changes in React components trigger updates to Three.js objects

## Interaction Flow

1. DreamNode initialization:
   - DreamNode React component creates a DreamNode3D instance
   - Uses useEffect hook to scan repository on mount
   - Adds DreamNode3D to the Three.js scene

2. User interaction:
   - User interacts with the DreamNode in 3D space
   - DreamSpace handles raycasting to detect interactions
   - Interactions are passed to the appropriate DreamNode component
   - DreamNode updates its state and the corresponding DreamNode3D object

3. DreamNode updates:
   - DreamNode receives new props or state
   - React handles efficient re-rendering of any 2D UI elements
   - DreamNode updates its DreamNode3D object, which updates the 3D representation

## Key Principles

1. React Paradigms: Utilize functional components and hooks for efficient state management and side effects.
2. Separation of Concerns: Clear distinction between React components (DreamNode) and Three.js objects (DreamNode3D).
3. Three.js Integration: Use Three.js with CSS3DRenderer for efficient 3D representation of HTML content.
4. Unidirectional Data Flow: Maintain React's unidirectional data flow for predictable state updates.
5. Cohesive 3D Objects: DreamNode3D encapsulates all 3D-related properties and behaviors.

## Implementation Strategy

1. Implement DreamNode3D as a custom Three.js Object3D subclass
2. Develop DreamNode as a React functional component that manages a DreamNode3D instance
3. Refactor DreamSpace to work with the new DreamNode and DreamNode3D structure
4. Implement raycasting in DreamSpace that interacts with DreamNode3D objects
5. Ensure smooth integration between React state management and Three.js object updates
6. Optimize performance for handling multiple DreamNodes in 3D space
7. Implement advanced features like 3D positioning, rotation, and scaling of DreamNodes

This architecture creates a scalable and efficient system that leverages the strengths of both React and Three.js. It allows for complex 3D visualizations of git repositories while maintaining the benefits of React's component-based architecture and state management.
