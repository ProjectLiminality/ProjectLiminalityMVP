# Migration Plan: Electron App to GitHub Pages

## 1. Project Overview

- Current: Electron app using React Three Fiber
- Goal: Web-based version hosted on GitHub Pages
- New Repository Name: Dream Explorer

## 2. Confirmation of GitHub Pages Capabilities

- [x] Test ability to access files in submodules during GitHub Pages build process
- [x] Create a simple test repository with:
  - Basic index.html
  - Submodule containing media files
  - Attempt to display media from submodule in index.html

## 3. Repository Structure

- Dream Explorer (main repository)
  - Source code for web app
  - DreamVault (folder)
    - Submodules for each DreamNode (git repository)
  - JSON file describing DreamVault structure

## 4. Migration Steps

### 4.1 Project Setup
- [x] Create new Dream Explorer README
- [ ] Create new GitHub repository for Dream Explorer
- [ ] Set up basic project structure

### 4.2 Frontend Migration
- [ ] Identify React components to transfer
- [ ] Adapt components for web-only use (remove Electron-specific code)
- [ ] Update file system access methods
- [ ] Implement React Three Fiber visualizations for web

### 4.3 Backend Simulation
- [ ] Create JSON file generator for DreamVault structure
- [ ] Implement GitHub Actions workflow to update JSON file

### 4.4 File Access
- [ ] Implement method to access README files from submodules
- [ ] Implement method to access media files (thumbnails, icons) from submodules

### 4.5 Remove Electron-Specific Features
- [ ] Identify and remove desktop-only features (e.g., runator command, terminal operations)
- [ ] Adapt or remove any other Electron API calls

### 4.6 GitHub Pages Setup
- [ ] Configure GitHub Pages in the Dream Explorer repository
- [ ] Set up proper build process for React app

## 5. Testing Plan

- [ ] Develop test cases for each major feature
- [ ] Ensure all DreamNodes are correctly displayed
- [ ] Verify media files and READMEs are accessible
- [ ] Test 3D visualization performance in various browsers

## 6. Deployment

- [ ] Final review of the migrated application
- [ ] Deploy to GitHub Pages
- [ ] Verify functionality on the live site

## 7. Future Enhancements

- [ ] Implement search and filter functions
- [ ] Develop AI-powered tools for knowledge synthesis
- [ ] Create collaborative features for real-time interaction
- [ ] Optimize for mobile devices

## Notes and Questions

- How will we handle user authentication and personalization without a backend server?
- What's the best way to optimize the 3D visualizations for web performance?
- Should we consider using WebAssembly for any computationally intensive tasks?
