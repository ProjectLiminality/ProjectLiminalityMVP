import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DreamNodeGrid from './DreamNodeGrid';
import { scanDreamVault } from '../services/electronService';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [sceneState, setSceneState] = useState({
    scene: null,
    camera: null,
    renderer: null,
    cssRenderer: null,
    controls: null,
  });

  useEffect(() => {
    console.log("Three.js component mounted");
    if (refContainer.current) {
      const initScene = async () => {
        try {
          const newScene = new THREE.Scene();
          newScene.background = new THREE.Color(0x000000);  // Black background
          console.log("Scene created with black background");

          const newCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          newCamera.position.z = 1000;
          console.log("Camera created");

          const newRenderer = new THREE.WebGLRenderer({ antialias: true });
          newRenderer.setSize(window.innerWidth, window.innerHeight);
          refContainer.current.appendChild(newRenderer.domElement);
          console.log("WebGL renderer created and added to DOM");

          const newCssRenderer = new CSS3DRenderer();
          newCssRenderer.setSize(window.innerWidth, window.innerHeight);
          newCssRenderer.domElement.style.position = 'absolute';
          newCssRenderer.domElement.style.top = '0';
          refContainer.current.appendChild(newCssRenderer.domElement);
          console.log("CSS3D renderer created and added to DOM");

          const newControls = new OrbitControls(newCamera, newCssRenderer.domElement);
          newControls.enableDamping = true;
          newControls.dampingFactor = 0.25;
          newControls.enableZoom = true;
          console.log("Orbit controls created");

          setSceneState({
            scene: newScene,
            camera: newCamera,
            renderer: newRenderer,
            cssRenderer: newCssRenderer,
            controls: newControls,
          });

          const repos = await scanDreamVault();
          console.log("Scanned DreamVault:", repos);

          setDreamNodes(repos.map(repo => ({ repoName: repo })));
          console.log("DreamNodes created:", repos.length);

          const handleResize = () => {
            newCamera.aspect = window.innerWidth / window.innerHeight;
            newCamera.updateProjectionMatrix();
            newRenderer.setSize(window.innerWidth, window.innerHeight);
            newCssRenderer.setSize(window.innerWidth, window.innerHeight);
          };

          window.addEventListener('resize', handleResize);
          console.log("Resize event listener added");

          return () => {
            window.removeEventListener('resize', handleResize);
            console.log("Resize event listener removed");
          };
        } catch (error) {
          console.error("Error in initScene:", error);
        }
      };

      initScene();
    }
  }, []);

  useEffect(() => {
    const { scene, camera, renderer, cssRenderer, controls } = sceneState;
    if (scene && camera && renderer && cssRenderer && controls) {
      const animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
      };

      animate();
      console.log("Animation loop started");
    }
  }, [sceneState]);

  const handleNodeClick = (repoName) => {
    console.log(`Node clicked: ${repoName}`);
    // Implement any additional logic for node click
  };

  return (
    <div ref={refContainer}>
      {sceneState.scene && sceneState.camera && dreamNodes.length > 0 && (
        <DreamNodeGrid
          sceneState={sceneState}
          dreamNodes={dreamNodes}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}

export default Three;
