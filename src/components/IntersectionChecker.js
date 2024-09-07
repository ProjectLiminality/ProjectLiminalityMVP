import React, { useRef, useCallback, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const IntersectionChecker = ({ dreamNodes, hoveredNode, setHoveredNode }) => {
  const { raycaster, camera, scene } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const checkIntersection = useCallback(() => {
    if (dreamNodes.length === 0) return;

    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const intersectedNode = intersects[0].object.parent;
      const intersectedRepoName = intersectedNode.userData.repoName;
      if (hoveredNode !== intersectedRepoName) {
        setHoveredNode(intersectedRepoName);
      }
    } else if (hoveredNode !== null) {
      setHoveredNode(null);
    }
  }, [dreamNodes, hoveredNode, setHoveredNode, raycaster, camera, scene]);

  useFrame(() => {
    checkIntersection();
  });

  useEffect(() => {
    const updateMouse = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', updateMouse);
    return () => {
      window.removeEventListener('mousemove', updateMouse);
    };
  }, []);

  return null;
};

export default IntersectionChecker;
