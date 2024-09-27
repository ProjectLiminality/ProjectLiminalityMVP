import React from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';

const DreamTalk = ({ repoName, dreamTalkMedia, metadata, onClick, onRightClick, isHovered, borderColor, onFlip }) => {
  const renderMedia = () => {
    if (!dreamTalkMedia || !dreamTalkMedia.data) {
      return null;
    }

    const commonStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      position: 'absolute',
      top: '0',
      left: '0',
    };

    switch (dreamTalkMedia.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={dreamTalkMedia.data} alt={repoName} style={commonStyle} />;
      case 'audio/mpeg':
      case 'audio/wav':
        return (
          <div style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLACK }}>
            <audio controls src={dreamTalkMedia.data} style={{ width: '90%', maxWidth: '250px' }} />
          </div>
        );
      case 'video/mp4':
      case 'video/webm':
        return <video controls src={dreamTalkMedia.data} style={commonStyle} />;
      default:
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
        borderRadius: '50%',
        border: `5px solid ${borderColor}`,
        color: WHITE,
        boxSizing: 'border-box',
        background: BLACK,
      }}
    >
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '80%',
        height: '80%',
        borderRadius: '50%',
        overflow: 'hidden',
      }}>
        {renderMedia()}
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 80%)',
        pointerEvents: 'none',
      }} />
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
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: 0,
          transition: 'opacity 0.3s ease',
        }}
        className="flip-button-container"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFlip();
          }}
          style={{
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
      <style>
        {`
          .dream-talk:hover .flip-button-container {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default React.memo(DreamTalk);
