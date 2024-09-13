import React from 'react';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';

const ContextMenu = ({ repoName, onClose, onEditMetadata }) => {
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
      <h2 style={{ color: WHITE }}>Context Menu</h2>
      <p>Repository: {repoName}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button 
          onClick={() => {
            onEditMetadata(repoName);
            onClose();
          }}
          style={{ 
            marginRight: '10px',
            padding: '5px 10px',
            backgroundColor: BLUE,
            color: WHITE,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Edit Metadata
        </button>
        <button 
          onClick={onClose}
          style={{ 
            padding: '5px 10px',
            backgroundColor: RED,
            color: WHITE,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
