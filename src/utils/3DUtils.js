import * as THREE from 'three';

export function create3DObject(geometry, material) {
  return new THREE.Mesh(geometry, material);
}

export function updatePosition(object, newPosition, duration) {
  // Implement position update logic here
}

export function updateRotation(object, newRotation, duration) {
  // Implement rotation update logic here
}
