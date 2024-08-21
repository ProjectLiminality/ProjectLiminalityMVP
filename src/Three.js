import * as THREE from 'three';
import { useEffect, useRef } from "react";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

function Three() {
  const refContainer = useRef(null);
  useEffect(() => {
    if (refContainer.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f0f0);  // Light gray background
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      refContainer.current.appendChild(renderer.domElement);
      
      // Create a circular plane (disc)
      const geometry = new THREE.CircleGeometry(2, 32);
      const materialFront = new THREE.MeshPhongMaterial({ color: 0x4287f5, side: THREE.FrontSide });  // Blue front
      const materialBack = new THREE.MeshPhongMaterial({ color: 0xf54242, side: THREE.BackSide });  // Red back
      const disc = new THREE.Mesh(geometry, [materialFront, materialBack]);
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
        const textMeshFront = new THREE.Mesh(textGeometryFront, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        textMeshFront.position.set(-0.9, 0, 0.01);
        disc.add(textMeshFront);

        const textGeometryBack = new TextGeometry('DreamSong', {
          font: font,
          size: 0.3,
          height: 0.05,
        });
        const textMeshBack = new THREE.Mesh(textGeometryBack, new THREE.MeshPhongMaterial({ color: 0xffffff }));
        textMeshBack.position.set(0.9, 0, -0.01);
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
