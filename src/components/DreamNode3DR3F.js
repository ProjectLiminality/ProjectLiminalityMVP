import React, { useState, useEffect, useRef } from 'react';
import { Billboard, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { getRepoData } from '../utils/fileUtils';
import { BLUE, RED } from '../constants/colors';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const [hovered, setHovered] = useState(false);
  const [repoData, setRepoData] = useState({ metadata: {}, mediaContent: null });
  const nodeRef = useRef();
  const targetPosition = useRef(position);

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

  useEffect(() => {
    targetPosition.current = position;
  }, [position]);

  useFrame(() => {
    if (nodeRef.current) {
      gsap.to(nodeRef.current.position, {
        x: targetPosition.current.x,
        y: targetPosition.current.y,
        z: targetPosition.current.z,
        duration: 2,
        ease: "power2.inOut"
      });
    }
  });

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
      ref={nodeRef}
      follow={false}
      scale={20}
    >
      <Html
        transform
        position={[0, 0, 0.01]}
        style={{
          width: '300px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <DreamTalk 
          repoName={repoName}
          mediaContent={repoData.mediaContent}
          metadata={repoData.metadata}
          onClick={handleClick}
          isHovered={hovered}
          borderColor={borderColor}
        />
      </Html>
      <Html
        transform
        position={[0, 0, -0.01]}
        rotation={[0, Math.PI, 0]}
        style={{
          width: '300px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <DreamSong 
          repoName={repoName}
          metadata={repoData.metadata}
          onClick={handleClick}
          isHovered={hovered}
          borderColor={borderColor}
        />
      </Html>
    </Billboard>
  );
};

export default DreamNode3DR3F;
