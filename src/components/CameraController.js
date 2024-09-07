import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CameraController = () => {
  const { camera } = useThree();
  const moveSpeed = 1;
  const rotateSpeed = 0.002;
  let isDragging = useRef(false);
  let previousMousePosition = useRef({ x: 0, y: 0 });

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    tiltLeft: false,
    tiltRight: false,
  });

  useFrame(() => {
    const moveVector = new THREE.Vector3();

    if (moveState.current.forward) moveVector.z -= moveSpeed;
    if (moveState.current.backward) moveVector.z += moveSpeed;
    if (moveState.current.left) moveVector.x -= moveSpeed;
    if (moveState.current.right) moveVector.x += moveSpeed;
    if (moveState.current.up) moveVector.y += moveSpeed;
    if (moveState.current.down) moveVector.y -= moveSpeed;

    camera.translateX(moveVector.x);
    camera.translateY(moveVector.y);
    camera.translateZ(moveVector.z);

    const tiltSpeed = 0.02;
    if (moveState.current.tiltLeft) {
      camera.rotateZ(tiltSpeed);
    }
    if (moveState.current.tiltRight) {
      camera.rotateZ(-tiltSpeed);
    }
  });

  const onMouseMove = (event) => {
    if (isDragging.current) {
      const movementX = event.clientX - previousMousePosition.current.x;
      const movementY = event.clientY - previousMousePosition.current.y;

      camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -movementX * rotateSpeed);
      camera.rotateX(-movementY * rotateSpeed);
      camera.up.set(0, 1, 0);

      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    }
  };

  const onMouseDown = (event) => {
    if (event.button === 0) {
      isDragging.current = true;
      previousMousePosition.current = { x: event.clientX, y: event.clientY };
    }
  };

  const onMouseUp = (event) => {
    if (event.button === 0) {
      isDragging.current = false;
    }
  };

  const onKeyDown = (event) => {
    switch (event.key.toLowerCase()) {
      case 'w': moveState.current.forward = true; break;
      case 's': moveState.current.backward = true; break;
      case 'a': moveState.current.left = true; break;
      case 'd': moveState.current.right = true; break;
      case ' ': moveState.current.up = true; break;
      case 'shift': moveState.current.down = true; break;
      case 'q': moveState.current.tiltLeft = true; break;
      case 'e': moveState.current.tiltRight = true; break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.key.toLowerCase()) {
      case 'w': moveState.current.forward = false; break;
      case 's': moveState.current.backward = false; break;
      case 'a': moveState.current.left = false; break;
      case 'd': moveState.current.right = false; break;
      case ' ': moveState.current.up = false; break;
      case 'shift': moveState.current.down = false; break;
      case 'q': moveState.current.tiltLeft = false; break;
      case 'e': moveState.current.tiltRight = false; break;
    }
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  return null;
};

export default CameraController;
