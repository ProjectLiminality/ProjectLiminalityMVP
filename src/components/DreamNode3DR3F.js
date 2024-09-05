import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { getRepoData } from '../utils/fileUtils';
import { BLUE, RED } from '../constants/colors';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const groupRef = useRef();
  const frontPlaneRef = useRef();
  const backPlaneRef = useRef();
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
    <group ref={groupRef} position={position} userData={{ repoName: repoName }}>
      <mesh
        ref={frontPlaneRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        renderOrder={1}
      >
        <circleGeometry args={[37.5, 32]} />
        <meshBasicMaterial color="red" opacity={0.5} transparent visible={true} />
      </mesh>
      <mesh
        ref={backPlaneRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        rotation={[0, Math.PI, 0]}
        renderOrder={1}
      >
        <circleGeometry args={[37.5, 32]} />
        <meshBasicMaterial color="blue" opacity={0.5} transparent visible={true} />
      </mesh>
      <Html
        transform
        position={[0, 0, 0.1]}
        scale={20}
        style={{
          width: '300px',
          height: '300px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
            <DreamTalk 
              repoName={repoName}
              mediaContent={repoData.mediaContent}
              metadata={repoData.metadata}
              onClick={() => onNodeClick(repoName)}
              isHovered={hovered}
              borderColor={borderColor}
            />
          </div>
        </div>
      </Html>
      <Html
        transform
        position={[0, 0, 0]}
        rotation={[0, Math.PI, 0]}
        scale={20}
        style={{
          width: '300px',
          height: '300px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}>
          <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
            <DreamSong 
              repoName={repoName}
              metadata={repoData.metadata}
              onClick={() => onNodeClick(repoName)}
              isHovered={hovered}
              borderColor={borderColor}
            />
          </div>
        </div>
      </Html>
    </group>
  );
};

export default DreamNode3DR3F;
