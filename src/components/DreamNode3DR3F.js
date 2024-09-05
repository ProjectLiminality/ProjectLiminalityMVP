import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import DreamTalk from './DreamTalk';
import { getRepoData } from '../utils/fileUtils';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const groupRef = useRef();
  const meshRef = useRef();
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

  return (
    <group ref={groupRef} position={position} userData={{ repoName: repoName }}>
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          setHoveredNode(repoName);
        }}
        onPointerOut={() => {
          setHovered(false);
          setHoveredNode(null);
        }}
        onClick={() => onNodeClick(repoName)}
      >
        <boxGeometry args={[50, 50, 50]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Html
        transform
        occlude
        position={[0, 0, 50]}
        style={{
          width: '300px',
          height: '300px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '10px' }}>
          <DreamTalk 
            repoName={repoName}
            mediaContent={repoData.mediaContent}
            metadata={repoData.metadata}
            onClick={() => onNodeClick(repoName)}
            isHovered={hovered}
            borderColor={hovered ? 'hotpink' : 'orange'}
          />
        </div>
      </Html>
    </group>
  );
};

export default DreamNode3DR3F;
