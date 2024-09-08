# DreamSong Migration Plan

## 1. File System Operations
- Extend `src/utils/fileUtils.js` with functions to:
  a) Read the DreamSong.canvas file
  b) List media files in a Dream Node repository

- Update `src/services/electronService.js` if needed for new IPC operations

## 2. Data Processing
- Create `src/utils/dreamSongUtils.js` for:
  a) Parsing DreamSong.canvas data
  b) Topological sorting of nodes

## 3. DreamSong Component
- Modify `src/components/DreamSong.js` to:
  a) Use the new utility functions for data processing
  b) Render the linear flow of media and text elements
  c) Handle clicks on media files, interpreting them as Dream Node clicks
  d) Communicate with the Dreamgraph component for space reorganization

## 4. Integration
- Update the Dreamgraph component to accept signals from DreamSong
- Ensure DreamSong can access necessary Dream Node information

## 5. Styling
- Adapt styles from the legacy `styles.css` to work within the React component

## Implementation Steps

1. File System and Data Processing:
   - Implement file reading and parsing functions in fileUtils.js and dreamSongUtils.js
   - Add topological sorting function to dreamSongUtils.js

2. DreamSong Component:
   - Update DreamSong.js to use the new utility functions
   - Implement the rendering logic for the linear flow of elements
   - Add click handling for media files, translating clicks to Dream Node interactions

3. Integration with Existing Components:
   - Modify Dreamgraph to accept signals from DreamSong
   - Ensure DreamSong can access Dream Node repository information

4. Styling:
   - Adapt legacy styles to work within the React component, using styled-components or CSS modules

5. Testing and Refinement:
   - Test the new DreamSong functionality within the larger application
   - Refine the implementation as needed
