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
