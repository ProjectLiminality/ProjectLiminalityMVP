import React, { useState, useEffect, useRef } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const SearchPanel = ({ isOpen, onSearch, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm !== '') {
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSearchTerm('');
        onClose();
        onSearch(''); // Reset search results
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, onSearch]);

  if (!isOpen) return null;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onClose();
    }
  };

  const handleChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value === '') {
      onSearch(''); // Reset search results when search term is empty
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: BLACK,
      color: WHITE,
      padding: '10px',
      borderRadius: '8px',
      zIndex: 1000,
      boxShadow: `0 0 0 2px ${BLUE}`,
    }}>
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        style={{
          width: '300px',
          padding: '5px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
          borderRadius: '4px',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.border = `1px solid ${BLUE}`;
        }}
        onBlur={(e) => {
          e.target.style.border = `1px solid ${BLUE}`;
        }}
      />
    </div>
  );
};

export default SearchPanel;
