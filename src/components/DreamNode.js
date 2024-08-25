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
    this.metadata = {};
    this.object = new THREE.Object3D();
    this.isRotating = false;
    this.targetRotation = 0;
    this.isMoving = false;
    this.mediaContent = null;
    this.targetPosition = new THREE.Vector3();
    this.isScaling = false;
    this.targetScale = 1;
    this.currentScale = 1;
    this.startPosition = new THREE.Vector3();
    this.movementStartTime = 0;
    this.movementDuration = 1500;
    this.isHovered = false;

    this.init();
  }

  async init() {
    console.log("Initializing DreamNode");
    await this.readMetadata();
    await this.loadMediaContent();
    this.createNode();
    this.addClickListener();
    console.log("DreamNode initialized", this.metadata);
  }

  async readMetadata() {
    console.log(`🔍 Reading metadata for ${this.repoName}`);
    try {
      const response = await fetch(`/${this.repoName}/.pl`);
      if (!response.ok) {
        console.warn(`⚠️ HTTP error for ${this.repoName}! Status: ${response.status}`);
        this.metadata = this.getDefaultMetadata();
        return;
      }

      const text = await response.text();
      if (!text) {
        console.warn(`⚠️ Empty .pl file for ${this.repoName}`);
        this.metadata = this.getDefaultMetadata();
        return;
      }

      console.log(`📄 Raw .pl content for ${this.repoName}:\n${text}`);

      try {
        this.metadata = JSON.parse(text);
        console.log(`✅ Successfully parsed metadata for ${this.repoName}:`, this.metadata);
      } catch (parseError) {
        console.error(`❌ Failed to parse .pl file as JSON for ${this.repoName}:`, parseError);
        this.metadata = { rawContent: text };
      }

      if (Object.keys(this.metadata).length === 0) {
        console.warn(`⚠️ No content in metadata for ${this.repoName}`);
        this.metadata = this.getDefaultMetadata();
      } else {
        console.log(`🏁 Metadata content for ${this.repoName}:`, JSON.stringify(this.metadata, null, 2));
      }

      if (!this.metadata.type) {
        console.warn(`⚠️ No 'type' field found in metadata for ${this.repoName}, using default.`);
        this.metadata.type = 'idea';
      }

    } catch (error) {
      console.error(`❌ Error reading metadata for ${this.repoName}:`, error);
      this.metadata = this.getDefaultMetadata();
    }
  }

  getDefaultMetadata() {
    return {
      type: 'idea',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      interactions: 0,
      relatedNodes: []
    };
  }

  getNodeColor() {
    const nodeType = this.metadata.type ? this.metadata.type.toLowerCase() : 'idea';
    console.log(`🎨 Determining color for node type: ${nodeType}`);
    
    let color;
    switch (nodeType) {
      case 'person':
        color = 0xff0000; // Red for person
        break;
      case 'idea':
      default:
        color = 0x4287f5; // Blue for idea (default)
    }
    
    console.log(`🔢 Color value: ${color.toString(16)}`);
    return color;
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
    console.log(`🔨 Creating node for ${this.repoName}`);
    const segments = 64;

    this.nodeContainer = new THREE.Object3D();

    const geometry = new THREE.CircleGeometry(1, segments);
    const color = this.getNodeColor();
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      side: THREE.DoubleSide 
    });
    this.disc = new THREE.Mesh(geometry, material);

    const hoverGeometry = new THREE.RingGeometry(radius, radius + 0.2, segments);
    const hoverMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0
    });
    this.hoverRing = new THREE.Mesh(hoverGeometry, hoverMaterial);

    const frontSide = this.createSide(DreamTalk, 0.001, { repoName: this.repoName });
    const backSide = this.createSide(DreamSong, -0.001);
    backSide.rotation.y = Math.PI;

    frontSide.position.set(0, 0, 0.001);
    backSide.position.set(0, 0, -0.001);

    this.nodeContainer.add(this.disc);
    this.nodeContainer.add(this.hoverRing);
    this.nodeContainer.add(frontSide);
    this.nodeContainer.add(backSide);

    this.object.position.copy(this.position);
    this.object.add(this.nodeContainer);

    console.log(`✅ Node created for ${this.repoName} with color: ${color.toString(16)}`);
  }

  createSide(Component, zOffset, props = {}) {
    const div = document.createElement('div');
    div.style.width = `190px`; // 95% of 200px
    div.style.height = `190px`; // 95% of 200px
    div.style.borderRadius = '50%';
    div.style.overflow = 'hidden';
    div.style.backgroundColor = '#000000'; // Set background to black

    const root = createRoot(div);
    root.render(React.createElement(Component, { 
      ...props, 
      mediaContent: this.mediaContent,
      style: { 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white', // Ensure text is visible on black background
        fontSize: '14px', // Adjust this value to fit the text
        padding: '10px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }
    }));

    const object = new CSS3DObject(div);
    object.position.set(0, 0, zOffset);
    
    // Scale to match the content size
    const scale = 0.01;
    object.scale.set(scale, scale, scale);

    return object;
  }

  addClickListener() {
    this.nodeContainer.userData.clickable = true;
    this.nodeContainer.userData.dreamNode = this;
  }

  onClick() {
    if (!this.isRotating) {
      this.rotateNode();
    }
  }

  onHover(isHovered) {
    if (isHovered && !this.isHovered) {
      this.isHovered = true;
      this.hoverRing.material.opacity = 0.5;
    } else if (!isHovered && this.isHovered) {
      this.isHovered = false;
      this.hoverRing.material.opacity = 0;
    }
  }

  rotateNode() {
    this.isRotating = true;
    this.rotationStartTime = Date.now();
    this.startRotation = this.nodeContainer.rotation.y;
    this.targetRotation = Math.round(this.startRotation / Math.PI) % 2 === 0 ? Math.PI : 0;
  }

  update() {
    if (this.isRotating) {
      this.updateRotation();
    }

    if (this.isMoving) {
      this.updatePosition();
    }

    if (this.isScaling) {
      this.updateScale();
    }
  }

  updateScale(newScale) {
    if (!this.isScaling) {
      this.targetScale = newScale;
      this.scaleStartTime = Date.now();
      this.isScaling = true;
    }
  }

  updateScaleAnimation() {
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

  setScale(scale) {
    this.currentScale = scale;
    this.nodeContainer.scale.set(scale, scale, scale);
    
    // Adjust CSS3DObject scales
    this.nodeContainer.children.forEach(child => {
      if (child instanceof CSS3DObject) {
        child.scale.set(0.01 / scale, 0.01 / scale, 0.01 / scale);
      }
    });
  }

  getObject() {
    return this.object;
  }

  updatePosition(newPosition) {
    if (!this.isMoving) {
      this.startPosition.copy(this.object.position);
      this.targetPosition.copy(newPosition);
      this.movementStartTime = Date.now();
      this.isMoving = true;
    }
  }

  update() {
    if (this.isRotating) {
      this.updateRotation();
    }

    if (this.isMoving) {
      this.updatePositionAnimation();
    }

    if (this.isScaling) {
      this.updateScale();
    }
  }

  updatePositionAnimation() {
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

  setPosition(newPosition) {
    this.position.copy(newPosition);
    this.object.position.copy(newPosition);
    // Reset the nodeContainer's position to ensure it's centered on the object
    this.nodeContainer.position.set(0, 0, 0);
  }

  updateRotation() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.rotationStartTime;
    const progress = Math.min(elapsedTime / this.movementDuration, 1);

    if (progress < 1) {
      const easedProgress = this.easeInOutCubic(progress);
      const newRotation = this.startRotation + (this.targetRotation - this.startRotation) * easedProgress;
      this.nodeContainer.rotation.y = newRotation;
    } else {
      this.nodeContainer.rotation.y = this.targetRotation;
      this.isRotating = false;
    }
  }
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
          return; // Exit the function once media is found
        }
      } catch (error) {
        console.error(`Error loading media for ${this.repoName}:`, error);
      }
    }
    // If no media is found, set a default
    this.mediaContent = null;
    console.log(`No media found for ${this.repoName}`);
  }
}

export default DreamNode;
