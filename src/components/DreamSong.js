import React from 'react';

const DreamSong = ({ repoName, metadata, style }) => {
  return (
    <div className="dream-song" style={{
      ...style,
      alignItems: 'center',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '10px',
      boxSizing: 'border-box',
      width: '300px',
      height: '300px',
      backgroundColor: 'black',
      borderRadius: '50%',
      border: '5px solid blue',
      color: 'white',
    }}>
      <h2 style={{ 
        fontSize: '18px', 
        margin: '10px 0', 
        padding: '5px', 
        textAlign: 'center',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
      }}>
        {repoName}
      </h2>
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
              margin: '5px 0',
              maxHeight: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
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
