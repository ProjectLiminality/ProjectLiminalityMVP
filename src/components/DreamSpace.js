import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { scanDreamVault } from '../services/electronService';
import DreamNode from './DreamNode';
import { createRoot } from 'react-dom/client';
import { Raycaster, Vector2 } from 'three';

const DreamSpace = () => {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);
  const [sceneState, setSceneState] = useState(null);
  const raycaster = useRef(new Raycaster());
  const mouse = useRef(new Vector2());
  const interactionPlanes = useRef([]);

  useEffect(() => {
    console.log('Initializing sceneState');
    if (!refContainer.current) {
      console.log('Container ref is not available yet');
      return;
    }

    if (!WebGL.isWebGLAvailable()) {
      const errorMessage = 'WebGL is not available: ' + WebGL.getWebGLErrorMessage();
      console.error(errorMessage);
      setError(errorMessage);
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
      const createInteractionPlane = (position) => {
        const planeGeometry = new THREE.PlaneGeometry(200, 200);
        const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.copy(position);
        scene.add(plane);
        return plane;
      };

      setSceneState({
        scene,
        camera,
        cssRenderer,
        controls,
        createInteractionPlane,
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
            const plane = sceneState.createInteractionPlane(new THREE.Vector3(0, 0, 0));
            interactionPlanes.current.push({ node: newNode, plane });
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
      scene.children = scene.children.filter(child => !(child instanceof CSS3DObject));
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
        if (dreamNodeRef.current && dreamNodeRef.current.frontObject && dreamNodeRef.current.backObject) {
          scene.add(dreamNodeRef.current.frontObject);
          scene.add(dreamNodeRef.current.backObject);
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

      const onClick = () => {
        checkIntersection(true);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('click', onClick);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onClick);
      };
    }
  }, [sceneState]);

  const [hoveredNode, setHoveredNode] = useState(null);

  const checkIntersection = useCallback((isClick = false) => {
    if (!sceneState) return;

    raycaster.current.setFromCamera(mouse.current, sceneState.camera);
    const intersects = raycaster.current.intersectObjects(interactionPlanes.current.map(ip => ip.plane));

    if (intersects.length > 0) {
      const intersectedPlane = intersects[0].object;
      const intersectedNode = interactionPlanes.current.find(ip => ip.plane === intersectedPlane)?.node;

      if (intersectedNode) {
        if (isClick) {
          // Handle click event
          console.log('Clicked on node:', intersectedNode.repoName);
        } else {
          // Handle hover event
          if (hoveredNode !== intersectedNode.repoName) {
            console.log('Mouse entered node:', intersectedNode.repoName);
            setHoveredNode(intersectedNode.repoName);
          }
        }
      }
    } else {
      if (hoveredNode !== null) {
        console.log('Mouse left node:', hoveredNode);
        setHoveredNode(null);
      }
    }
  }, [sceneState, hoveredNode]);

  if (error) {
    return <div>Error: {error}</div>;
  }

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
