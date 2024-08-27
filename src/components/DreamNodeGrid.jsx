import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import DreamNode from './DreamNode';
import { updatePosition } from '../utils/3DUtils';

const DreamNodeGrid = ({ scene, camera, dreamNodes, onNodeClick }) => {
  const [layout, setLayout] = useState('grid');
  const gridRef = useRef(null);
  const [centeredNode, setCenteredNode] = useState(null);
  const [isSceneReady, setIsSceneReady] = useState(false);

  useEffect(() => {
    console.log('DreamNodeGrid: scene', scene);
    console.log('DreamNodeGrid: dreamNodes', dreamNodes);

    if (scene) {
      if (!gridRef.current) {
        console.log('Creating gridObject');
        const gridObject = new THREE.Object3D();
        scene.add(gridObject);
        gridRef.current = gridObject;
      }
      setIsSceneReady(true);
    } else {
      setIsSceneReady(false);
    }

    return () => {
      if (gridRef.current && scene) {
        console.log('Removing gridObject');
        scene.remove(gridRef.current);
      }
    };
  }, [scene, dreamNodes]);

  const calculatePositions = useCallback(() => {
    if (layout === 'grid') {
      return calculateGridPositions();
    } else if (layout === 'circle') {
      return calculateCirclePositions();
    }
    return [];
  }, [layout, dreamNodes.length]);

  const calculateGridPositions = useCallback(() => {
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
  }, [dreamNodes.length]);

  const calculateCirclePositions = useCallback(() => {
    const radius = dreamNodes.length * 40;
    return dreamNodes.map((_, index) => {
      const angle = (index / dreamNodes.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      return new THREE.Vector3(x, y, z);
    });
  }, [dreamNodes.length]);

  useEffect(() => {
    if (!gridRef.current || !scene) return;

    const positions = calculatePositions();
    dreamNodes.forEach((node, index) => {
      const newPosition = positions[index];
      if (centeredNode && node.repoName === centeredNode) {
        newPosition.set(0, 0, 500); // Move centered node to front
      }
      updatePosition(gridRef.current.children[index], newPosition, 1000);
    });
  }, [dreamNodes, layout, centeredNode, calculatePositions, scene]);

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
      {isSceneReady ? (
        <>
          {dreamNodes.map((node, index) => {
            console.log(`Rendering DreamNode: ${node.repoName}`);
            return (
              <DreamNode
                key={node.repoName}
                scene={scene}
                camera={camera}
                position={calculatePositions()[index]}
                repoName={node.repoName}
                onNodeClick={handleNodeClick}
                parentRef={gridRef}
              />
            );
          })}
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <button onClick={toggleLayout}>Toggle Layout</button>
          </div>
        </>
      ) : (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading scene...
        </div>
      )}
    </>
  );
};

export default DreamNodeGrid;
