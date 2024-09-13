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
        padding: '10px',
        borderRadius: '4px',
        boxShadow: `0 0 0 1px ${BLUE}`,
        zIndex: 1000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        <li 
          onClick={handleEditMetadata}
          style={{ 
            padding: '5px 10px',
            cursor: 'pointer',
            hover: {
              backgroundColor: BLUE,
            }
          }}
        >
          Edit Metadata
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
