import React from 'react';

const DreamTalk = ({ repoName, mediaContent, style }) => {
  const renderMedia = () => {
    if (!mediaContent || !mediaContent.path) {
      return null;
    }

    switch (mediaContent.type) {
      case 'image':
        return <img src={mediaContent.path} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
      case 'audio':
        return <audio controls src={mediaContent.path} style={{ width: '100%' }} />;
      default:
        return null;
    }
  };

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
      {renderMedia() || (
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
