import React from 'react';

const DreamSong = ({ repoName, metadata, style }) => {
  return (
    <div className="dream-song" style={{
      ...style,
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: '10px',
      padding: '20px',
      backgroundColor: 'rgba(200, 230, 255, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>{repoName}</h2>
      {metadata && (
        <>
          {metadata.dateCreated && (
            <p style={{ fontSize: '14px', margin: '5px 0' }}>Created: {new Date(metadata.dateCreated).toLocaleDateString()}</p>
          )}
          {metadata.tags && metadata.tags.length > 0 && (
            <p style={{ fontSize: '14px', margin: '5px 0' }}>Tags: {metadata.tags.join(', ')}</p>
          )}
          {metadata.aiPrompt && (
            <p style={{ 
              fontSize: '14px', 
              margin: '10px 0',
              maxHeight: '100px',
              overflow: 'auto',
              padding: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '5px'
            }}>
              AI Prompt: {metadata.aiPrompt}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default DreamSong;
