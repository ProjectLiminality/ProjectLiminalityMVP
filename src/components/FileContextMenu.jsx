import React, { useEffect, useRef } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';

const FileContextMenu = ({ x, y, file, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    console.log('FileContextMenu rendered with props:', { x, y, file });
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        console.log('Click outside detected, closing menu');
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [x, y, file, onClose]);

  const handleProcess = () => {
    console.log(`Processing file: ${file}`);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        backgroundColor: BLACK,
        border: `1px solid ${BLUE}`,
        borderRadius: '4px',
        padding: '8px',
        zIndex: 10000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        pointerEvents: 'auto', // Ensure the menu can receive mouse events
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ color: WHITE, marginBottom: '4px', fontWeight: 'bold' }}>File: {file}</div>
      <div
        style={{
          color: WHITE,
          cursor: 'pointer',
          padding: '4px 8px',
          transition: 'background-color 0.2s ease',
        }}
        onClick={handleProcess}
        onMouseEnter={(e) => e.target.style.backgroundColor = BLUE}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        Process with
      </div>
    </div>
  );
};

export default FileContextMenu;
