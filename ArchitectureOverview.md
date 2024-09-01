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

### 2. DreamNode
- Functional component with hooks
- Corresponds to a git repository in the DreamVault
- Currently, only one DreamNode is rendered at a time
- Responsibilities:
  - Use effects to read metadata from the git repository
  - Check for media files
  - Render DreamTalk and DreamSong components as front and back faces
  - Use CSS3DObject for 3D representation
  - Manage its own state for visibility, location, size, and rotation in 3D space
  - Handle user interactions (hover, click) using event handlers

### 3. DreamSpace
- Main 3D space component
- Uses Three.js for the overall 3D environment
- Contains the DreamNode instance as a CSS3DObject
- Manages the Three.js scene, camera, and renderer
- Uses CSS3DRenderer from Three.js to integrate CSS3DObject into the Three.js scene
- Handles raycasting for mouse interactions

## State Management

- Each component manages its own local state using useState hook
- DreamSpace manages the overall scene state

## Interaction Flow

1. DreamNode initialization:
   - Uses useEffect hook to scan repository on mount
   - Creates CSS3DObject for 3D representation
   - Becomes visible in 3D space

2. User interaction:
   - User interacts with the DreamNode (hover, click)
   - DreamSpace handles raycasting to detect interactions
   - DreamNode updates its state based on interactions (e.g., scaling on hover)

3. DreamNode updates:
   - DreamNode receives new props or state
   - React handles efficient re-rendering
   - CSS3DObject updates based on new state

## Key Principles

1. React Paradigms: Utilize functional components and hooks for efficient state management and side effects.
2. Separation of Concerns: Clear distinction between presentation (DreamTalk/DreamSong) and logic (DreamNode).
3. Three.js Integration: Use Three.js with CSS3DRenderer for efficient 3D representation of HTML content.
4. Unidirectional Data Flow: Maintain React's unidirectional data flow for predictable state updates.

## Implementation Strategy

1. Set up basic React project structure with Three.js integration
2. Implement DreamTalk and DreamSong as simple functional components
3. Develop DreamNode as a functional component, using CSS3DObject for 3D representation
4. Create DreamSpace as the main 3D environment using Three.js, integrating CSS3DRenderer
5. Implement raycasting in DreamSpace for user interactions
6. Refine interactions and ensure smooth integration of all components
7. Optimize performance and handle edge cases

This architecture creates a focused, efficient system that leverages React and Three.js for a 3D visualization of a single git repository. It combines the power of React for UI components with Three.js for 3D rendering, creating a unique and interactive user experience.
