import React from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import DreamGraph from './DreamGraph';
import CameraController from './CameraController';
import IntersectionChecker from './IntersectionChecker';
import useDreamNodes from '../hooks/useDreamNodes';

const DreamSpace = ({ onOpenMetadataPanel, onNodeRightClick }) => {
  const { dreamNodes, error } = useDreamNodes();

  const initialNodes = dreamNodes.map(node => ({
    ...node,
    position: new THREE.Vector3(0, 0, 0) // Set initial position to origin
  }));

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 50], fov: 75, near: 0.1, far: 3000 }}>
        <CameraController />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <DreamGraph 
          initialNodes={initialNodes} 
          onOpenMetadataPanel={onOpenMetadataPanel}
          onNodeRightClick={onNodeRightClick}
        />
        <IntersectionChecker />
        <axesHelper args={[5]} />
      </Canvas>
      {dreamNodes.length === 0 && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: 'white' }}>
        Node count: {dreamNodes.length}
      </div>
    </div>
  );
};

export default DreamSpace;
