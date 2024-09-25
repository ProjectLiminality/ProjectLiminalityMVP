import React, { useState } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const SearchPanel = ({ isOpen, onClose, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
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
      <h2 style={{ color: WHITE }}>Search</h2>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0 20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter search term..."
          style={{
            width: '100%',
            padding: '5px',
            marginBottom: '10px',
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
        <button onClick={onClose} style={{ 
          marginRight: '10px',
          padding: '5px 10px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Cancel
        </button>
        <button onClick={handleSearch} style={{
          padding: '5px 10px',
          backgroundColor: BLUE,
          color: WHITE,
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}>
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchPanel;
