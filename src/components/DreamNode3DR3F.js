import React, { useState, useEffect } from 'react';
import { Billboard, Html } from '@react-three/drei';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { getRepoData } from '../utils/fileUtils';
import { BLUE, RED } from '../constants/colors';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const [hovered, setHovered] = useState(false);
  const [repoData, setRepoData] = useState({ metadata: {}, mediaContent: null });

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        const data = await getRepoData(repoName);
        console.log('Fetched repo data:', data);
        setRepoData(data);
      } catch (error) {
        console.error('Error fetching repo data:', error);
        setRepoData({ metadata: {}, mediaContent: null });
      }
    };
    fetchRepoData();
  }, [repoName]);

  const borderColor = repoData.metadata?.type === 'person' ? RED : BLUE;

  const handlePointerOver = () => {
    setHovered(true);
    setHoveredNode(repoName);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredNode(null);
  };

  const handleClick = () => onNodeClick(repoName);

  return (
    <Billboard
      position={position}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
    >
      <Html
        transform
        distanceFactor={20}
        style={{
          width: '300px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
            <DreamTalk 
              repoName={repoName}
              mediaContent={repoData.mediaContent}
              metadata={repoData.metadata}
              onClick={handleClick}
              isHovered={hovered}
              borderColor={borderColor}
            />
          </div>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <DreamSong 
              repoName={repoName}
              metadata={repoData.metadata}
              onClick={handleClick}
              isHovered={hovered}
              borderColor={borderColor}
            />
          </div>
        </div>
      </Html>
    </Billboard>
  );
};

export default DreamNode3DR3F;
