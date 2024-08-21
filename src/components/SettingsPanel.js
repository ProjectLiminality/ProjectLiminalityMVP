import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [dreamVaultPath, setDreamVaultPath] = useState('');
  const [isElectronAvailable, setIsElectronAvailable] = useState(false);

  useEffect(() => {
    setIsElectronAvailable(!!window.electron);

    if (window.electron) {
      window.electron.onSelectedDirectory((event, path) => {
        setDreamVaultPath(path);
      });

      return () => {
        window.electron.removeSelectedDirectoryListener();
      };
    }
  }, []);

  const handleSelectDirectory = () => {
    if (isElectronAvailable) {
      window.electron.openDirectoryDialog();
    } else {
      console.warn('Electron API not available');
      // Fallback for web environment
      alert('Directory selection is not available in web environment.');
    }
  };

  const handleSave = () => {
    // Save the settings (you can implement this later)
    console.log('Saving DreamVault path:', dreamVaultPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to underlying elements
    >
      <h2>Settings</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="dreamVaultPath">DreamVault Path:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            id="dreamVaultPath"
            value={dreamVaultPath}
            readOnly
            style={{ marginRight: '10px', padding: '5px', flex: 1 }}
          />
          <button 
            onClick={handleSelectDirectory} 
            style={{ padding: '5px 10px' }}
            disabled={!isElectronAvailable}
          >
            📁
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ marginRight: '10px', padding: '5px 10px' }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '5px 10px' }}>Save</button>
      </div>
    </div>
  );
};

export default SettingsPanel;
