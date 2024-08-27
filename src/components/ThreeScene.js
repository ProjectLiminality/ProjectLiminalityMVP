import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DreamNodeGrid from './DreamNodeGrid.jsx';
import { scanDreamVault } from '../services/electronService';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [sceneState, setSceneState] = useState(null);

  const initScene = useMemo(() => async () => {
    if (!refContainer.current) return null;

    try {
      const newScene = new THREE.Scene();
      newScene.background = new THREE.Color(0x000000);

      const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      newCamera.position.z = 1000;

      const newRenderer = new THREE.WebGLRenderer({ antialias: true });
      newRenderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(newRenderer.domElement);

      const newCssRenderer = new CSS3DRenderer();
      newCssRenderer.setSize(window.innerWidth, window.innerHeight);
      newCssRenderer.domElement.style.position = 'absolute';
      newCssRenderer.domElement.style.top = '0';
      refContainer.current.appendChild(newCssRenderer.domElement);

      const newControls = new OrbitControls(newCamera, newCssRenderer.domElement);
      newControls.enableDamping = true;
      newControls.dampingFactor = 0.25;
      newControls.enableZoom = true;

      const handleResize = () => {
        newCamera.aspect = window.innerWidth / window.innerHeight;
        newCamera.updateProjectionMatrix();
        newRenderer.setSize(window.innerWidth, window.innerHeight);
        newCssRenderer.setSize(window.innerWidth, window.innerHeight);
      };

      window.addEventListener('resize', handleResize);

      return {
        scene: newScene,
        camera: newCamera,
        renderer: newRenderer,
        cssRenderer: newCssRenderer,
        controls: newControls,
        cleanup: () => {
          window.removeEventListener('resize', handleResize);
          newRenderer.dispose();
          newCssRenderer.dispose();
          newControls.dispose();
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
      const newSceneState = await initScene();
      if (newSceneState) {
        setSceneState(newSceneState);
        cleanupFunction = newSceneState.cleanup;

        const repos = await scanDreamVault();
        setDreamNodes(repos.map(repo => ({ repoName: repo })));
      }
    };

    setup();

    return () => {
      if (cleanupFunction) cleanupFunction();
    };
  }, [initScene]);

  useEffect(() => {
    if (!sceneState) return;

    const { scene, camera, renderer, cssRenderer, controls } = sceneState;
    let animationFrameId;

    const animate = function () {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      cssRenderer.render(scene, camera);
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
      <DreamNodeGrid
        sceneState={sceneState}
        dreamNodes={dreamNodes}
        onNodeClick={handleNodeClick}
      />
    </div>
  );
}

export default Three;
