# Migration Plan: Electron App to GitHub Pages

## 1. Project Overview

- Current: Electron app using React Three Fiber
- Goal: Web-based version hosted on GitHub Pages
- New Repository Name: Dream Explorer

## 2. Confirmation of GitHub Pages Capabilities

- [ ] Test ability to access files in submodules during GitHub Pages build process
- [ ] Create a simple test repository with:
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

### 4.1 Frontend Migration
- [ ] Identify React components to transfer
- [ ] Adapt components for web-only use (remove Electron-specific code)
- [ ] Update file system access methods

### 4.2 Backend Simulation
- [ ] Create JSON file generator for DreamVault structure
- [ ] Implement GitHub Actions workflow to update JSON file

### 4.3 File Access
- [ ] Implement method to access README files from submodules
- [ ] Implement method to access media files (thumbnails, icons) from submodules

### 4.4 Remove Electron-Specific Features
- [ ] Identify and remove desktop-only features (e.g., runator command, terminal operations)
- [ ] Adapt or remove any other Electron API calls

### 4.5 GitHub Pages Setup
- [ ] Configure GitHub Pages in the Dream Explorer repository
- [ ] Set up proper build process for React app

## 5. Testing Plan

- [ ] Develop test cases for each major feature
- [ ] Ensure all DreamNodes are correctly displayed
- [ ] Verify media files and READMEs are accessible

## 6. Deployment

- [ ] Final review of the migrated application
- [ ] Deploy to GitHub Pages
- [ ] Verify functionality on the live site

## 7. Future Enhancements

- [ ] List potential features to add in the web version
- [ ] Identify any desktop-specific features that might need web alternatives

## Notes and Questions

(Add any notes, questions, or concerns that come up during the migration process)
