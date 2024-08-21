import * as THREE from 'three';
import { useEffect, useRef } from "react";
import ReactDOM from 'react-dom';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamNode from './components/DreamNode';

function Three() {
  const refContainer = useRef(null);
  useEffect(() => {
    if (refContainer.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);  // Black background
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      const webGLRenderer = new THREE.WebGLRenderer({ antialias: true });
      webGLRenderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(webGLRenderer.domElement);
      
      const css3DRenderer = new CSS3DRenderer();
      css3DRenderer.setSize(window.innerWidth, window.innerHeight);
      css3DRenderer.domElement.style.position = 'absolute';
      css3DRenderer.domElement.style.top = '0';
      refContainer.current.appendChild(css3DRenderer.domElement);
      
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
        webGLRenderer.render(scene, camera);
        css3DRenderer.render(scene, camera);
      };
      
      animate();
      
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        refContainer.current.removeChild(webGLRenderer.domElement);
        refContainer.current.removeChild(css3DRenderer.domElement);
      };
    }
  }, []);

  return <div ref={refContainer} style={{ width: '100vw', height: '100vh' }} />;
}

export default Three;
