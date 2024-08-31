import React from 'react';

const DreamTalk = ({ repoName, mediaContent, metadata, style, onClick, onMouseEnter, onMouseLeave }) => {
  const renderMedia = () => {
    if (!mediaContent || !mediaContent.path) {
      return null;
    }

    switch (mediaContent.type) {
      case 'image':
        return <img src={mediaContent.path} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
      case 'audio':
        return <audio controls src={mediaContent.path} style={{ width: '90%', maxWidth: '250px' }} />;
      case 'video':
        return <video controls src={mediaContent.path} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />;
      default:
        return null;
    }
  };

  return (
    <div 
      className="dream-talk" 
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
      ...style,
      alignItems: 'center',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0',
      boxSizing: 'border-box',
      width: '300px',
      height: '300px',
      backgroundColor: 'black',
      borderRadius: '50%',
      border: '5px solid blue',
      color: 'white',
      backfaceVisibility: 'hidden',
    }}>
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        borderRadius: '50%',
        overflow: 'hidden',
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
    </div>
  );
};

export default DreamTalk;
