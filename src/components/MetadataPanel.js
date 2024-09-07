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
      setError('Failed to save metadata');
      console.error('Error saving metadata:', err);
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
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2 style={{ color: WHITE }}>Metadata Editor</h2>
      {isLoading ? (
        <p>Loading metadata...</p>
      ) : error ? (
        <p style={{ color: RED }}>{error}</p>
      ) : (
        <>
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>{key}:</label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key, e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '5px',
                  backgroundColor: BLACK,
                  color: WHITE,
                  border: `1px solid ${BLUE}`
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              onClick={onClose}
              style={{ 
                marginRight: '10px',
                padding: '5px 10px',
                backgroundColor: RED,
                color: WHITE,
                border: 'none',
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
