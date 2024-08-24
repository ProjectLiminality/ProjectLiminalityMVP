import React from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';

class DreamNode {
  constructor({ scene, position = new THREE.Vector3(0, 0, 0), repoName }) {
    this.repoName = repoName;
    this.scene = scene;
    this.position = position;
    this.object = new THREE.Object3D();
    this.isRotating = false;
    this.targetRotation = 0;
    this.yOffset = 0.06; // Y offset variable
    this.isMoving = false;
    this.mediaContent = null;
    this.loadMediaContent();
    this.targetPosition = new THREE.Vector3();
    this.isScaling = false;
    this.targetScale = 1;
    this.currentScale = 1;
    this.startPosition = new THREE.Vector3();
    this.movementStartTime = 0;
    this.movementDuration = 1500; // 1.5 seconds in milliseconds

    this.init();
  }

  easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  init() {
    console.log("Initializing DreamNode");
    this.createNode();
    this.addClickListener();
    console.log("DreamNode initialized");
  }

  createNode() {
    const radius = 2;
    const segments = 64;

    // Create a circular disc
    const geometry = new THREE.CircleGeometry(radius, segments);
    const material = new THREE.MeshBasicMaterial({ color: 0x4287f5, side: THREE.DoubleSide });
    const disc = new THREE.Mesh(geometry, material);
    disc.position.copy(this.position);

    const frontSide = this.createSide(DreamTalk, 0.01, { repoName: this.repoName });
    const backSide = this.createSide(DreamSong, -0.01);
    backSide.rotation.y = Math.PI;

    // Adjust the scale of the CSS3DObjects to match the disc size
    const scale = (radius * 2) / 400; // 400px is the width/height of the div
    frontSide.scale.set(scale, scale, scale);
    backSide.scale.set(scale, scale, scale);

    this.object.add(disc);
    this.object.add(frontSide);
    this.object.add(backSide);
  }

  createSide(Component, zOffset, props = {}) {
    const div = document.createElement('div');
    div.style.width = '400px';
    div.style.height = '400px';
    div.style.borderRadius = '50%';
    div.style.overflow = 'hidden';

    const root = createRoot(div);
    root.render(React.createElement(Component, { ...props, mediaContent: this.mediaContent }));

    const object = new CSS3DObject(div);
    // Use the new yOffset variable for vertical positioning
    object.position.set(this.position.x, this.position.y - this.yOffset, this.position.z + zOffset);
    object.scale.set(0.01, 0.01, 0.01);

    return object;
  }

  addClickListener() {
    this.object.userData.clickable = true;
    this.scene.addEventListener('click', this.onNodeClick.bind(this));
  }

  onNodeClick(event) {
    const intersects = event.intersects;
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject.parent === this.object && !this.isRotating) {
        this.rotateNode();
      }
    }
  }

  rotateNode() {
    this.isRotating = true;
    this.rotationStartTime = Date.now();
    this.startRotation = this.object.rotation.y;
    this.targetRotation = this.startRotation + Math.PI;
  }

  update() {
    if (this.isRotating) {
      this.updateRotation();
    }

    if (this.isMoving) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.movementStartTime;
      const progress = Math.min(elapsedTime / this.movementDuration, 1);

      if (progress < 1) {
        const easedProgress = this.easeInOutCubic(progress);
        const newPosition = new THREE.Vector3().lerpVectors(
          this.startPosition,
          this.targetPosition,
          easedProgress
        );
        this.setPosition(newPosition);
      } else {
        this.setPosition(this.targetPosition);
        this.isMoving = false;
      }
    }

    if (this.isScaling) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - this.scaleStartTime;
      const progress = Math.min(elapsedTime / this.movementDuration, 1);

      if (progress < 1) {
        const easedProgress = this.easeInOutCubic(progress);
        const newScale = this.currentScale + (this.targetScale - this.currentScale) * easedProgress;
        this.setScale(newScale);
      } else {
        this.setScale(this.targetScale);
        this.isScaling = false;
      }
    }
  }

  updateScale(newScale) {
    this.targetScale = newScale;
    this.scaleStartTime = Date.now();
    this.isScaling = true;
  }

  setScale(scale) {
    this.currentScale = scale;
    this.object.scale.set(scale, scale, scale);
    
    // Adjust CSS3DObject scales and positions
    this.object.children.forEach(child => {
      if (child instanceof CSS3DObject) {
        child.scale.set(0.01, 0.01, 0.01);  // Keep CSS3DObject scale constant
        const zOffset = child.position.z > 0 ? 0.01 : -0.01;
        child.position.set(0, -this.yOffset, zOffset);  // Position relative to parent
      }
    });
  }

  getObject() {
    return this.object;
  }

  updatePosition(newPosition) {
    this.startPosition.copy(this.object.position);
    this.targetPosition.copy(newPosition);
    this.movementStartTime = Date.now();
    this.isMoving = true;
  }

  setPosition(newPosition) {
    this.position.copy(newPosition);
    this.object.position.copy(newPosition);
    
    // Update the position of the CSS3D objects relative to the parent object
    this.object.children.forEach(child => {
      if (child instanceof CSS3DObject) {
        const zOffset = child.position.z > 0 ? 0.01 : -0.01;
        child.position.set(0, -this.yOffset, zOffset);
      }
    });
  }

  updateRotation() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.rotationStartTime;
    const progress = Math.min(elapsedTime / this.movementDuration, 1);

    if (progress < 1) {
      const easedProgress = this.easeInOutCubic(progress);
      const newRotation = this.startRotation + (this.targetRotation - this.startRotation) * easedProgress;
      this.object.rotation.y = newRotation;
    } else {
      this.object.rotation.y = this.targetRotation % (2 * Math.PI);
      this.isRotating = false;
    }
  }
}

export default DreamNode;
  async loadMediaContent() {
    const mediaFormats = ['png', 'jpg', 'jpeg', 'gif', 'mp4'];
    for (const format of mediaFormats) {
      try {
        const response = await fetch(`/media/${this.repoName}.${format}`);
        if (response.ok) {
          this.mediaContent = {
            type: format === 'mp4' ? 'video' : 'image',
            url: `/media/${this.repoName}.${format}`
          };
          break;
        }
      } catch (error) {
        console.error(`Error loading media for ${this.repoName}:`, error);
      }
    }
  }
