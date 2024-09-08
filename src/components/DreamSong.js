import React, { useState, useEffect } from 'react';
import { BLUE, BLACK, WHITE } from '../constants/colors';
import { readDreamSongCanvas, listMediaFiles } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';

const DreamSong = ({ repoName, onClick }) => {
  const [canvasData, setCanvasData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const canvas = await readDreamSongCanvas(repoName);
      if (canvas) {
        const processedData = processDreamSongData(canvas);
        setCanvasData(processedData);
      } else {
        console.log(`No DreamSong.canvas found for ${repoName}`);
      }

      const media = await listMediaFiles(repoName);
      setMediaFiles(media);
    };

    fetchData();
  }, [repoName]);

  const handleMediaClick = (mediaFile) => {
    onClick(repoName);
  };

  const renderMediaElement = (file) => {
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
    if (Array.isArray(node)) {
      return (
        <div key={index} style={{ display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
          {node.map((subNode, subIndex) => renderNode(subNode, `${index}-${subIndex}`))}
        </div>
      );
    } else if (node.type === 'file') {
      const mediaFile = mediaFiles.find(file => file.endsWith(node.file));
      return mediaFile ? renderMediaElement(mediaFile) : null;
    } else if (node.type === 'text') {
      return <div key={index} dangerouslySetInnerHTML={{ __html: node.text }} />;
    }
    return null;
  };

  return (
    <div className="dream-song" style={{ backgroundColor: BLACK, color: WHITE, padding: '20px' }}>
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
