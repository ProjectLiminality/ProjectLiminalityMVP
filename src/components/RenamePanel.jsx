import React, { useState } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const RenamePanel = ({ isOpen, onClose, repoName }) => {
  const [newName, setNewName] = useState(repoName);

  const handleRename = () => {
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
      border: `1px solid ${BLUE}`,
    }}>
      <h2>Rename</h2>
      <input
        type="text"
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
        }}
      />
      <div>
        <button onClick={handleRename} style={{
          backgroundColor: BLUE,
          color: WHITE,
          border: 'none',
          padding: '8px 16px',
          marginRight: '10px',
          cursor: 'pointer',
        }}>
          Rename
        </button>
        <button onClick={onClose} style={{
          backgroundColor: 'transparent',
          color: WHITE,
          border: `1px solid ${WHITE}`,
          padding: '8px 16px',
          cursor: 'pointer',
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RenamePanel;
