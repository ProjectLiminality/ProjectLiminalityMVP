import React from 'react';

const DreamTalk = ({ repoName, mediaContent, metadata, style }) => {
  const renderMedia = () => {
    if (!mediaContent || !mediaContent.path) {
      return null;
    }

    switch (mediaContent.type) {
      case 'image':
        return <img src={mediaContent.path} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
      case 'audio':
        return <audio controls src={mediaContent.path} style={{ width: '100%' }} />;
      case 'video':
        return <video controls src={mediaContent.path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
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
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '10px',
    }}>
      {renderMedia()}
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
      {metadata && metadata.description && (
        <p style={{
          fontSize: '14px',
          margin: '5px 0',
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
        }}>
          {metadata.description}
        </p>
      )}
    </div>
  );
};

export default DreamTalk;
