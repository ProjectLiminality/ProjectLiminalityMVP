import React from 'react';

const DreamTalk = ({ repoName, mediaContent, style }) => {
  return (
    <div className="dream-talk" style={{
      ...style,
      alignItems: 'center',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '10px',
      boxSizing: 'border-box',
      width: '100%',
      height: '100%',
    }}>
      {mediaContent ? (
        mediaContent.type === 'video' ? (
          <video src={mediaContent.url} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={mediaContent.url} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )
      ) : (
        <h2 style={{ 
          fontSize: '18px', 
          margin: 0, 
          padding: '5px', 
          textAlign: 'center',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%',
        }}>
          {repoName}
        </h2>
      )}
    </div>
  );
};

export default DreamTalk;
