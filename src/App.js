import React, { useState, useEffect } from 'react';
import './App.css';
import Three from './Three';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

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

  const handleOpenDirectory = async () => {
    try {
      const path = await window.electron.openDirectoryDialog();
      if (path) {
        setSelectedPath(path);
        console.log('Selected directory:', path);
      }
    } catch (error) {
      console.error('Error opening directory:', error);
    }
  };

  const handleOpenFile = async () => {
    try {
      const path = await window.electron.openFileDialog();
      if (path) {
        setSelectedPath(path);
        console.log('Selected file:', path);
      }
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  return (
    <div className="App">
      <Three />
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <div>
        <button onClick={handleOpenDirectory}>Open Directory</button>
        <button onClick={handleOpenFile}>Open File</button>
        {selectedPath && <p>Selected path: {selectedPath}</p>}
      </div>
    </div>
  );
}

export default App;
