import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import DreamNodeGrid from './DreamNodeGrid';
import { scanDreamVault } from '../services/electronService';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [scene, setScene] = useState(null);

  useEffect(() => {
    console.log("Three.js component mounted");
    if (refContainer.current) {
      const initScene = async () => {
        try {
          const newScene = new THREE.Scene();
          newScene.background = new THREE.Color(0x000000);  // Black background
          console.log("Scene created with black background");

          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 1000;
          console.log("Camera created");

          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.setSize(window.innerWidth, window.innerHeight);
          refContainer.current.appendChild(renderer.domElement);
          console.log("WebGL renderer created and added to DOM");

          const cssRenderer = new CSS3DRenderer();
          cssRenderer.setSize(window.innerWidth, window.innerHeight);
          cssRenderer.domElement.style.position = 'absolute';
          cssRenderer.domElement.style.top = '0';
          refContainer.current.appendChild(cssRenderer.domElement);
          console.log("CSS3D renderer created and added to DOM");

          const controls = new OrbitControls(camera, cssRenderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.25;
          controls.enableZoom = true;
          console.log("Orbit controls created");

          const repos = await scanDreamVault();
          console.log("Scanned DreamVault:", repos);

          setDreamNodes(repos.map(repo => ({ repoName: repo })));
          console.log("DreamNodes created:", repos.length);

          setScene(newScene);

          const animate = function () {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(newScene, camera);
            cssRenderer.render(newScene, camera);
          };

          animate();
          console.log("Animation loop started");

          const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            cssRenderer.setSize(window.innerWidth, window.innerHeight);
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

  const handleNodeClick = (repoName) => {
    console.log(`Node clicked: ${repoName}`);
    // Implement any additional logic for node click
  };

  return (
    <div ref={refContainer}>
      {scene && (
        <DreamNodeGrid
          scene={scene}
          dreamNodes={dreamNodes}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}

export default Three;
