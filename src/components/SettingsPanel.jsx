import React, { useState, useEffect } from 'react';
import { isElectronAvailable, openDirectoryDialog, getDreamVaultPath, setDreamVaultPath as setDreamVaultPathService } from '../services/electronService';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [dreamVaultPath, setDreamVaultPathState] = useState('');
  const [isElectronAvailableState, setIsElectronAvailableState] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [initialNodeCount, setInitialNodeCount] = useState(localStorage.getItem('initialNodeCount') || '5');

  useEffect(() => {
    const checkElectronAvailability = async () => {
      const electronAvailable = isElectronAvailable();
      setIsElectronAvailableState(electronAvailable);
      console.log('Is Electron available:', electronAvailable);

      // Load saved DreamVault path
      if (electronAvailable) {
        const path = await getDreamVaultPath();
        setDreamVaultPathState(path);
      }
    };

    checkElectronAvailability();
  }, []);

  const handleSelectDirectory = async () => {
    console.log('handleSelectDirectory called');
    if (isElectronAvailableState) {
      try {
        console.log('Attempting to open directory dialog');
        const path = await openDirectoryDialog();
        console.log('Directory dialog result:', path);
        if (path) {
          setDreamVaultPathState(path);
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
    setDreamVaultPathState(e.target.value);
  };

  const handleSave = async () => {
    console.log('Saving DreamVault path:', dreamVaultPath);
    if (isElectronAvailableState) {
      await setDreamVaultPathService(dreamVaultPath);
    }
    localStorage.setItem('initialNodeCount', initialNodeCount);
    setIsManualInput(false);
    onClose();
  };

  const handleInitialNodeCountChange = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    setInitialNodeCount(value.toString());
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: BLACK,
        color: WHITE,
        padding: '20px',
        borderRadius: '8px',
        boxShadow: `0 0 0 2px ${BLUE}`,
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ color: WHITE }}>Settings</h2>
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="dreamVaultPath" style={{ color: WHITE }}>DreamVault Path:</label>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            id="dreamVaultPath"
            value={dreamVaultPath}
            onChange={handleManualInput}
            readOnly={!isManualInput}
            style={{ 
              marginRight: '10px', 
              padding: '5px', 
              flex: 1, 
              backgroundColor: BLACK, 
              color: WHITE, 
              border: `1px solid ${BLUE}` 
            }}
          />
          <button 
            onClick={handleSelectDirectory} 
            style={{ 
              padding: '5px 10px', 
              backgroundColor: BLUE, 
              color: WHITE, 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            📁 Select Directory
          </button>
        </div>
      </div>
      {isManualInput && (
        <p style={{ fontSize: '0.8em', color: RED }}>
          Enter the DreamVault path manually and click Save.
        </p>
      )}
      <div style={{ marginBottom: '15px' }}>
        <label htmlFor="initialNodeCount" style={{ color: WHITE }}>Initial Node Count:</label>
        <input
          type="number"
          id="initialNodeCount"
          value={initialNodeCount}
          onChange={handleInitialNodeCountChange}
          min="1"
          style={{ 
            marginLeft: '10px',
            padding: '5px', 
            backgroundColor: BLACK, 
            color: WHITE, 
            border: `1px solid ${BLUE}` 
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={onClose} 
          style={{ 
            marginRight: '10px', 
            padding: '5px 10px', 
            backgroundColor: RED, 
            color: WHITE, 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Cancel
        </button>
        <button 
          onClick={handleSave} 
          style={{ 
            padding: '5px 10px', 
            backgroundColor: BLUE, 
            color: WHITE, 
            border: 'none', 
            cursor: 'pointer' 
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
