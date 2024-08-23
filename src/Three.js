import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { useEffect, useRef, useState } from "react";
import DreamNode from './components/DreamNode';

function Three() {
  const refContainer = useRef(null);
  const [dreamNodes, setDreamNodes] = useState([]);
  useEffect(() => {
    console.log("Three.js component mounted");
    if (refContainer.current) {
      const initScene = async () => {
        try {
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0x000000);  // Black background
          console.log("Scene created with black background");

          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
          console.log("CSS renderer created and added to DOM");
        
          // Add lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
          scene.add(ambientLight);
          const pointLight = new THREE.PointLight(0xffffff, 1);
          pointLight.position.set(5, 5, 5);
          scene.add(pointLight);
        
          // Scan DreamVault and create DreamNodes
          console.log("Scanning DreamVault");
          if (window.electron) {
            const repos = await window.electron.scanDreamVault();
            console.log("Found repositories:", repos);

            const maxNodes = Math.min(repos.length, 10);  // Limit to 10 nodes
            const newDreamNodes = repos.slice(0, maxNodes).map((repoName, index) => {
              const angle = (index / maxNodes) * Math.PI * 2;
              const radius = 5;
              const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
              );
              const dreamNode = new DreamNode({ scene, position, repoName });
              const dreamNodeObject = dreamNode.getObject();
              scene.add(dreamNodeObject);
              return dreamNode;
            });

            setDreamNodes(newDreamNodes);
            console.log(`Created ${newDreamNodes.length} DreamNodes`);
          }
      
          camera.position.z = 10;
          console.log("Camera position:", camera.position);
      
          const animate = function () {
            requestAnimationFrame(animate);
            dreamNodes.forEach(node => node.update());
            renderer.render(scene, camera);
            cssRenderer.render(scene, camera);
          };
      
          animate();

          console.log("Animation loop started");
          console.log("Scene children:", scene.children);

          // Add raycaster for click detection
          const raycaster = new THREE.Raycaster();
          const mouse = new THREE.Vector2();

          const onClick = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0) {
              scene.dispatchEvent({ type: 'click', intersects: intersects });
            } else {
              // Convert 2D mouse position to 3D world position
              const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
              vector.unproject(camera);
              const dir = vector.sub(camera.position).normalize();
              const distance = -camera.position.z / dir.z;
              const pos = camera.position.clone().add(dir.multiplyScalar(distance));
              
              // Update all DreamNode positions
              dreamNodes.forEach(dreamNode => dreamNode.updatePosition(pos));
            }
          };

          window.addEventListener('click', onClick);

          // Add spacebar event listener for scaling
          let isLarge = false;
          const onKeyDown = (event) => {
            if (event.code === 'Space') {
              event.preventDefault();
              dreamNodes.forEach(dreamNode => {
                if (isLarge) {
                  dreamNode.updateScale(1);
                } else {
                  dreamNode.updateScale(2);
                }
              });
              isLarge = !isLarge;
            }
          };

          window.addEventListener('keydown', onKeyDown);
      
          const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            cssRenderer.setSize(window.innerWidth, window.innerHeight);
          };
      
          window.addEventListener('resize', handleResize);
      
          return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('click', onClick);
            window.removeEventListener('keydown', onKeyDown);
            if (refContainer.current) {
              refContainer.current.removeChild(renderer.domElement);
              refContainer.current.removeChild(cssRenderer.domElement);
            }
          };
        } catch (error) {
          console.error("Error in Three.js setup:", error);
        }
      };

      initScene();
    }
  }, []);

  return (
    <>
      <div ref={refContainer} style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        overflow: 'hidden'
      }} />
      {!refContainer.current && <div style={{ display: 'none' }}>Loading 3D scene...</div>}
    </>
  );
}

export default Three;
