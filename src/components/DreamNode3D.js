import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { gsap } from 'gsap';

/**
 * @class DreamNode3D
 * @extends THREE.Object3D
 * @description Represents a 3D object for a dream node in the scene.
 */
class DreamNode3D extends THREE.Object3D {
  /**
   * @constructor
   * @param {HTMLElement} domElement - The DOM element to be rendered as a 3D object.
   * @param {THREE.Vector3} [initialPosition] - The initial position of the object in 3D space.
   */
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

  /**
   * @method updatePosition
   * @param {THREE.Vector3} newPosition - The new position to move the object to.
   * @param {number} [duration=1] - The duration of the animation in seconds.
   */
  updatePosition(newPosition, duration = 1) {
    gsap.to(this.position, {
      x: newPosition.x,
      y: newPosition.y,
      z: newPosition.z,
      duration: duration,
      ease: "power2.inOut"
    });
  }

  /**
   * @method updateRotation
   * @param {THREE.Euler} newRotation - The new rotation to apply to the object.
   * @param {number} [duration=1] - The duration of the animation in seconds.
   */
  updateRotation(newRotation, duration = 1) {
    gsap.to(this.rotation, {
      x: newRotation.x,
      y: newRotation.y,
      z: newRotation.z,
      duration: duration,
      ease: "power2.inOut"
    });
  }

  /**
   * @method updateScale
   * @param {THREE.Vector3} newScale - The new scale to apply to the object.
   * @param {number} [duration=0.3] - The duration of the animation in seconds.
   */
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

  /**
   * @method setHoverScale
   * @param {boolean} isHovered - Whether the node is being hovered over
   * @param {number} [duration=1] - The duration of the animation in seconds
   */
  setHoverScale(isHovered, duration = 0.5) {
    const scale = isHovered ? 1.05 : 1;
    this.updateScale(new THREE.Vector3(scale, scale, scale), duration);
  }

  /**
   * @method getFrontPlane
   * @returns {THREE.Mesh} The front plane of the object.
   */
  getFrontPlane() {
    return this.frontPlane;
  }

  /**
   * @method getBackPlane
   * @returns {THREE.Mesh} The back plane of the object.
   */
  getBackPlane() {
    return this.backPlane;
  }
}

export default DreamNode3D;
