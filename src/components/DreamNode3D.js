import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { updatePosition, updateRotation, updateScale } from '../utils/3DUtils';

class DreamNode3D extends THREE.Object3D {
  constructor(domElement, initialPosition) {
    super();

    // Create CSS3DObject
    this.css3DObject = new CSS3DObject(domElement);
    this.add(this.css3DObject);

    // Create interaction planes
    const planeGeometry = new THREE.PlaneGeometry(300, 300);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    
    this.frontPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.backPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.backPlane.rotation.y = Math.PI;

    this.add(this.frontPlane);
    this.add(this.backPlane);

    // Set initial position
    this.position.copy(initialPosition);
  }

  updatePosition(newPosition, duration = 1000) {
    updatePosition(this, newPosition, duration);
  }

  updateRotation(newRotation, duration = 1000) {
    updateRotation(this, newRotation, duration);
  }

  updateScale(newScale, duration = 300) {
    updateScale(this, newScale, duration);
  }

  getFrontPlane() {
    return this.frontPlane;
  }

  getBackPlane() {
    return this.backPlane;
  }
}

export default DreamNode3D;
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

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

  updatePosition(newPosition, duration = 1000) {
    // Implementation of updatePosition method
  }

  updateRotation(newRotation, duration = 1000) {
    // Implementation of updateRotation method
  }

  updateScale(newScale, duration = 300) {
    // Implementation of updateScale method
  }

  getFrontPlane() {
    return this.frontPlane;
  }

  getBackPlane() {
    return this.backPlane;
  }
}

export default DreamNode3D;
