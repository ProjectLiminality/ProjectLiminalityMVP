import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import DreamTalk from './DreamTalk';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

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
          width: '2000px',
          height: '2000px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 255, 0.5)', padding: '10px' }}>
          <DreamTalk repoName={repoName} />
        </div>
      </Html>
    </group>
  );
};

export default DreamNode3DR3F;
