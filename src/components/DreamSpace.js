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

  useEffect(() => {
    console.log('Initializing sceneState');
    if (!refContainer.current) {
      console.log('Container ref is not available yet');
      return;
    }

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
      camera.position.z = 1000;

      const cssRenderer = new CSS3DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0';
      refContainer.current.appendChild(cssRenderer.domElement);

      const controls = new OrbitControls(camera, cssRenderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.25;
      controls.enableZoom = true;

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      console.log('sceneState initialized successfully');

      setSceneState({
        scene,
        camera,
        cssRenderer,
        controls,
        cleanup: () => {
          window.removeEventListener('resize', handleResize);
          cssRenderer.domElement.parentNode.removeChild(cssRenderer.domElement);
          controls.dispose();
        }
      });
    } catch (error) {
      const errorMessage = 'Error initializing scene: ' + error.message;
      console.error(errorMessage);
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    console.log('sceneState effect triggered. sceneState:', !!sceneState);
  }, [sceneState]);

  useEffect(() => {
    console.log('Fetch DreamNode effect triggered. sceneState:', !!sceneState);
    if (sceneState) {
      const fetchFirstDreamNode = async () => {
        try {
          console.log('Scanning DreamVault...');
          const repos = await scanDreamVault();
          console.log('Repos found:', repos);
          if (repos.length > 0) {
            console.log('Setting DreamNode:', repos[0]);
            const newNode = { repoName: repos[0] };
            setDreamNodes([newNode]);
          } else {
            console.error('No repositories found in the DreamVault');
            setError('No repositories found in the DreamVault');
          }
        } catch (error) {
          console.error('Error scanning dream vault:', error);
          setError('Error scanning dream vault: ' + error.message);
        }
      };

      fetchFirstDreamNode();
    }
  }, [sceneState]);

  useEffect(() => {
    return () => {
      if (sceneState) {
        console.log('Cleaning up sceneState');
        sceneState.cleanup();
      }
    };
  }, [sceneState]);

  const dreamNodeRef = useRef(null);

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

  const [hoveredNode, setHoveredNode] = useState(null);

  const checkIntersection = useCallback((isClick = false) => {
    if (!sceneState || !dreamNodeRef.current || dreamNodes.length === 0) return;

    raycaster.current.setFromCamera(mouse.current, sceneState.camera);
    const intersects = raycaster.current.intersectObjects([
      dreamNodeRef.current.getFrontPlane(),
      dreamNodeRef.current.getBackPlane()
    ], true);

    if (intersects.length > 0) {
      const intersectedPlane = intersects[0].object;
      const isFrontSide = intersectedPlane === dreamNodeRef.current.getFrontPlane();
      const currentNode = dreamNodes[0];

      if (isClick) {
        // Handle click event
        console.log('Clicked on node:', currentNode.repoName, 'Side:', isFrontSide ? 'front' : 'back');
        dreamNodeRef.current.updateRotation(
          new THREE.Euler(0, isFrontSide ? Math.PI : 0, 0),
          1000
        );
      } else {
        // Handle hover event
        if (hoveredNode !== currentNode.repoName) {
          console.log('Mouse entered node:', currentNode.repoName, 'Side:', isFrontSide ? 'front' : 'back');
          setHoveredNode(currentNode.repoName);
        }
      }
    } else {
      if (hoveredNode !== null) {
        console.log('Mouse left node:', hoveredNode);
        setHoveredNode(null);
      }
    }
  }, [sceneState, hoveredNode, dreamNodes]);

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
