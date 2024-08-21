import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [dreamVaultPath, setDreamVaultPath] = useState('');

  useEffect(() => {
    ipcRenderer.on('selected-directory', (event, path) => {
      setDreamVaultPath(path);
    });

    return () => {
      ipcRenderer.removeAllListeners('selected-directory');
    };
  }, []);

  const handleSelectDirectory = () => {
    ipcRenderer.send('open-directory-dialog');
  };

  const handleSave = () => {
    // Save the settings (you can implement this later)
    console.log('Saving DreamVault path:', dreamVaultPath);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    }}>
      <h2>Settings</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="dreamVaultPath">DreamVault Path:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            id="dreamVaultPath"
            value={dreamVaultPath}
            onChange={(e) => setDreamVaultPath(e.target.value)}
            style={{ marginRight: '10px', padding: '5px', flex: 1 }}
          />
          <button onClick={handleSelectDirectory} style={{ padding: '5px 10px' }}>
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
