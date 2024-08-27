import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DreamNodeGrid from './DreamNodeGrid';
import { scanDreamVault } from '../services/electronService';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [sceneState, setSceneState] = useState(null);

  console.log('Three component rendering');

  const initScene = useMemo(() => () => {
    if (!refContainer.current) return null;

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 1000;

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

      return {
        scene,
        camera,
        renderer,
        cssRenderer,
        controls,
        cleanup: () => {
          window.removeEventListener('resize', handleResize);
          renderer.dispose();
          cssRenderer.dispose();
          controls.dispose();
        }
      };
    } catch (error) {
      console.error("Error in initScene:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let cleanupFunction;

    const setup = async () => {
      console.log('Setting up scene');
      const newSceneState = initScene();
      if (newSceneState) {
        console.log('Scene initialized successfully');
        setSceneState(newSceneState);
        cleanupFunction = newSceneState.cleanup;

        try {
          const repos = await scanDreamVault();
          console.log('Scanned dream vault:', repos);
          setDreamNodes(repos.map(repo => ({ repoName: repo })));
        } catch (error) {
          console.error('Error scanning dream vault:', error);
        }
      } else {
        console.error('Failed to initialize scene');
      }
    };

    setup();

    return () => {
      if (cleanupFunction) {
        console.log('Cleaning up scene');
        cleanupFunction();
      }
    };
  }, [initScene]);

  useEffect(() => {
    const state = initScene();
    if (state) setSceneState(state);

    return () => {
      if (state && state.renderer) {
        state.renderer.dispose();
      }
    };
  }, [initScene]);

  useEffect(() => {
    if (!sceneState) return;

    const { scene, camera, renderer, controls } = sceneState;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [sceneState]);

  const handleNodeClick = (repoName) => {
    console.log(`Node clicked: ${repoName}`);
    // Implement any additional logic for node click
  };

  if (!sceneState || dreamNodes.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div ref={refContainer}>
      {sceneState && (
        <DreamNodeGrid
          scene={sceneState.scene}
          camera={sceneState.camera}
          dreamNodes={dreamNodes}
        />
      )}
    </div>
  );
}

export default Three;
