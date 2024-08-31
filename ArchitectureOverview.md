# DreamVault Architecture Overview

## Component Structure

### 1. DreamTalk and DreamSong
- Functional components
- Purely presentational (JSX/CSS)
- Responsible for displaying media content and formatting

#### DreamTalk
- Displays media files
- Uses React hooks for dynamic content
- Receives media file path and display logic as props

#### DreamSong
- Analogous to DreamTalk in structure and purpose

### 2. DreamNode
- Functional component with hooks
- Corresponds to a git repository in the DreamVault
- Created for each git repository found
- Responsibilities:
  - Use effects to read metadata from the git repository
  - Check for media files
  - Render DreamTalk and DreamSong components
  - Use CSS 3D transforms for 3D representation
  - Manage its own state for visibility, location, size, and rotation in 3D space
  - Handle user interactions (hover, click) using event handlers
  - Update global state or call parent component methods for interactions

### 3. DreamSpace
- Main 3D space component
- Uses Three.js for the overall 3D environment
- Contains all DreamNode instances as CSS 3D transformed elements
- Manages the Three.js scene, camera, and renderer
- Uses CSS3DRenderer from Three.js to integrate CSS 3D objects into the Three.js scene

### 4. DreamGraph
- Context provider component
- Acts as a "conductor" for DreamNodes
- Responsibilities:
  - Provide global state and methods through React Context
  - Manage positions, scales, and rotations of DreamNodes using CSS 3D transforms
  - Handle user interactions and coordinate changes across multiple DreamNodes

## State Management

- Use React Context API for global state management
- Each component manages its own local state using useState hook

## Interaction Flow

1. DreamNode initialization:
   - Uses useEffect hook to scan repository on mount
   - Applies CSS 3D transforms for 3D representation
   - Becomes visible in 3D space

2. User interaction:
   - User interacts with a DreamNode
   - DreamNode updates global state through Context
   - DreamGraph (Context provider) processes the state change
   - Affected DreamNodes re-render based on new state, updating their CSS 3D transforms

3. DreamNode updates:
   - DreamNodes receive new props or state
   - React handles efficient re-rendering
   - CSS 3D transforms update based on new state

## Key Principles

1. React Paradigms: Utilize functional components and hooks for efficient state management and side effects.
2. Centralized State: Use Context API for global state management.
3. Separation of Concerns: Clear distinction between presentation (DreamTalk/DreamSong), logic (DreamNode), and coordination (DreamGraph).
4. CSS 3D Integration: Leverage CSS 3D transforms for simple yet effective 3D representations of DreamNodes.
5. Three.js for Environment: Use Three.js to create the overall 3D environment, integrating CSS 3D objects.
6. Unidirectional Data Flow: Maintain React's unidirectional data flow for predictable state updates.

## Implementation Strategy

1. Set up basic React project structure with Three.js integration
2. Implement simple components (DreamTalk, DreamSong) as functional components
3. Develop DreamNode as a functional component, using CSS 3D transforms
4. Create DreamSpace as the main 3D environment using Three.js, integrating CSS3DRenderer
5. Implement DreamGraph as a Context provider for global state and coordination
6. Refine interactions and ensure smooth integration of all components
7. Optimize performance and handle edge cases

This architecture creates a modular, maintainable, and scalable system that leverages React, CSS 3D transforms, and Three.js for an efficient 3D visualization of git repository data. It combines the simplicity of CSS 3D for individual elements with the power of Three.js for the overall 3D environment.
