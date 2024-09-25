import React, { useState, useEffect, useCallback, useRef } from 'react';
import DreamSpace from './components/DreamSpace';
import SettingsPanel from './components/SettingsPanel';
import MetadataPanel from './components/MetadataPanel';
import DreamGraph from './components/DreamGraph';
import ContextMenu from './components/ContextMenu';
import RenamePanel from './components/RenamePanel';
import NodeCreationPanel from './components/NodeCreationPanel';
import SearchPanel from './components/SearchPanel';
import { openInGitFox } from './services/electronService';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(false);
  const [isRenamePanelOpen, setIsRenamePanelOpen] = useState(false);
  const [isNodeCreationPanelOpen, setIsNodeCreationPanelOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [selectedRepoName, setSelectedRepoName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);
  const dreamGraphRef = useRef(null);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
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
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [handleDragOver, handleDrop]);

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

  const handleNodeRightClick = (repoName, event) => {
    event.preventDefault(); // Prevent default context menu
    setContextMenu({ 
      repoName, 
      position: { x: event.clientX, y: event.clientY } 
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleSearch = (searchTerm) => {
    // TODO: Implement search functionality
    console.log('Searching for:', searchTerm);
    setIsSearchPanelOpen(false);
    // You'll need to pass this search term to your DreamGraph component
    // or wherever you want to implement the search functionality
  };

  return (
    <>
      <div className="App" onClick={handleCloseContextMenu}>
        <DreamSpace 
          onNodeRightClick={handleNodeRightClick}
          dreamGraphRef={dreamGraphRef}
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
      {isSearchPanelOpen && (
        <SearchPanel
          isOpen={isSearchPanelOpen}
          onClose={() => setIsSearchPanelOpen(false)}
          onSearch={handleSearch}
        />
      )}
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
    </>
  );
}

export default App;
