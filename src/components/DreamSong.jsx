import React, { useState, useEffect } from 'react';
import { BLUE, BLACK, WHITE } from '../constants/colors';
import { readDreamSongCanvas, listMediaFiles } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';

const DreamSong = ({ repoName, onClick, onRightClick }) => {
  const [canvasData, setCanvasData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log(`Fetching data for repo: ${repoName}`);
      
      // Fetch and log DreamSong canvas data
      const canvas = await readDreamSongCanvas(repoName);
      console.log('Raw DreamSong canvas data:', canvas);
      
      if (canvas) {
        console.log('DreamSong canvas data fetched successfully');
        const processedData = processDreamSongData(canvas);
        console.log('Processed canvas data:', processedData);
        setCanvasData(processedData);
      } else {
        console.log('No DreamSong canvas data found');
      }

      // Fetch and log media files
      const media = await listMediaFiles(repoName);
      console.log('Media files fetched:', media);
      setMediaFiles(media);
    };

    fetchData();
  }, [repoName]);

  const handleMediaClick = (mediaFile) => {
    console.log(`Media clicked: ${mediaFile}`);
    onClick(repoName);
  };

  const renderMediaElement = (file) => {
    console.log(`Rendering media element for file: ${file}`);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(file);
    if (isVideo) {
      return (
        <video
          src={`file://${file}`}
          style={{ maxWidth: '100%', height: 'auto' }}
          controls
          onClick={() => handleMediaClick(file)}
        />
      );
    } else {
      return (
        <img
          src={`file://${file}`}
          alt={file}
          style={{ maxWidth: '100%', height: 'auto' }}
          onClick={() => handleMediaClick(file)}
        />
      );
    }
  };

  const renderNode = (node, index) => {
    console.log(`Rendering node:`, node);
    if (Array.isArray(node)) {
      return (
        <div key={index} style={{ display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
          {node.map((subNode, subIndex) => renderNode(subNode, `${index}-${subIndex}`))}
        </div>
      );
    } else if (node.type === 'file') {
      const mediaFile = mediaFiles.find(file => file.endsWith(node.file));
      console.log(`Media file for node:`, mediaFile);
      return mediaFile ? renderMediaElement(mediaFile) : null;
    } else if (node.type === 'text') {
      return <div key={index} dangerouslySetInnerHTML={{ __html: node.text }} />;
    }
    return null;
  };

  return (
    <div 
      className="dream-song" 
      style={{ backgroundColor: BLACK, color: WHITE, padding: '20px' }}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onRightClick(e);
      }}
    >
      <h2>{repoName}</h2>
      {canvasData ? (
        canvasData.map((node, index) => renderNode(node, index))
      ) : (
        <p>No DreamSong data available</p>
      )}
    </div>
  );
};

export default React.memo(DreamSong);
