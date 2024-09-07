import React, { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { scanDreamVault } from '../services/electronService';
import DreamNode3DR3F from './DreamNode3DR3F';
import DreamGraph from './DreamGraph';
import CameraController from './CameraController';
import IntersectionChecker from './IntersectionChecker';
import useDreamNodes from '../hooks/useDreamNodes';

const DreamSpace = () => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const { dreamNodes, setDreamNodes, error } = useDreamNodes();

  const updateNodePositions = useCallback((clickedNodeIndex) => {
    setDreamNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      return prevNodes.map(node => ({
        ...node,
        position: clickedNode.position.clone()
      }));
    });
  }, [setDreamNodes]);

  const handleNodeClick = useCallback((repoName) => {
    const clickedNodeIndex = dreamNodes.findIndex(node => node.repoName === repoName);
    if (clickedNodeIndex !== -1) {
      updateNodePositions(clickedNodeIndex);
    }
    console.log('Node clicked:', repoName);
  }, [dreamNodes, updateNodePositions]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 1000], fov: 75, near: 0.1, far: 3000 }}>
        <CameraController />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {dreamNodes.map((node, index) => (
          <DreamNode3DR3F
            key={node.repoName}
            repoName={node.repoName}
            position={node.position}
            onNodeClick={handleNodeClick}
            isHovered={hoveredNode === node.repoName}
            setHoveredNode={setHoveredNode}
            index={index}
          />
        ))}
        <IntersectionChecker
          dreamNodes={dreamNodes}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
        <axesHelper args={[5]} />
      </Canvas>
      {dreamNodes.length === 0 && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
      <DreamGraph dreamNodes={dreamNodes} updateNodePositions={updateNodePositions} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: 'white' }}>
        Node count: {dreamNodes.length}
      </div>
    </div>
  );
};

export default DreamSpace;
