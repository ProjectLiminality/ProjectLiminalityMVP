# DreamContent Development Plan

## Current State
- DreamContent component uses D3.js to create a circle packing visualization
- Integrated into DreamSong component as an alternative view
- Circle packing data is prepared based on repository files
- Visualization renders correctly but lacks interactivity

## Goals
1. Implement click functionality to open files/folders
2. Prepare for future multi-select functionality
3. Improve styling and visual feedback

## Development Steps

### Phase 1: Basic Click Functionality
1. Modify DreamContent component:
   - Add `onNodeInteraction` prop
   - Implement click handling for circles
2. Update DreamSong component:
   - Pass `handleNodeInteraction` to DreamContent
   - Implement file opening using Electron API
3. Test and verify basic click-to-open functionality

### Phase 2: Prepare for Multi-Select
1. Modify data structure to include 'selected' property for nodes
2. Update DreamContent rendering to visually indicate selected nodes
3. Extend `handleNodeInteraction` in DreamSong to handle command+click for selection
4. Implement state management for selected nodes in DreamSong

### Phase 3: Implement Multi-Select
1. Add right-click handling to show context menu for selected items
2. Implement bulk actions for selected nodes (e.g., open multiple files, apply tags)
3. Add keyboard shortcuts for selection (e.g., Shift+Click for range select)

### Phase 4: Styling and UX Improvements
1. Refine color scheme and overall aesthetics
2. Add hover effects and tooltips for better user feedback
3. Implement smooth transitions for selections and deselections
4. Optimize performance for large numbers of nodes

## Implementation Details

### DreamContent Component
```javascript
const DreamContent = ({ data, onNodeInteraction }) => {
  // ... existing D3.js setup ...

  const node = svg.append("g")
    .selectAll("circle")
    .data(root.descendants().slice(1))
    .join("circle")
      // ... other attributes ...
      .on("click", (event, d) => {
        event.stopPropagation();
        if (onNodeInteraction) {
          onNodeInteraction({
            type: 'click',
            node: d.data,
            event: event
          });
        }
      });

  // ... rest of the component ...
}
```

### DreamSong Component
```jsx
const DreamSong = ({ repoName, dreamSongMedia, onClick, ... }) => {
  // ... existing state and effects ...

  const handleNodeInteraction = useCallback((interaction) => {
    const { type, node, event } = interaction;
    
    switch (type) {
      case 'click':
        if (event.metaKey || event.ctrlKey) {
          // Toggle selection (to be implemented)
        } else {
          window.electron.fileSystem.openFile(repoName, node.name);
        }
        break;
      // Future cases: 'rightClick', 'select', 'deselect', etc.
    }
  }, [repoName]);

  // ... in the return statement ...
  {circlePackingData ? (
    <DreamContent
      data={circlePackingData}
      onNodeInteraction={handleNodeInteraction}
    />
  ) : (
    <p>Loading...</p>
  )}
  // ...
}
```

This plan provides a structured approach to implementing the desired functionality while keeping future enhancements in mind. It can be updated and refined as development progresses.
