# DreamVault Architecture Overview

## Component Structure

### 1. DreamTalk and DreamSong
- Lowest-level components
- Purely presentational (HTML/CSS)
- Responsible for displaying media content and formatting

#### DreamTalk
- Displays media files
- Has static and dynamic parts
- Receives media file path and display logic

#### DreamSong
- Analogous to DreamTalk in structure and purpose

### 2. DreamNode
- Corresponds to a git repository in the DreamVault
- Created for each git repository found
- Responsibilities:
  - Read metadata from the git repository
  - Check for media files
  - Initialize DreamTalk and DreamSong components
  - Create CSS 3D objects for DreamTalk and DreamSong
  - Handle its own visibility, location, size, and rotation in 3D space
  - Respond to user interactions (hover, click)
  - Communicate with DreamGraph about user interactions

### 3. DreamSpace
- 3D space component
- Uses CSS 3D renderer
- Contains all DreamNode instances

### 4. DreamGraph
- Minimal component
- Acts as a "conductor" for DreamNodes
- Responsibilities:
  - Update positions, scales, and rotations of DreamNodes
  - Receive information from DreamNodes about user interactions
  - Coordinate changes across multiple DreamNodes based on interactions

## Interaction Flow

1. DreamNode initialization:
   - Scans repository
   - Creates CSS 3D objects for DreamTalk and DreamSong
   - Becomes visible in 3D space

2. User interaction:
   - User interacts with a DreamNode
   - DreamNode detects interaction and informs DreamGraph
   - DreamGraph decides on necessary changes
   - DreamGraph instructs relevant DreamNodes to update

3. DreamNode updates:
   - DreamNodes autonomously handle their own updates
   - Can change position, scale, rotation, or flip to reveal backside

## Key Principles

1. Autonomy: DreamNodes operate independently, handling their own state and updates.
2. Centralized Coordination: DreamGraph manages overall layout and interactions between nodes.
3. Separation of Concerns: Clear distinction between presentation (DreamTalk/DreamSong), logic (DreamNode), and coordination (DreamGraph).
4. React-based: Utilizing React components for efficient updates and state management.
5. 3D Visualization: All UI elements are CSS 3D objects within the DreamSpace.

## Implementation Strategy

1. Start with simple components (DreamTalk, DreamSong)
2. Build up to more complex components (DreamNode)
3. Implement DreamSpace as the 3D environment
4. Develop DreamGraph for overall coordination
5. Refine interactions and ensure smooth integration of all components

This architecture aims to create a modular, maintainable, and scalable system that can handle complex 3D visualizations of git repository data.
