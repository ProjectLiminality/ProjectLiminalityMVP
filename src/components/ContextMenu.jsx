import React from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const ContextMenu = ({ repoName, position, onClose, onEditMetadata, onRename }) => {
  const handleEditMetadata = () => {
    onEditMetadata(repoName);
    onClose();
  };

  const handleRename = () => {
    onRename(repoName);
    onClose();
  };

  const handleOpenInFinder = () => {
    if (window.electron && window.electron.openInFinder) {
      window.electron.openInFinder(repoName);
    } else {
      console.error('openInFinder is not available');
    }
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
        border: `1px solid ${BLUE}`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
        <li 
          onClick={handleEditMetadata}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Edit Metadata
        </li>
        <li 
          onClick={handleRename}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Rename
        </li>
        <li 
          onClick={handleOpenInFinder}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Open in Finder
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
