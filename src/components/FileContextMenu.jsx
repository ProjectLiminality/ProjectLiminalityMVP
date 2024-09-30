import React, { useEffect, useRef } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';

const FileContextMenu = ({ x, y, file, onClose }) => {
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
        zIndex: 1000,
      }}
    >
      <div
        style={{
          color: WHITE,
          cursor: 'pointer',
          padding: '4px 8px',
        }}
        onClick={handleProcess}
      >
        Process with
      </div>
    </div>
  );
};

export default FileContextMenu;
