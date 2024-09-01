import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { gsap } from 'gsap';

class DreamNode3D extends THREE.Object3D {
  constructor(domElement, initialPosition) {
    super();

    // Create CSS3DObject
    this.css3DObject = new CSS3DObject(domElement);
    this.add(this.css3DObject);

    // Create circular interaction planes
    const radius = 150; // Assuming the width/height was 300, so radius is half of that
    const segments = 32; // Number of segments to approximate the circle
    const circleGeometry = new THREE.CircleGeometry(radius, segments);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });

    this.frontPlane = new THREE.Mesh(circleGeometry, planeMaterial);
    this.backPlane = new THREE.Mesh(circleGeometry, planeMaterial);
    this.backPlane.rotation.y = Math.PI;

    this.add(this.frontPlane);
    this.add(this.backPlane);

    if (initialPosition) {
      this.position.copy(initialPosition);
    }
  }

  updatePosition(newPosition, duration = 1) {
    gsap.to(this.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: duration,
      ease: "power2.inOut"
    });
  }

  updateRotation(newRotation, duration = 1) {
    gsap.to(this.rotation, {
      x: newRotation.x,
      y: newRotation.y,
      z: newRotation.z,
      duration: duration,
      ease: "power2.inOut"
    });
  }

  updateScale(newScale, duration = 0.3) {
    gsap.to(this.scale, {
      x: newScale.x,
      y: newScale.y,
      z: newScale.z,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        this.frontPlane.scale.copy(this.scale);
        this.backPlane.scale.copy(this.scale);
        this.css3DObject.scale.copy(this.scale);
      }
    });
  }

  getFrontPlane() {
    return this.frontPlane;
  }

  getBackPlane() {
    return this.backPlane;
  }
}

export default DreamNode3D;
