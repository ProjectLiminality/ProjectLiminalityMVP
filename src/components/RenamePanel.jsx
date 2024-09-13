import React, { useState } from 'react';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';

const RenamePanel = ({ isOpen, onClose, repoName }) => {
  const [newName, setNewName] = useState(repoName);

  const handleSave = () => {
    // TODO: Implement rename functionality
    console.log(`Renaming ${repoName} to ${newName}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: BLACK,
      color: WHITE,
      padding: '20px',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: `0 0 0 2px ${BLUE}`,
    }}>
      <h2 style={{ color: WHITE }}>Rename</h2>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        style={{
          width: '100%',
          padding: '5px',
          marginBottom: '10px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button onClick={onClose} style={{ 
          marginRight: '10px',
          padding: '5px 10px',
          backgroundColor: RED,
          color: WHITE,
          border: 'none',
          cursor: 'pointer'
        }}>
          Cancel
        </button>
        <button onClick={handleSave} style={{
          padding: '5px 10px',
          backgroundColor: BLUE,
          color: WHITE,
          border: 'none',
          cursor: 'pointer',
        }}>
          Save
        </button>
      </div>
    </div>
  );
};

export default RenamePanel;
