import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Raycaster, Vector2 } from 'three';
import { scanDreamVault } from '../services/electronService';
import DreamNode from './DreamNode';
import DreamNode3D from './DreamNode3D';
import { createRoot } from 'react-dom/client';

/**
 * @typedef {Object} SceneState
 * @property {THREE.Scene} scene
 * @property {THREE.PerspectiveCamera} camera
 * @property {CSS3DRenderer} cssRenderer
 * @property {OrbitControls} controls
 * @property {() => void} cleanup
 */

/**
 * @typedef {Object} DreamNodeData
 * @property {string} repoName
 */

/**
 * DreamSpace component
 * @returns {JSX.Element}
 */
const DreamSpace = () => {
  const refContainer = useRef(null);
  /** @type {[DreamNodeData[], React.Dispatch<React.SetStateAction<DreamNodeData[]>>]} */
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);
  /** @type {[SceneState|null, React.Dispatch<React.SetStateAction<SceneState|null>>]} */
  const [sceneState, setSceneState] = useState(null);
  /** @type {React.MutableRefObject<Raycaster>} */
  const raycaster = useRef(new Raycaster());
  /** @type {React.MutableRefObject<Vector2>} */
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
      cssRenderer.domElement.style.position =
 'absolute';
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
      const fetchDreamNodes = async (count = 5, random = false) => {
        try {
          console.log('Scanning DreamVault...');
          const repos = await scanDreamVault();
          console.log('Repos found:', repos);
          if (repos.length > 0) {
            let selectedRepos;
            if (random) {
              selectedRepos = repos
                .sort(() => 0.5 - Math.random())
                .slice(0, count);
            } else {
              selectedRepos = repos.slice(0, count);
            }
            console.log('Setting DreamNodes:', selectedRepos);
            const newNodes = selectedRepos.map(repo => ({ repoName: repo }));
            setDreamNodes(newNodes);
          } else {
            console.error('No repositories found in the DreamVault');
            setError('No repositories found in the DreamVault');
          }
        } catch (error) {
          console.error('Error scanning dream vault:', error);
          setError('Error scanning dream vault: ' + error.message);
        }
      };

      fetchDreamNodes(5, true); // Fetch 5 random nodes
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

  /** @type {React.MutableRefObject<Array<DreamNode|null>>} */
  const dreamNodeRefs = useRef([]);

  useEffect(() => {
    if (sceneState && dreamNodes.length > 0) {
      console.log('Rendering DreamNodes in DreamSpace');
      const { scene } = sceneState;
      // Clear existing nodes
      scene.children = scene.children.filter(child => !(child instanceof DreamNode3D));
      console.log('Cleared existing nodes. Scene children count:', scene.children.length);
      
      // Reset dreamNodeRefs
      dreamNodeRefs.current = new Array(dreamNodes.length).fill(null);
      
      // Add multiple DreamNodes
      dreamNodes.forEach((dreamNode, index) => {
        const nodeElement = document.createElement('div');
        nodeElement.style.width = '300px';
        nodeElement.style.height = '300px';
        
        const root = createRoot(nodeElement);
        root.render(
          <DreamNode 
            key={dreamNode.repoName}
            ref={el => {
              dreamNodeRefs.current[index] = el;
            }}
            repoName={dreamNode.repoName} 
            initialPosition={new THREE.Vector3(index * 350, 0, 0)}
            cssScene={scene}
            onNodeClick={(repoName) => console.log('Node clicked:', repoName)}
            isHovered={hoveredNode === dreamNode.repoName}
          />
        );

        // Use a MutationObserver to detect when the DreamNode has been added to the DOM
        const observer = new MutationObserver(() => {
          console.log(`DreamNode ${dreamNode.repoName} rendered to nodeElement`);
          const currentNode = dreamNodeRefs.current[index];
          if (currentNode && currentNode.object) {
            scene.add(currentNode.object);
            console.log(`Added DreamNode ${dreamNode.repoName} to scene. Scene children count:`, scene.children.length);
          } else {
            console.log(`Failed to add DreamNode ${dreamNode.repoName} to scene. dreamNodeRefs.current[${index}]:`, currentNode);
          }
          observer.disconnect();
        });

        observer.observe(nodeElement, { childList: true, subtree: true });
      });
    } else {
      console.log('Not rendering DreamNode. sceneState:', !!sceneState, 'dreamNodes length:', dreamNodes.length);
    }
  }, [sceneState, dreamNodes]);

  const [hoveredNode, setHoveredNode] = useState(null);

  /**
   * Check for intersections with DreamNodes
   * @param {boolean} [isClick=false] - Whether this check is for a click event
   */
  const checkIntersection = useCallback((isClick = false) => {
    if (!sceneState || dreamNodeRefs.current.length === 0 || dreamNodes.length === 0) return;

    raycaster.current.setFromCamera(mouse.current, sceneState.camera);
    
    let intersectedNode = null;
    let intersectedPlane = null;

    for (let i = 0; i < dreamNodeRefs.current.length; i++) {
      const node = dreamNodeRefs.current[i];
      if (!node) continue;

      const intersects = raycaster.current.intersectObjects([
        node.getFrontPlane(),
        node.getBackPlane()
      ], true);

      if (intersects.length > 0) {
        intersectedNode = node;
        intersectedPlane = intersects[0].object;
        break;
      }
    }

    if (intersectedNode) {
      const isFrontSide = intersectedPlane === intersectedNode.getFrontPlane();
      const currentNode = dreamNodes[dreamNodeRefs.current.indexOf(intersectedNode)];

      if (isClick) {
        // Handle click event
        console.log('Clicked on node:', currentNode.repoName, 'Side:', isFrontSide ? 'front' : 'back');
        intersectedNode.updateRotation(
          new THREE.Euler(0, isFrontSide ? Math.PI : 0, 0),
          1000
        );
      } else {
        // Handle hover event
        if (hoveredNode !== currentNode.repoName) {
          console.log('Mouse entered node:', currentNode.repoName, 'Side:', isFrontSide ? 'front' : 'back');
          setHoveredNode(currentNode.repoName);
          intersectedNode.object.setHoverScale(true, 0.5);
        }
      }
    } else {
      if (hoveredNode !== null) {
        console.log('Mouse left node:', hoveredNode);
        setHoveredNode(null);
        const previousNode = dreamNodeRefs.current.find(node => node && node.props.repoName === hoveredNode);
        if (previousNode) {
          previousNode.object.setHoverScale(false, 0.5);
        }
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

      /**
       * @param {MouseEvent} event
       */
      const onMouseMove = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        checkIntersection();
      };

      /**
       * @param {MouseEvent} event
       */
      const onClick = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
        checkIntersection(true);
      };

      /**
       * @param {KeyboardEvent} event
       */
      const onKeyDown = (event) => {
        if (event.metaKey) {
          dreamNodeRefs.current.forEach(node => {
            if (node) {
              switch (event.key) {
                case '1':
                  const currentPosition = node.object.position;
                  node.updatePosition(
                    new THREE.Vector3(currentPosition.x + 50, currentPosition.y + 50, currentPosition.z + 50),
                    1
                  );
                  break;
                case '2':
                  const currentScale = node.object.scale;
                  node.updateScale(
                    new THREE.Vector3(currentScale.x * 2, currentScale.y * 2, currentScale.z * 2),
                    0.3
                  );
                  break;
                case '3':
                  const currentRotation = node.object.rotation;
                  node.updateRotation(
                    new THREE.Euler(currentRotation.x, currentRotation.y + Math.PI / 2, currentRotation.z),
                    1
                  );
                  break;
              }
            }
          });
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
