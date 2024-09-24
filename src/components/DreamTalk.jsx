import React from 'react';
import { BLUE, BLACK, WHITE } from '../constants/colors';

const DreamTalk = ({ repoName, dreamTalkMedia, metadata, onClick, onRightClick, isHovered, borderColor, onFlip }) => {
  const renderMedia = () => {
    if (!dreamTalkMedia || !dreamTalkMedia.data) {
      return null;
    }

    switch (dreamTalkMedia.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={dreamTalkMedia.data} alt={repoName} style={{ width: '75%', height: '75%', objectFit: dreamTalkMedia.type === 'image/gif' ? 'cover' : 'contain', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
      case 'audio/mpeg':
      case 'audio/wav':
        return <audio controls src={dreamTalkMedia.data} style={{ width: '90%', maxWidth: '250px' }} />;
      case 'video/mp4':
      case 'video/webm':
        return <video controls src={dreamTalkMedia.data} style={{ width: '75%', height: '75%', objectFit: 'contain', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />;
      default:
        console.log(`Unsupported media type for ${repoName}:`, dreamTalkMedia.type);
        return null;
    }
  };

  return (
    <div 
      className="dream-talk" 
      onClick={() => onClick(repoName)}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(e);
      }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        backgroundColor: BLACK,
        borderRadius: '50%',
        border: `5px solid ${borderColor}`,
        color: WHITE,
        boxSizing: 'border-box',
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
        background: !dreamTalkMedia ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        opacity: !dreamTalkMedia ? 1 : 0,
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
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFlip();
        }}
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: BLUE,
          color: WHITE,
          border: 'none',
          borderRadius: '5px',
          padding: '5px 10px',
          cursor: 'pointer',
        }}
      >
        Flip
      </button>
    </div>
  );
};

export default React.memo(DreamTalk);
