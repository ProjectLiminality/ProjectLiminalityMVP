import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { useEffect, useRef } from "react";
import DreamNode from './components/DreamNode';

function Three() {
  const refContainer = useRef(null);
  useEffect(() => {
    console.log("Three.js component mounted");
    if (refContainer.current) {
      try {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);  // Black background
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(renderer.domElement);

      const cssRenderer = new CSS3DRenderer();
      cssRenderer.setSize(window.innerWidth, window.innerHeight);
      cssRenderer.domElement.style.position = 'absolute';
      cssRenderer.domElement.style.top = '0';
      refContainer.current.appendChild(cssRenderer.domElement);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      // Create DreamNode
      const dreamNode = new DreamNode({ scene });
      scene.add(dreamNode.getObject());
      
      camera.position.z = 5;
      
      const animate = function () {
        requestAnimationFrame(animate);
        dreamNode.update();
        renderer.render(scene, camera);
        cssRenderer.render(scene, camera);
      };
      
      animate();

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
        }
      };

      window.addEventListener('click', onClick);
      
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
        refContainer.current.removeChild(renderer.domElement);
        refContainer.current.removeChild(cssRenderer.domElement);
      };
    }
  } catch (error) {
    console.error("Error in Three.js setup:", error);
  }
  }
}, []);

  return (
    <>
      <div ref={refContainer} style={{ width: '100vw', height: '100vh' }} />
      {!refContainer.current && <div>Loading 3D scene...</div>}
    </>
  );
}

export default Three;
