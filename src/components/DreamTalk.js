import React from 'react';

const DreamTalk = ({ repoName, mediaContent, metadata, style, onClick, onMouseEnter, onMouseLeave }) => {
  console.log(`DreamTalk rendering for ${repoName}. Media content:`, mediaContent);

  const renderMedia = () => {
    if (!mediaContent || !mediaContent.data) {
      console.log(`No media content to render for ${repoName}`);
      return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: '50%' }}>
          <p style={{ color: 'white', textAlign: 'center' }}>No media content available</p>
        </div>
      );
    }

    console.log(`Rendering media for ${repoName}. Type:`, mediaContent.type);

    switch (mediaContent.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={mediaContent.data} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => console.error(`Error loading image for ${repoName}:`, e)} />;
      case 'audio/mpeg':
      case 'audio/wav':
        return <audio controls src={mediaContent.data} style={{ width: '90%', maxWidth: '250px' }} onError={(e) => console.error(`Error loading audio for ${repoName}:`, e)} />;
      case 'video/mp4':
      case 'video/webm':
        return <video controls src={mediaContent.data} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => console.error(`Error loading video for ${repoName}:`, e)} />;
      default:
        console.log(`Unsupported media type for ${repoName}:`, mediaContent.type);
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', borderRadius: '50%' }}>
            <p style={{ color: 'white', textAlign: 'center' }}>Unsupported media type</p>
          </div>
        );
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
