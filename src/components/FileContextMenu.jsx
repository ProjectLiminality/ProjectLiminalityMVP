import React, { useEffect, useRef } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';

const FileContextMenu = ({ x, y, file, repoName, onClose, onProcessFile }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleProcess = () => {
    onProcessFile(repoName, file);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        backgroundColor: BLACK,
        color: WHITE,
        borderRadius: '4px',
        overflow: 'hidden',
        zIndex: 1000,
        border: `1px solid ${BLUE}`,
      }}
      position={{ x, y }}
      onClick={(e) => e.stopPropagation()}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
        <li style={{ padding: '6px 10px', borderBottom: `1px solid ${BLUE}` }}>
          File: {file}
        </li>
        <li 
          onClick={handleProcess}
          style={{ 
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Process with
        </li>
      </ul>
    </div>
  );
};

export default FileContextMenu;
