import React, { useState, useEffect } from 'react';
import { BLUE, BLACK, WHITE } from '../constants/colors';
import { readDreamSongCanvas, listMediaFiles } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';

const DreamSong = ({ repoName, onClick }) => {
  const [canvasData, setCanvasData] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching DreamSong data for ${repoName}`);
        const canvas = await readDreamSongCanvas(repoName);
        console.log('Canvas data:', canvas);
        
        const processedData = processDreamSongData(canvas);
        console.log('Processed canvas data:', processedData);
        setCanvasData(processedData);

        const media = await listMediaFiles(repoName);
        console.log('Media files for DreamSong:', media);
        setMediaFiles(media);
      } catch (error) {
        console.error('Error fetching DreamSong data:', error);
        setError(error.message);
      }
    };

    fetchData();
  }, [repoName]);

  const handleMediaClick = (mediaFile) => {
    console.log('Media clicked:', mediaFile);
    onClick(repoName);
  };

  const renderMediaElement = (file) => {
    console.log('Rendering media element:', file);
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
    console.log('Rendering node:', node);
    if (Array.isArray(node)) {
      return (
        <div key={index} style={{ display: 'flex', flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
          {node.map((subNode, subIndex) => renderNode(subNode, `${index}-${subIndex}`))}
        </div>
      );
    } else if (node.type === 'file') {
      const mediaFile = mediaFiles.find(file => file.endsWith(node.file));
      console.log('Media file found:', mediaFile);
      return mediaFile ? renderMediaElement(mediaFile) : null;
    } else if (node.type === 'text') {
      return <div key={index} dangerouslySetInnerHTML={{ __html: node.text }} />;
    }
    return null;
  };

  if (error) {
    return (
      <div className="dream-song" style={{ backgroundColor: BLACK, color: WHITE, padding: '20px' }}>
        <h2>{repoName}</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="dream-song" style={{ backgroundColor: BLACK, color: WHITE, padding: '20px' }}>
      <h2>{repoName}</h2>
      {canvasData ? (
        canvasData.map((node, index) => renderNode(node, index))
      ) : (
        <p>Loading DreamSong data...</p>
      )}
      {mediaFiles.length > 0 && (
        <div>
          <h3>Debug: First Media File</h3>
          {renderMediaElement(mediaFiles[0])}
        </div>
      )}
    </div>
  );
};

export default React.memo(DreamSong);
