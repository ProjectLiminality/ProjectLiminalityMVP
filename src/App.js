import React, { useState, useEffect, useCallback, useRef } from 'react';
import DreamSpace from './components/DreamSpace';
import SettingsPanel from './components/SettingsPanel';
import MetadataPanel from './components/MetadataPanel';
import DreamGraph from './components/DreamGraph';
import ContextMenu from './components/ContextMenu';
import FileContextMenu from './components/FileContextMenu';
import RenamePanel from './components/RenamePanel';
import NodeCreationPanel from './components/NodeCreationPanel';
import SearchPanel from './components/SearchPanel';
import { openInGitFox, processFile } from './services/electronService';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(false);
  const [isRenamePanelOpen, setIsRenamePanelOpen] = useState(false);
  const [isNodeCreationPanelOpen, setIsNodeCreationPanelOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [selectedRepoName, setSelectedRepoName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const [fileContextMenu, setFileContextMenu] = useState(null);
  const dreamGraphRef = useRef(null);
  const [nodeNames, setNodeNames] = useState([]);

  const handleNodesChange = useCallback((newNodeNames) => {
    setNodeNames(newNodeNames);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event, targetNodeName = null) => {
    event.preventDefault();
    const item = event.dataTransfer.items[0];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry();
      const file = event.dataTransfer.files[0];

      if (targetNodeName) {
        // Dropped on a specific node
        try {
          const fileReader = new FileReader();
          fileReader.onload = async (e) => {
            const arrayBuffer = e.target.result;
            const fileData = {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
              data: arrayBuffer
            };
            const fileAdded = await window.electron.fileSystem.addFileToNode(targetNodeName, fileData);
            if (fileAdded) {
              console.log(`File ${file.name} added to node ${targetNodeName}`);
              // You might want to refresh the DreamSpace or update the state here
            } else {
              console.error(`Failed to add file ${file.name} to node ${targetNodeName}`);
            }
          };
          fileReader.onerror = (error) => {
            console.error('Error reading file:', error);
          };
          fileReader.readAsArrayBuffer(file);
        } catch (error) {
          console.error('Error in drag and drop process:', error);
        }
      } else {
        // Dropped on empty space
        if (entry.isDirectory) {
          // Directory dropped
          try {
            const result = await window.electron.fileSystem.copyRepositoryToDreamVault(file.path, entry.name);
            if (result.success) {
              console.log(`Repository ${entry.name} successfully copied to DreamVault`);
              // You might want to refresh the DreamSpace or update the state here
            } else {
              console.error(`Failed to copy repository: ${result.error}`);
            }
          } catch (error) {
            console.error('Error in drag and drop process:', error);
          }
        } else if (entry.name.endsWith('.bundle')) {
          // Git bundle dropped
          try {
            const result = await window.electron.fileSystem.unbundleRepositoryToDreamVault(file.path, file.name.replace('.bundle', ''));
            if (result.success) {
              console.log(`Repository bundle ${file.name} successfully unbundled to DreamVault`);
              // You might want to refresh the DreamSpace or update the state here
            } else {
              console.error(`Failed to unbundle repository: ${result.error}`);
            }
          } catch (error) {
            console.error('Error in drag and drop process:', error);
          }
        } else if (entry.name.endsWith('.zip')) {
          // Zip archive dropped
          try {
            const result = await window.electron.fileSystem.handleZipArchive(file.path);
            if (result.success) {
              console.log(`Zip archive ${file.name} successfully processed`);
              // You might want to refresh the DreamSpace or update the state here
            } else {
              console.error(`Failed to process zip archive: ${result.error}`);
            }
          } catch (error) {
            console.error('Error in drag and drop process:', error);
          }
        } else {
          // File dropped
          try {
            const nodeName = file.name.split('.')[0]; // Use the filename without extension as the node name
            const newNode = await window.electron.fileSystem.createNewNode(nodeName);
            // New node created
            
            if (newNode) {
              // Read the file as an ArrayBuffer
              const fileReader = new FileReader();
              fileReader.onload = async (e) => {
                const arrayBuffer = e.target.result;
                const fileData = {
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  lastModified: file.lastModified,
                  data: arrayBuffer
                };
                const fileAdded = await window.electron.fileSystem.addFileToNode(newNode, fileData);
                if (fileAdded) {
                  // File added to node
                  // You might want to refresh the DreamSpace or update the state here
                } else {
                  console.error(`Failed to add file ${file.name} to node ${newNode}`);
                }
              };
              fileReader.onerror = (error) => {
                console.error('Error reading file:', error);
              };
              fileReader.readAsArrayBuffer(file);
            }
          } catch (error) {
            console.error('Error in drag and drop process:', error);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey && event.key === ',') {
        setIsSettingsOpen(prev => !prev);
      }
      if (event.metaKey && event.key === 'n') {
        event.preventDefault();
        setIsNodeCreationPanelOpen(true);
      }
      if (event.metaKey && event.key === 'z') {
        event.preventDefault();
        if (dreamGraphRef.current) {
          dreamGraphRef.current.handleUndo();
        }
      }
      if (event.metaKey && event.key === 'y') {
        event.preventDefault();
        if (dreamGraphRef.current) {
          dreamGraphRef.current.handleRedo();
        }
      }
      if (event.metaKey && event.key === 'f') {
        event.preventDefault();
        setIsSearchPanelOpen(true);
      }
      if (event.key === 'Escape') {
        if (isSearchPanelOpen) {
          setIsSearchPanelOpen(false);
        } else {
          // Only reset the graph layout if search panel is not open
          if (dreamGraphRef.current && dreamGraphRef.current.resetLayout) {
            dreamGraphRef.current.resetLayout();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDrop, isSearchPanelOpen]);

  const handleOpenMetadataPanel = (repoName) => {
    setSelectedRepoName(repoName);
    setIsMetadataPanelOpen(true);
    setContextMenu(null); // Close context menu when opening metadata panel
  };

  const handleOpenRenamePanel = (repoName) => {
    setSelectedRepoName(repoName);
    setIsRenamePanelOpen(true);
    setContextMenu(null); // Close context menu when opening rename panel
  };

  const handleNodeRightClick = (event, repoName) => {
    if (event && event.preventDefault) {
      event.preventDefault(); // Prevent default context menu
    }
    setContextMenu({ 
      repoName, 
      position: { x: event.clientX, y: event.clientY } 
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
    setFileContextMenu(null);
  };

  const handleFileRightClick = useCallback((event, file) => {
    event.preventDefault();
    event.stopPropagation(); // Prevent the event from bubbling up
    console.log('Right-click detected on file:', file);
    setFileContextMenu({
      file,
      position: { x: event.clientX, y: event.clientY }
    });
    setContextMenu(null); // Close the regular context menu if it's open
  }, []);

  const handleProcessFile = useCallback((repoName, file) => {
    console.log(`Processing file: ${file} in repo: ${repoName}`);
    processFile(repoName, file);
  }, []);

  const handleSearchComplete = (searchResults) => {
    console.log('Search results received in App:', searchResults);
    if (dreamGraphRef.current) {
      dreamGraphRef.current.displaySearchResults(searchResults);
    }
  };

  return (
    <>
      <div className="App" onClick={handleCloseContextMenu}>
        <DreamSpace 
          onNodeRightClick={handleNodeRightClick}
          onFileRightClick={handleFileRightClick}
          dreamGraphRef={dreamGraphRef}
          onDrop={handleDrop}
          onHover={(repoName) => console.log('Hovered node:', repoName)}
          onNodesChange={handleNodesChange}
        />
      </div>
      {isSettingsOpen && (
        <SettingsPanel 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
      {isMetadataPanelOpen && (
        <MetadataPanel 
          isOpen={isMetadataPanelOpen}
          onClose={() => setIsMetadataPanelOpen(false)}
          repoName={selectedRepoName}
        />
      )}
      {isRenamePanelOpen && (
        <RenamePanel
          isOpen={isRenamePanelOpen}
          onClose={() => setIsRenamePanelOpen(false)}
          repoName={selectedRepoName}
        />
      )}
      {isNodeCreationPanelOpen && (
        <NodeCreationPanel
          isOpen={isNodeCreationPanelOpen}
          onClose={() => setIsNodeCreationPanelOpen(false)}
        />
      )}
      <SearchPanel
        isOpen={isSearchPanelOpen}
        onSearch={handleSearchComplete}
        onClose={() => setIsSearchPanelOpen(false)}
        repoNames={nodeNames}
      />
      {contextMenu && (
        <ContextMenu
          repoName={contextMenu.repoName}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          onEditMetadata={handleOpenMetadataPanel}
          onRename={handleOpenRenamePanel}
          onOpenInGitFox={() => openInGitFox(contextMenu.repoName)}
        />
      )}
      {fileContextMenu && (
        <FileContextMenu
          x={fileContextMenu.position.x}
          y={fileContextMenu.position.y}
          file={fileContextMenu.file}
          repoName={selectedRepoName}
          onClose={handleCloseContextMenu}
          onProcessFile={handleProcessFile}
        />
      )}
    </>
  );
}

export default App;
