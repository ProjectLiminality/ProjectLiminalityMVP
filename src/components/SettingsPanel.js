import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [dreamVaultPath, setDreamVaultPath] = useState('');
  const [isElectronAvailable, setIsElectronAvailable] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);

  useEffect(() => {
    const checkElectron = () => {
      console.log('Window object:', window);
      console.log('Electron object:', window.electron);
      const electronAvailable = !!(window.electron && window.electron.isElectron);
      setIsElectronAvailable(electronAvailable);
      console.log('Is Electron available:', electronAvailable);
    };

    checkElectron();
  }, []);

  const handleSelectDirectory = async () => {
    console.log('handleSelectDirectory called');
    if (isElectronAvailable) {
      try {
        console.log('Attempting to open directory dialog');
        const path = await window.electron.openDirectoryDialog();
        console.log('Directory dialog result:', path);
        if (path) {
          setDreamVaultPath(path);
          setIsManualInput(false);
        }
      } catch (error) {
        console.error('Error opening directory dialog:', error);
        setIsManualInput(true);
      }
    } else {
      console.log('Electron not available, switching to manual input');
      setIsManualInput(true);
    }
  };

  const handleManualInput = (e) => {
    setDreamVaultPath(e.target.value);
  };

  const handleSave = () => {
    console.log('Saving DreamVault path:', dreamVaultPath);
    setIsManualInput(false);
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
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Settings</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="dreamVaultPath">DreamVault Path:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            id="dreamVaultPath"
            value={dreamVaultPath}
            onChange={handleManualInput}
            readOnly={!isManualInput}
            style={{ marginRight: '10px', padding: '5px', flex: 1 }}
          />
          <button 
            onClick={handleSelectDirectory} 
            style={{ padding: '5px 10px' }}
          >
            📁 Select Directory
          </button>
        </div>
      </div>
      {isManualInput && (
        <p style={{ fontSize: '0.8em', color: '#666' }}>
          Enter the DreamVault path manually and click Save.
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onClose} style={{ marginRight: '10px', padding: '5px 10px' }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '5px 10px' }}>Save</button>
      </div>
    </div>
  );
};

export default SettingsPanel;
