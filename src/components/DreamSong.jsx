import React, { useState, useEffect, useCallback } from 'react';
import { BLACK, WHITE, BLUE, RED } from '../constants/colors';
import { readDreamSongCanvas, listFiles } from '../utils/fileUtils';
import { processDreamSongData } from '../utils/dreamSongUtils';
import FileContextMenu from './FileContextMenu';
import DreamContent from './DreamContent';

const DreamSong = ({ repoName, dreamSongMedia, onClick, onRightClick, onFileRightClick, onMouseEnter, onMouseLeave, borderColor, onFlip, directoryStructureData }) => {
  const [processedNodes, setProcessedNodes] = useState([]);
  const [files, setFiles] = useState([]);
  const [showDreamSong, setShowDreamSong] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [circlePackingData, setCirclePackingData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const canvasData = await readDreamSongCanvas(repoName);
      const fileList = await listFiles(repoName);
      setFiles(fileList);
      
      if (canvasData) {
        const processed = processDreamSongData(canvasData);
        setProcessedNodes(processed);
      } else {
        setProcessedNodes([]);
        setShowDreamSong(false);
      }
    };

    fetchData();
  }, [repoName]);

  useEffect(() => {
    // Prepare data for circle packing
    const prepareCirclePackingData = (structure) => {
      const processNode = (node, name) => {
        if (typeof node === 'object') {
          return {
            name: name,
            children: Object.entries(node).map(([key, value]) => processNode(value, key)),
            isFolder: true
          };
        } else {
          return { name: name, value: 1, isFolder: false };
        }
      };

      return processNode(structure, "root");
    };

    if (directoryStructureData) {
      setCirclePackingData(prepareCirclePackingData(directoryStructureData));
    }
  }, [directoryStructureData]);

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

  const handleNodeInteraction = useCallback((interaction) => {
    const { type, node, event } = interaction;
    console.log("DreamSong: handleNodeInteraction called", { type, node });
    
    switch (type) {
      case 'click':
        if (event.metaKey || event.ctrlKey) {
          console.log("DreamSong: Multi-select not implemented yet");
          // Toggle selection (to be implemented in future phases)
        } else {
          console.log(`DreamSong: Clicked on ${node.children ? 'folder' : 'file'}: ${node.name}`);
          if (node.children) {
            console.log("DreamSong: This is a folder, implement folder opening logic here");
          } else {
            console.log("DreamSong: Attempting to open file", repoName, node.name);
            if (window.electron && window.electron.fileSystem) {
              window.electron.fileSystem.openFile(repoName, node.name)
                .then(() => console.log("DreamSong: File opened successfully"))
                .catch(error => console.error("DreamSong: Error opening file", error));
            } else {
              console.error("DreamSong: window.electron.fileSystem is not available");
            }
          }
        }
        break;
      case 'mouseover':
        console.log(`DreamSong: Mouse over ${node.children ? 'folder' : 'file'}: ${node.name}`);
        // Implement hover effect or tooltip here
        break;
      case 'mouseout':
        console.log(`DreamSong: Mouse out ${node.children ? 'folder' : 'file'}: ${node.name}`);
        // Remove hover effect or hide tooltip here
        break;
      // Future cases: 'rightClick', 'select', 'deselect', etc.
    }
  }, [repoName]);

  useEffect(() => {
    console.log("DreamSong: Component mounted");
    return () => {
      console.log("DreamSong: Component unmounted");
    };
  }, []);

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

  const toggleView = () => {
    setShowDreamSong(!showDreamSong);
  };

  const handleFileRightClick = useCallback((event, file) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('Right-click detected on file:', file);
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      file: file
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

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
      onClick={(e) => {
        // Only handle the click if it's directly on the DreamSong div
        if (e.target === e.currentTarget) {
          console.log("DreamSong: Clicked");
          e.stopPropagation();
          onClick(e);
        }
      }}
      onContextMenu={(e) => {
        console.log("DreamSong: Right-clicked");
        e.preventDefault();
        e.stopPropagation();
        onRightClick(e);
      }}
      onMouseEnter={(e) => {
        console.log("DreamSong: Mouse enter");
        onMouseEnter(e);
      }}
      onMouseLeave={(e) => {
        console.log("DreamSong: Mouse leave");
        onMouseLeave(e);
      }}
    >
      <div
        className="dream-song-content"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
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
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {showDreamSong && processedNodes.length > 0 ? (
            <div style={{ width: '100%', maxWidth: '800px', overflowY: 'auto', maxHeight: '100%' }}>
              {processedNodes.map((node, index) => renderNode(node, index))}
            </div>
          ) : circlePackingData ? (
            <div style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <DreamContent
                data={circlePackingData}
                onNodeInteraction={handleNodeInteraction}
              />
            </div>
          ) : (
            <p>Loading...</p>
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
      {processedNodes.length > 0 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleView();
            }}
            style={{
              position: 'absolute',
              left: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.5)',
              color: WHITE,
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            &#8249;
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleView();
            }}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(0, 0, 0, 0.5)',
              color: WHITE,
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            &#8250;
          </button>
        </>
      )}
      <style>
        {`
          .dream-song:hover .flip-button-container {
            opacity: 1;
          }
        `}
      </style>
      {contextMenu && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={contextMenu.file}
          repoName={repoName}
          onClose={handleCloseContextMenu}
          onProcessFile={onFileRightClick}
        />
      )}
    </div>
  );
};

export default React.memo(DreamSong);
