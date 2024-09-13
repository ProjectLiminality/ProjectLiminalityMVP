import React, { useState, useEffect } from 'react';
import { readMetadata, writeMetadata } from '../services/electronService';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';

const MetadataPanel = ({ isOpen, onClose, repoName }) => {
  const [metadata, setMetadata] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && repoName) {
      loadMetadata();
    }
  }, [isOpen, repoName]);

  const loadMetadata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await readMetadata(repoName);
      setMetadata(data);
    } catch (err) {
      setError('Failed to load metadata');
      console.error('Error loading metadata:', err);
    }
    setIsLoading(false);
  };

  const handleInputChange = (key, value) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await writeMetadata(repoName, metadata);
      onClose();
    } catch (err) {
      setError('Failed to save metadata: ' + err.message);
      console.error('Error saving metadata:', err);
    }
  };

  const renderInput = (key, value) => {
    if (key === 'type') {
      return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              value="idea"
              checked={value === 'idea'}
              onChange={() => handleInputChange(key, 'idea')}
            /> Idea
          </label>
          <label>
            <input
              type="radio"
              value="person"
              checked={value === 'person'}
              onChange={() => handleInputChange(key, 'person')}
            /> Person
          </label>
        </div>
      );
    } else if (key === 'interactions') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleInputChange(key, parseInt(e.target.value, 10))}
          style={{ 
            width: '60%',
            padding: '5px',
            backgroundColor: BLACK,
            color: WHITE,
            border: `1px solid ${BLUE}`,
            borderRadius: '4px'
          }}
        />
      );
    } else {
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleInputChange(key, e.target.value)}
          style={{ 
            width: '60%',
            padding: '5px',
            backgroundColor: BLACK,
            color: WHITE,
            border: `1px solid ${BLUE}`,
            borderRadius: '4px'
          }}
        />
      );
    }
  };

  if (!isOpen) return null;

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
        width: '400px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ color: WHITE, textAlign: 'center' }}>Metadata Editor</h2>
      {isLoading ? (
        <p>Loading metadata...</p>
      ) : error ? (
        <p style={{ color: RED }}>{error}</p>
      ) : (
        <>
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <label style={{ width: '30%', marginRight: '10px', textAlign: 'right' }}>{key}:</label>
              {renderInput(key, value)}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button 
              onClick={onClose}
              style={{ 
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: RED,
                color: WHITE,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              style={{ 
                padding: '5px 10px',
                backgroundColor: BLUE,
                color: WHITE,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MetadataPanel;
