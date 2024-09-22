# Undo/Redo Feature Implementation Plan

## 1. Set up Redux
- [x] Install dependencies (redux, react-redux, @reduxjs/toolkit)
- [x] Create store (src/store/index.js)
- [x] Set up history reducer (src/store/historySlice.js)

## 2. Modify DreamGraph Component
- [x] Implement action creators for node clicks and escape key presses
- [x] Dispatch these actions to the Redux store
- [x] Connect the DreamGraph component to the Redux store

## 3. Update App Component
- [ ] Add keyboard event listeners for undo (Cmd+Z) and redo (Cmd+Shift+Z)
- [ ] Dispatch undo and redo actions to the Redux store

## 4. Enhance History Reducer
- [ ] Refine the state structure to focus on last action
- [ ] Implement undo and redo functionality

## 5. Create Middleware for Side Effects
- [ ] Intercept actions and trigger appropriate changes in DreamGraph
- [ ] Implement "shadow mode" for replaying actions without adding to history

## 6. Update DreamGraph for Shadow Mode
- [ ] Modify handleNodeClick and handleEscapeKey to accept "addToHistory" parameter
- [ ] Only dispatch actions to store when not in shadow mode

## 7. Connect and Test
- [ ] Ensure Redux store is properly connected to React components
- [ ] Implement comprehensive testing for undo/redo functionality
- [ ] Debug and refine as necessary

## 8. Optimization and Refactoring
- [ ] Review implementation for potential optimizations
- [ ] Refactor code for clarity and maintainability
- [ ] Update documentation and comments

## 9. Final Testing and Review
- [ ] Conduct thorough testing of the entire feature
- [ ] Review code for adherence to project standards and best practices
- [ ] Address any remaining issues or edge cases
