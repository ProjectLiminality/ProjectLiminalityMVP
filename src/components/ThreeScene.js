import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { DreamNodeGrid } from './DreamNodeGrid';
import { scanDreamVault } from '../services/electronService';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [renderer, setRenderer] = useState(null);
  const [cssRenderer, setCssRenderer] = useState(null);
  const [controls, setControls] = useState(null);

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
          setCamera(newCamera);
          console.log("Camera created");

          const newRenderer = new THREE.WebGLRenderer({ antialias: true });
          newRenderer.setSize(window.innerWidth, window.innerHeight);
          refContainer.current.appendChild(newRenderer.domElement);
          setRenderer(newRenderer);
          console.log("WebGL renderer created and added to DOM");

          const newCssRenderer = new CSS3DRenderer();
          newCssRenderer.setSize(window.innerWidth, window.innerHeight);
          newCssRenderer.domElement.style.position = 'absolute';
          newCssRenderer.domElement.style.top = '0';
          refContainer.current.appendChild(newCssRenderer.domElement);
          setCssRenderer(newCssRenderer);
          console.log("CSS3D renderer created and added to DOM");

          const newControls = new OrbitControls(newCamera, newCssRenderer.domElement);
          newControls.enableDamping = true;
          newControls.dampingFactor = 0.25;
          newControls.enableZoom = true;
          setControls(newControls);
          console.log("Orbit controls created");

          const repos = await scanDreamVault();
          console.log("Scanned DreamVault:", repos);

          setDreamNodes(repos.map(repo => ({ repoName: repo })));
          console.log("DreamNodes created:", repos.length);

          setScene(newScene);

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
  }, [scene, camera, renderer, cssRenderer, controls]);

  const handleNodeClick = (repoName) => {
    console.log(`Node clicked: ${repoName}`);
    // Implement any additional logic for node click
  };

  return (
    <div ref={refContainer}>
      {scene && camera && dreamNodes.length > 0 && (
        <DreamNodeGrid
          scene={scene}
          camera={camera}
          dreamNodes={dreamNodes}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}

export default Three;
