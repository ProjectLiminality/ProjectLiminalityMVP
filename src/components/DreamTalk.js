import React, { useState, useEffect } from 'react';

const DreamTalk = ({ repoName, mediaContent, metadata, onClick, onMouseEnter, onMouseLeave }) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    console.log(`DreamTalk rendering for ${repoName}:`, { mediaContent, metadata });
  }, [repoName, mediaContent, metadata]);

  const renderMedia = () => {
    if (!mediaContent || !mediaContent.data) {
      console.log(`No media content for ${repoName}`);
      return null;
    }

    console.log(`Rendering media for ${repoName}:`, mediaContent.type);
    switch (mediaContent.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={mediaContent.data} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />;
      case 'audio/mpeg':
      case 'audio/wav':
        return <audio controls src={mediaContent.data} style={{ width: '90%', maxWidth: '250px' }} />;
      case 'video/mp4':
      case 'video/webm':
        return <video controls src={mediaContent.data} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />;
      default:
        console.log(`Unsupported media type for ${repoName}:`, mediaContent.type);
        return null;
    }
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  return (
    <div 
      className="dream-talk" 
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '300px',
        height: '300px',
        backgroundColor: 'black',
        borderRadius: '50%',
        border: '5px solid blue',
        color: 'white',
        backfaceVisibility: 'hidden',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {renderMedia()}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,1) 70%)',
          pointerEvents: 'none',
        }} />
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        background: isHovered || !mediaContent ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        opacity: isHovered || !mediaContent ? 1 : 0,
        transition: 'opacity 0.3s ease, background 0.3s ease',
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
