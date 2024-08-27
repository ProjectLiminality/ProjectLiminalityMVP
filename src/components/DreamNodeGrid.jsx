import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import DreamNode from './DreamNode';
import { updatePosition } from '../utils/3DUtils';

const DreamNodeGrid = ({ scene, dreamNodes, onNodeClick }) => {
  const [layout, setLayout] = useState('grid');
  const gridRef = useRef(null);

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
  }, [dreamNodes, layout]);

  const updateLayout = () => {
    const positions = calculatePositions();
    dreamNodes.forEach((node, index) => {
      const newPosition = positions[index];
      updatePosition(node.object, newPosition, 1000);
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
  };

  return (
    <>
      {dreamNodes.map((node, index) => (
        <DreamNode
          key={node.repoName}
          scene={scene}
          initialPosition={calculatePositions()[index]}
          repoName={node.repoName}
          onNodeClick={onNodeClick}
        />
      ))}
      <button onClick={toggleLayout}>Toggle Layout</button>
    </>
  );
};

export default DreamNodeGrid;
