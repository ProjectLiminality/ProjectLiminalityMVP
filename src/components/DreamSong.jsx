import React, { useState, useEffect } from 'react';
import { BLACK, WHITE, BLUE } from '../constants/colors';
import { readDreamSongCanvas } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';

const DreamSong = ({ repoName, dreamSongMedia, onClick, onRightClick, borderColor, onFlip }) => {
  const [processedNodes, setProcessedNodes] = useState([]);

  useEffect(() => {
    const fetchAndProcessCanvas = async () => {
      const canvasData = await readDreamSongCanvas(repoName);
      if (canvasData) {
        const processed = processDreamSongData(canvasData);
        setProcessedNodes(processed);
      } else {
        setProcessedNodes([]);
      }
    };

    fetchAndProcessCanvas();
  }, [repoName]);

  const handleMediaClick = (event) => {
    event.stopPropagation();
    const mediaFile = event.target.alt;

    if (typeof mediaFile === 'string') {
      const pathParts = mediaFile.split('/');
      let targetRepo;

      if (pathParts.length === 2) {
        targetRepo = repoName;
      } else if (pathParts.length > 2) {
        targetRepo = pathParts[pathParts.length - 2];
      }

      if (targetRepo) {
        onClick(targetRepo);
      }
    }
  };

  const renderMediaElement = (file, index) => {
    const mediaItem = dreamSongMedia.find(item => item.filePath === file);
    if (!mediaItem) return null;

    const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
    if (isVideo) {
      return (
        <video
          key={`video-${index}`}
          src={`data:${mediaItem.mimeType};base64,${mediaItem.data}`}
          style={{ maxWidth: '100%', height: 'auto' }}
          controls
          onClick={handleMediaClick}
        />
      );
    } else {
      return (
        <img
          key={`img-${index}`}
          src={`data:${mediaItem.mimeType};base64,${mediaItem.data}`}
          alt={file}
          style={{ maxWidth: '100%', height: 'auto' }}
          onClick={handleMediaClick}
        />
      );
    }
  };

  const renderNode = (node, index) => {
    if (node.type === 'file') {
      return renderMediaElement(node.file, `file-${index}`);
    } else if (node.type === 'text') {
      return <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: node.text }} />;
    }
    return null;
  };

  return (
    <div 
      className="dream-song" 
      style={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: '50%',
        border: `5px solid ${borderColor || BLUE}`,
        backgroundColor: BLACK,
        color: WHITE,
        boxSizing: 'border-box',
      }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(e);
      }}
    >
      <div
        className="dream-song-content"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',  // Firefox
          msOverflowStyle: 'none',  // Internet Explorer 10+
          padding: '16px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <style>
          {`
            .dream-song-content::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>
        <h2>{repoName}</h2>
        <div style={{ width: '100%', maxWidth: '800px' }}>
          {processedNodes.length > 0 ? (
            processedNodes.map((node, index) => renderNode(node, index))
          ) : (
            <p>No DreamSong data available</p>
          )}
        </div>
      </div>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,1) 70%)',
        pointerEvents: 'none',
        borderRadius: '50%',
      }} />
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
          .dream-song:hover .flip-button-container {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default React.memo(DreamSong);
