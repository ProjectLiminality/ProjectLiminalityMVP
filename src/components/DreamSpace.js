import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raycaster, Vector2 } from 'three';
import { scanDreamVault } from '../services/electronService';
import DreamNode from './DreamNode';
import DreamNode3D from './DreamNode3D';
import { createRoot } from 'react-dom/client';

const DreamSpace = () => {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);
  const [sceneState, setSceneState] = useState(null);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());

  // ... (keep the existing code)

  useEffect(() => {
    if (sceneState && dreamNodes.length > 0) {
      console.log('Rendering DreamNode in DreamSpace');
      const { scene } = sceneState;
      // Clear existing nodes
      scene.children = scene.children.filter(child => !(child instanceof DreamNode3D));
      console.log('Cleared existing nodes. Scene children count:', scene.children.length);
      
      // Add the single DreamNode
      const dreamNode = dreamNodes[0];
      const nodeElement = document.createElement('div');
      nodeElement.style.width = '300px';
      nodeElement.style.height = '300px';
      
      const root = createRoot(nodeElement);
      root.render(
        <DreamNode 
          ref={dreamNodeRef}
          repoName={dreamNode.repoName} 
          initialPosition={new THREE.Vector3(0, 0, 0)}
          cssScene={scene}
          onNodeClick={(repoName) => console.log('Node clicked:', repoName)}
          isHovered={hoveredNode === dreamNode.repoName}
        />
      );

      // Use a MutationObserver to detect when the DreamNode has been added to the DOM
      const observer = new MutationObserver(() => {
        console.log('DreamNode rendered to nodeElement');
        if (dreamNodeRef.current && dreamNodeRef.current.object) {
          scene.add(dreamNodeRef.current.object);
          console.log('Added DreamNode to scene. Scene children count:', scene.children.length);
        } else {
          console.log('Failed to add DreamNode to scene. dreamNodeRef.current:', dreamNodeRef.current);
        }
        observer.disconnect();
      });

      observer.observe(nodeElement, { childList: true, subtree: true });
    } else {
      console.log('Not rendering DreamNode. sceneState:', !!sceneState, 'dreamNodes length:', dreamNodes.length);
    }
  }, [sceneState, dreamNodes]);

  // ... (keep the existing code)

  useEffect(() => {
    if (sceneState) {
      const { scene, camera, cssRenderer, controls } = sceneState;

      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        cssRenderer.render(scene, camera);
      };

      animate();

      const onMouseMove = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        checkIntersection();
      };

      const onClick = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        checkIntersection(true);
      };

      const onKeyDown = (event) => {
        if (event.metaKey) {
          switch (event.key) {
            case '1':
              if (dreamNodeRef.current) {
                const currentPosition = dreamNodeRef.current.object.position;
                dreamNodeRef.current.updatePosition(
                  new THREE.Vector3(currentPosition.x + 50, currentPosition.y + 50, currentPosition.z + 50),
                  1
                );
              }
              break;
            case '2':
              if (dreamNodeRef.current) {
                const currentScale = dreamNodeRef.current.object.scale;
                dreamNodeRef.current.updateScale(
                  new THREE.Vector3(currentScale.x * 2, currentScale.y * 2, currentScale.z * 2),
                  0.3
                );
              }
              break;
            case '3':
              if (dreamNodeRef.current) {
                const currentRotation = dreamNodeRef.current.object.rotation;
                dreamNodeRef.current.updateRotation(
                  new THREE.Euler(currentRotation.x, currentRotation.y + Math.PI / 2, currentRotation.z),
                  1
                );
              }
              break;
          }
        }
      };

      cssRenderer.domElement.addEventListener('mousemove', onMouseMove);
      cssRenderer.domElement.addEventListener('click', onClick);
      window.addEventListener('keydown', onKeyDown);

      return () => {
        cssRenderer.domElement.removeEventListener('mousemove', onMouseMove);
        cssRenderer.domElement.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKeyDown);
      };
    }
  }, [sceneState, checkIntersection]);

  // ... (keep the existing code)

  return (
    <div ref={refContainer}>
      {(!sceneState || dreamNodes.length === 0) && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default DreamSpace;
