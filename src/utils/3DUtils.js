import * as THREE from 'three';

export function create3DObject(geometry, material) {
  return new THREE.Mesh(geometry, material);
}

export function updatePosition(object, newPosition, duration) {
  const startPosition = object.position.clone();
  const startTime = Date.now();

  function animate() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    object.position.lerpVectors(startPosition, newPosition, easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

export function updateRotation(object, newRotation, duration) {
  const startRotation = object.rotation.clone();
  const startTime = Date.now();

  function animate() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    object.rotation.x = THREE.MathUtils.lerp(startRotation.x, newRotation.x, easeProgress);
    object.rotation.y = THREE.MathUtils.lerp(startRotation.y, newRotation.y, easeProgress);
    object.rotation.z = THREE.MathUtils.lerp(startRotation.z, newRotation.z, easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

export function updateScale(object, newScale, duration) {
  const startScale = object.scale.clone();
  const startTime = Date.now();

  function animate() {
    const now = Date.now();
    const progress = Math.min((now - startTime) / duration, 1);
    const easeProgress = easeInOutCubic(progress);

    object.scale.lerpVectors(startScale, newScale, easeProgress);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  animate();
}

// Keep the existing updateSize function for backwards compatibility
export function updateSize(object, newScale, duration) {
  updateScale(object, newScale, duration);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
