import React, { useRef, useEffect, useState } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';

const DreamTalk = ({ repoName, dreamTalkMedia, metadata, onClick, onRightClick, isHovered, borderColor, onFlip }) => {
  const containerRef = useRef(null);
  const mediaRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const container = containerRef.current;
        const size = Math.min(container.offsetWidth, container.offsetHeight);
        setDimensions({ width: size, height: size });
      };

      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  const renderMedia = () => {
    if (!dreamTalkMedia || !dreamTalkMedia.data) {
      return null;
    }

    const commonStyle = {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };

    switch (dreamTalkMedia.type) {
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img ref={mediaRef} src={dreamTalkMedia.data} alt={repoName} style={commonStyle} />;
      case 'audio/mpeg':
      case 'audio/wav':
        return (
          <div ref={mediaRef} style={{ ...commonStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLACK }}>
            <audio controls src={dreamTalkMedia.data} style={{ width: '90%', maxWidth: '200px' }} />
          </div>
        );
      case 'video/mp4':
      case 'video/webm':
        return <video ref={mediaRef} controls src={dreamTalkMedia.data} style={commonStyle} />;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
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
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        borderRadius: '50%',
        overflow: 'hidden',
      }}>
        {renderMedia()}
      </div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        background: 'radial-gradient(circle, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,1) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
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
        padding: '10px',
        boxSizing: 'border-box',
        background: !dreamTalkMedia ? 'rgba(0, 0, 0, 0.7)' : 'transparent',
        opacity: !dreamTalkMedia ? 1 : 0,
        transition: 'opacity 0.3s ease, background 0.3s ease',
        overflow: 'hidden',
      }}>
        <div style={{
          maxHeight: '100%',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            margin: '5px 0', 
            padding: '3px', 
            textAlign: 'center',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}>
            {repoName}
          </h2>
          {metadata && metadata.description && (
            <p style={{
              fontSize: '12px',
              margin: '3px 0',
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
