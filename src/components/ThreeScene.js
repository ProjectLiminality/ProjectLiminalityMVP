import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DreamNodeGrid from './DreamNodeGrid';
import { scanDreamVault } from '../services/electronService';

const ThreeScene = () => {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [sceneState, setSceneState] = useState(null);
  const [cssScene] = useState(() => new THREE.Scene());
  const [error, setError] = useState(null);
  const [isContainerReady, setIsContainerReady] = useState(false);

  console.log('Three component rendering');

  const initScene = useCallback(() => {
    console.log('Initializing scene');
    if (!refContainer.current) {
      console.error('Container ref is not available');
      setError('Container ref is not available');
      return null;
    }

    if (!WebGL.isWebGLAvailable()) {
      const warning = WebGL.getWebGLErrorMessage();
      console.error('WebGL is not available:', warning);
      setError('WebGL is not available: ' + warning);
      return null;
    }

    try {
      cssScene.background = new THREE.Color(0x000000);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
      camera.position.z = 2000;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(renderer.domElement);

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
        renderer.setSize(window.innerWidth, window.innerHeight);
        cssRenderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      console.log('Scene initialized successfully');
      return {
        scene: cssScene,
        camera,
        renderer,
        cssRenderer,
        controls,
        cleanup: () => {
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          if (cssRenderer.domElement && cssRenderer.domElement.parentNode) {
            cssRenderer.domElement.parentNode.removeChild(cssRenderer.domElement);
          }
          controls.dispose();
        }
      };
    } catch (error) {
      console.error('Error initializing scene:', error);
      setError('Error initializing scene: ' + error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (refContainer.current) {
      setIsContainerReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isContainerReady) return;

    console.log('Setting up scene');
    const newSceneState = initScene();
    if (newSceneState) {
      setSceneState(newSceneState);

      const fetchDreamNodes = async () => {
        try {
          const repos = await scanDreamVault();
          console.log('Scanned dream vault:', repos);
          const newDreamNodes = repos.map(repo => ({ repoName: repo, position: new THREE.Vector3() }));
          console.log('Created dream nodes:', newDreamNodes);
          setDreamNodes(newDreamNodes);
        } catch (error) {
          console.error('Error scanning dream vault:', error);
          setError('Error scanning dream vault: ' + error.message);
        }
      };

      fetchDreamNodes();
      console.log('Fetching dream nodes...');
    }

    return () => {
      if (newSceneState) {
        console.log('Cleaning up scene');
        newSceneState.cleanup();
      }
    };
  }, [initScene, isContainerReady]);

  const animate = useCallback(() => {
    if (sceneState) {
      const { scene, camera, renderer, cssRenderer, controls } = sceneState;
      controls.update();
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
    }
  }, [sceneState]);

  useEffect(() => {
    let animationFrameId;
    const animationLoop = () => {
      animate();
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    if (sceneState) {
      animationLoop();
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [sceneState, animate]);

  const handleNodeClick = useCallback((repoName) => {
    console.log('Node clicked:', repoName);
    // Add any additional logic for node click here
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div ref={refContainer}>
      {sceneState && dreamNodes.length > 0 && (
        <DreamNodeGrid
          scene={sceneState.scene}
          cssScene={cssScene}
          camera={sceneState.camera}
          dreamNodes={dreamNodes}
          onNodeClick={handleNodeClick}
          renderer={sceneState.renderer}
          cssRenderer={sceneState.cssRenderer}
        />
      )}
      {(!sceneState || dreamNodes.length === 0) && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
    </div>
  );
}

export default React.memo(ThreeScene);
