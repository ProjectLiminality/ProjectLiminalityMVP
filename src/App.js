import React, { useState, useEffect } from 'react';
import DreamSpace from './components/DreamSpace';
import SettingsPanel from './components/SettingsPanel';
import MetadataPanel from './components/MetadataPanel';
import ContextMenu from './components/ContextMenu';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMetadataPanelOpen, setIsMetadataPanelOpen] = useState(false);
  const [selectedRepoName, setSelectedRepoName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.metaKey && event.key === ',') {
        setIsSettingsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleOpenMetadataPanel = (repoName) => {
    console.log(`Opening MetadataPanel: ${repoName}`);
    setSelectedRepoName(repoName);
    setIsMetadataPanelOpen(true);
    setContextMenu(null); // Close context menu when opening metadata panel
  };

  const handleNodeRightClick = (repoName, event) => {
    console.log(`Right-clicked on node: ${repoName}`);
    event.preventDefault(); // Prevent default context menu
    setContextMenu({ 
      repoName, 
      position: { x: event.clientX, y: event.clientY } 
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  return (
    <>
      <div className="App" onClick={handleCloseContextMenu}>
        <DreamSpace 
          onNodeRightClick={handleNodeRightClick}
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
      {contextMenu && (
        <ContextMenu
          repoName={contextMenu.repoName}
          position={contextMenu.position}
          onClose={handleCloseContextMenu}
          onEditMetadata={handleOpenMetadataPanel}
        />
      )}
    </>
  );
}

export default App;
