import React from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const ContextMenu = ({ repoName, position, onClose, onEditMetadata }) => {
  const handleEditMetadata = () => {
    onEditMetadata(repoName);
    onClose();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        backgroundColor: BLACK,
        color: WHITE,
        borderRadius: '4px',
        overflow: 'hidden',
        zIndex: 1000,
        border: `2px solid ${BLUE}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li 
          onClick={handleEditMetadata}
          style={{ 
            padding: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Edit Metadata
        </li>
        <li 
          style={{ 
            padding: '10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Rename
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
