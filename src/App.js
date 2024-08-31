import React, { useState, useEffect } from 'react';
import DreamSpace from './components/DreamSpace';
import SettingsPanel from './components/SettingsPanel';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  return (
    <div className="App">
      <DreamSpace />
      <SettingsPanel 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}

export default App;
