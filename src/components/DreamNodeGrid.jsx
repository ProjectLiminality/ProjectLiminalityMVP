import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import DreamNode from './DreamNode';
import { updatePosition } from '../utils/3DUtils';

const DreamNodeGrid = ({ sceneState, dreamNodes, onNodeClick }) => {
  const [layout, setLayout] = useState('grid');
  const gridRef = useRef(null);
  const [centeredNode, setCenteredNode] = useState(null);
  const { scene } = sceneState;

  useEffect(() => {
    if (scene) {
      const gridObject = new THREE.Object3D();
      scene.add(gridObject);
      gridRef.current = gridObject;

      return () => {
        scene.remove(gridObject);
      };
    }
  }, [scene]);

  useEffect(() => {
    if (gridRef.current) {
      updateLayout();
    }
  }, [dreamNodes, layout, centeredNode]);

  const updateLayout = () => {
    const positions = calculatePositions();
    dreamNodes.forEach((node, index) => {
      const newPosition = positions[index];
      if (centeredNode && node.repoName === centeredNode) {
        newPosition.set(0, 0, 500); // Move centered node to front
      }
      if (node.object) {
        updatePosition(node.object, newPosition, 1000);
      }
    });
  };

  const calculatePositions = () => {
    if (layout === 'grid') {
      return calculateGridPositions();
    } else if (layout === 'circle') {
      return calculateCirclePositions();
    }
    return [];
  };

  const calculateGridPositions = () => {
    const gridSize = Math.ceil(Math.sqrt(dreamNodes.length));
    const spacing = 250;
    return dreamNodes.map((_, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = (col - gridSize / 2 + 0.5) * spacing;
      const y = (gridSize / 2 - row - 0.5) * spacing;
      const z = 0;
      return new THREE.Vector3(x, y, z);
    });
  };

  const calculateCirclePositions = () => {
    const radius = dreamNodes.length * 40;
    return dreamNodes.map((_, index) => {
      const angle = (index / dreamNodes.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      return new THREE.Vector3(x, y, z);
    });
  };

  const toggleLayout = () => {
    setLayout(prevLayout => prevLayout === 'grid' ? 'circle' : 'grid');
    setCenteredNode(null); // Reset centered node when changing layout
  };

  const handleNodeClick = (repoName) => {
    setCenteredNode(repoName === centeredNode ? null : repoName);
    onNodeClick(repoName);
  };

  return (
    <>
      {dreamNodes.map((node, index) => (
        <DreamNode
          key={node.repoName}
          sceneState={sceneState}
          initialPosition={calculatePositions()[index]}
          repoName={node.repoName}
          onNodeClick={handleNodeClick}
        />
      ))}
      <button onClick={toggleLayout}>Toggle Layout</button>
    </>
  );
};

export default DreamNodeGrid;
