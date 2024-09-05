import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useAspect } from '@react-three/drei';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const meshRef = useRef();
  const css3DRef = useRef();
  const [hovered, setHovered] = useState(false);
  const { scene } = useThree();
  const [width, height] = useAspect(300, 300);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useEffect(() => {
    const dreamTalkElement = document.createElement('div');
    dreamTalkElement.style.width = '300px';
    dreamTalkElement.style.height = '300px';
    
    const css3DObject = new CSS3DObject(dreamTalkElement);
    css3DObject.position.copy(position);
    scene.add(css3DObject);
    css3DRef.current = css3DObject;

    return () => {
      scene.remove(css3DObject);
    };
  }, [position, scene]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onNodeClick(repoName)}
      >
        <boxGeometry args={[50, 50, 50]} />
        <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
      </mesh>
      <Html transform occlude>
        <div style={{ width: `${width}px`, height: `${height}px` }}>
          <DreamTalk repoName={repoName} />
        </div>
      </Html>
    </group>
  );
};

export default DreamNode3DR3F;
