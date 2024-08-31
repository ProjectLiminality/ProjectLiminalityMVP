import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamNode from './DreamNode';
import { updatePosition } from '../utils/3DUtils';

const DreamNodeGrid = React.memo(({ scene, cssScene, camera, dreamNodes: initialDreamNodes, onNodeClick, renderer, cssRenderer }) => {
  const [layout, setLayout] = useState('grid');
  const gridRef = useRef(null);
  const [centeredNode, setCenteredNode] = useState(null);
  const [dreamNodes, setDreamNodes] = useState([]);

  const calculateGridPositions = useCallback(() => {
    const gridSize = Math.ceil(Math.sqrt(dreamNodes.length));
    const spacing = 500;
    return dreamNodes.map((_, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const x = (col - gridSize / 2 + 0.5) * spacing;
      const y = (gridSize / 2 - row - 0.5) * spacing;
      const z = 0;
      return new THREE.Vector3(x, y, z);
    });
  }, [dreamNodes]);

  const calculateCirclePositions = useCallback(() => {
    const radius = dreamNodes.length * 80;
    return dreamNodes.map((_, index) => {
      const angle = (index / dreamNodes.length) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;
      return new THREE.Vector3(x, y, z);
    });
  }, [dreamNodes]);

  const calculatePositions = useCallback(() => {
    return layout === 'grid' ? calculateGridPositions() : calculateCirclePositions();
  }, [layout, calculateGridPositions, calculateCirclePositions]);

  useEffect(() => {
    if (scene && cssScene) {
      if (!gridRef.current) {
        const gridObject = new THREE.Object3D();
        scene.add(gridObject);
        gridRef.current = gridObject;
      }
      const newDreamNodes = initialDreamNodes.map(node => ({
        ...node,
        object: new THREE.Object3D(),
        cssObject: new CSS3DObject(document.createElement('div'))
      }));
      setDreamNodes(newDreamNodes);

      newDreamNodes.forEach(node => {
        gridRef.current.add(node.object);
        cssScene.add(node.cssObject);
      });

      return () => {
        newDreamNodes.forEach(node => {
          gridRef.current.remove(node.object);
          cssScene.remove(node.cssObject);
        });
        scene.remove(gridRef.current);
      };
    }
  }, [scene, cssScene, initialDreamNodes]);

  useEffect(() => {
    if (!gridRef.current || !scene || !cssScene) return;

    const positions = calculatePositions();
    dreamNodes.forEach((node, index) => {
      const newPosition = positions[index].clone();
      if (centeredNode && node.repoName === centeredNode) {
        newPosition.set(0, 0, 500);
      }
      updatePosition(node.object, newPosition, 1000);
      updatePosition(node.cssObject, newPosition, 1000);
    });

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
      cssRenderer.render(cssScene, camera);
    };
    animate();

    return () => {
      renderer.setAnimationLoop(null);
    };
  }, [dreamNodes, layout, centeredNode, calculatePositions, scene, cssScene, camera, renderer, cssRenderer]);

  const toggleLayout = () => {
    setLayout(prevLayout => prevLayout === 'grid' ? 'circle' : 'grid');
    setCenteredNode(null);
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
          scene={scene}
          camera={camera}
          position={calculatePositions()[index]}
          repoName={node.repoName}
          onNodeClick={handleNodeClick}
          parentRef={gridRef}
          object={node.object}
        />
      ))}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
        <button onClick={toggleLayout}>Toggle Layout</button>
      </div>
    </>
  );
});

export default DreamNodeGrid;
