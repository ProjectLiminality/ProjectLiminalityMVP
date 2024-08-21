import * as THREE from 'three';
import { useEffect, useRef } from "react";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

function Three() {
  const refContainer = useRef(null);
  useEffect(() => {
    if (refContainer.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x000000);  // Black background
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(renderer.domElement);
      
      // Create a thin cylinder (disc)
      const geometry = new THREE.CylinderGeometry(2, 2, 0.05, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x4287f5 });  // Blue disc
      const disc = new THREE.Mesh(geometry, material);
      scene.add(disc);
      
      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      // Add text to both sides
      const loader = new FontLoader();
      loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function(font) {
        const textGeometryFront = new TextGeometry('DreamTalk', {
          font: font,
          size: 0.3,
          height: 0.05,
        });
        const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });  // White text
        const textMeshFront = new THREE.Mesh(textGeometryFront, textMaterial);
        textMeshFront.position.set(-0.9, 0, 0.03);  // Slightly above the disc surface
        disc.add(textMeshFront);

        const textGeometryBack = new TextGeometry('DreamSong', {
          font: font,
          size: 0.3,
          height: 0.05,
        });
        const textMeshBack = new THREE.Mesh(textGeometryBack, textMaterial);
        textMeshBack.position.set(0.9, 0, -0.03);  // Slightly below the disc surface
        textMeshBack.rotation.y = Math.PI;
        disc.add(textMeshBack);
      });
      
      camera.position.z = 5;
      
      const animate = function () {
        requestAnimationFrame(animate);
        disc.rotation.y += 0.01;
        renderer.render(scene, camera);
      };
      
      animate();
      
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        refContainer.current.removeChild(renderer.domElement);
      };
    }
  }, []);

  return <div ref={refContainer} style={{ width: '100vw', height: '100vh' }} />;
}

export default Three;
