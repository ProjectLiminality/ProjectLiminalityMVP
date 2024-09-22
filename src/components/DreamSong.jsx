import React, { useState, useEffect } from 'react';
import { BLUE, BLACK, WHITE } from '../constants/colors';
import { readDreamSongCanvas, listMediaFiles } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';

const DreamSong = ({ repoName, dreamSongMedia, onClick, onRightClick }) => {
  const [processedMedia, setProcessedMedia] = useState([]);

  useEffect(() => {
    if (dreamSongMedia) {
      const processed = processDreamSongData(dreamSongMedia);
      setProcessedMedia(processed);
    }
  }, [dreamSongMedia]);

  const handleMediaClick = (mediaFile) => {
    onClick(repoName);
  };

  const renderMediaElement = (file, index) => {
    const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
    if (isVideo) {
      return (
        <video
          key={`video-${index}`}
          src={`file://${file}`}
          style={{ maxWidth: '100%', height: 'auto' }}
          controls
          onClick={() => handleMediaClick(file)}
        />
      );
    } else {
      return (
        <img
          key={`img-${index}`}
          src={`file://${file}`}
          alt={file}
          style={{ maxWidth: '100%', height: 'auto' }}
          onClick={() => handleMediaClick(file)}
        />
      );
    }
  };

  const renderNode = (node, index) => {
    if (Array.isArray(node)) {
      return (
        <div key={`array-${index}`} style={{ display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
          {node.map((subNode, subIndex) => renderNode(subNode, `${index}-${subIndex}`))}
        </div>
      );
    } else if (node.type === 'file') {
      const mediaFile = mediaFiles.find(file => file.endsWith(node.file));
      return mediaFile ? renderMediaElement(mediaFile, `file-${index}`) : null;
    } else if (node.type === 'text') {
      return <div key={`text-${index}`} dangerouslySetInnerHTML={{ __html: node.text }} />;
    }
    return null;
  };

  return (
    <div 
      className="dream-song" 
      style={{ 
        backgroundColor: BLACK, 
        color: WHITE, 
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(e);
      }}
    >
      <h2>{repoName}</h2>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {canvasData ? (
          canvasData.map((node, index) => renderNode(node, index))
        ) : (
          <p>No DreamSong data available</p>
        )}
      </div>
    </div>
  );
};

export default React.memo(DreamSong);
