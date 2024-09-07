import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IntersectionChecker = () => {
  const { raycaster, camera, scene } = useThree();
  const mouse = useRef(new THREE.Vector2());

  useFrame(() => {
    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const intersectedNode = intersects[0].object.parent;
      if (intersectedNode && intersectedNode.userData && intersectedNode.userData.onHover) {
        intersectedNode.userData.onHover(true);
      }
    }
  });

  const updateMouse = (event) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', updateMouse);
    return () => {
      window.removeEventListener('mousemove', updateMouse);
    };
  }, []);

  return null;
};

export default IntersectionChecker;
