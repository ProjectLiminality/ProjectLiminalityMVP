import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useAspect } from '@react-three/drei';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';

const DreamNode3DR3F = ({ repoName, position, onNodeClick, isHovered, setHoveredNode }) => {
  const meshRef = useRef();
  const css3dRef = useRef();
  const [hovered, setHovered] = useState(false);
  const [width, height] = useAspect(300, 300);
  const { scene } = useThree();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData.repoName = repoName;
      console.log('Set userData for mesh:', meshRef.current.userData);
    }

    // Create CSS3D object
    const element = document.createElement('div');
    element.style.width = '100px';
    element.style.height = '100px';
    element.style.background = 'blue';
    element.style.opacity = '0.5';
    element.textContent = 'CSS3D Test';

    const object = new CSS3DObject(element);
    object.position.set(0, 100, 0); // Position it above the cube
    css3dRef.current = object;
    scene.add(object);

    return () => {
      scene.remove(object);
    };
  }, [repoName, scene]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
    if (css3dRef.current) {
      css3dRef.current.rotation.x += 0.01;
      css3dRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group position={position} userData={{ repoName: repoName }}>
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
      <Html transform occlude>
        <div style={{ width: `${width}px`, height: `${height}px` }}>
          <DreamTalk repoName={repoName} />
        </div>
      </Html>
    </group>
  );
};

export default DreamNode3DR3F;
