import React from 'react';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { create3DObject, updatePosition, updateRotation, updateSize } from '../utils/3DUtils';
import { easeInOutCubic } from '../utils/animationUtils';
import { readMetadata, getMediaFilePath, getFileStats } from '../services/electronService';

class DreamNode {
  constructor({ scene, position = new THREE.Vector3(0, 0, 0), repoName }) {
    this.repoName = repoName;
    this.scene = scene;
    this.position = position;
    this.metadata = {};
    this.object = new THREE.Object3D();
    this.nodeContainer = new THREE.Object3D(); // Initialize nodeContainer here
    this.object.add(this.nodeContainer);
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

  updateRotation(newRotation, duration = 1000) {
    updateRotation(this.nodeContainer, newRotation, duration);
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
      this.metadata = await readMetadata(this.repoName);
      console.log(`✅ Successfully read metadata for ${this.repoName}:`, this.metadata);

      if (Object.keys(this.metadata).length === 0) {
        console.warn(`⚠️ No content in metadata for ${this.repoName}`);
        this.metadata = this.getDefaultMetadata();
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

  createNode() {
    console.log(`🔨 Creating node for ${this.repoName}`);
    const segments = 64;

    // Clear existing children of nodeContainer
    while(this.nodeContainer.children.length > 0) { 
      this.nodeContainer.remove(this.nodeContainer.children[0]); 
    }

    const geometry = new THREE.CircleGeometry(1, segments);
    const color = this.getNodeColor();
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      side: THREE.DoubleSide 
    });
    this.disc = create3DObject(geometry, material);

    const frontSide = this.createSide(DreamTalk, 0.001, { repoName: this.repoName });
    const backSide = this.createSide(DreamSong, -0.001);
    backSide.rotation.y = Math.PI;

    frontSide.position.set(0, 0, 0.001);
    backSide.position.set(0, 0, -0.001);

    this.nodeContainer.add(this.disc);
    this.nodeContainer.add(frontSide);
    this.nodeContainer.add(backSide);

    this.object.position.copy(this.position);

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
      this.targetScale = 1.1; // Scale up by 10%
    } else if (!isHovered && this.isHovered) {
      this.isHovered = false;
      this.targetScale = 1.0; // Return to original scale
    }
    this.scaleStartTime = Date.now();
    this.isScaling = true;
  }

  rotateNode() {
    this.isRotating = true;
    this.rotationStartTime = Date.now();
    this.startRotation = this.nodeContainer.rotation.y;
    this.targetRotation = Math.round(this.startRotation / Math.PI) % 2 === 0 ? Math.PI : 0;
  }

  updateScaleAnimation() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - this.scaleStartTime;
    const duration = 300; // 300ms duration for faster effect
    const progress = Math.min(elapsedTime / duration, 1);

    if (progress < 1) {
      const easedProgress = easeInOutCubic(progress);
      const newScale = this.currentScale + (this.targetScale - this.currentScale) * easedProgress;
      this.setScale(newScale);
    } else {
      this.setScale(this.targetScale);
      this.isScaling = false;
    }
  }

  setScale(scale, duration = 1000) {
    const newScale = new THREE.Vector3(scale, scale, scale);
    updateSize(this.nodeContainer, newScale, duration);
    this.currentScale = scale;
  }

  getObject() {
    return this.object;
  }

  updatePosition(newPosition, duration = 1000) {
    updatePosition(this.object, newPosition, duration);
  }

  update() {
    if (this.isRotating) {
      updateRotation(this.nodeContainer, this.targetRotation, this.movementDuration);
    }

    if (this.isMoving) {
      updatePosition(this.object, this.targetPosition, this.movementDuration);
    }

    if (this.isScaling) {
      this.updateScaleAnimation();
    }
  }

  setPosition(newPosition) {
    this.position.copy(newPosition);
    this.object.position.copy(newPosition);
    // Reset the nodeContainer's position to ensure it's centered on the object
    this.nodeContainer.position.set(0, 0, 0);
  }

  async loadMediaContent() {
    try {
      const mediaFilePath = await getMediaFilePath(this.repoName);
      if (mediaFilePath) {
        const fileStats = await getFileStats(mediaFilePath);
        const fileExtension = mediaFilePath.split('.').pop().toLowerCase();
        
        let mediaType;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          mediaType = 'image';
        } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
          mediaType = 'audio';
        } else {
          console.warn(`Unsupported file type for ${this.repoName}: ${fileExtension}`);
          return;
        }

        this.mediaContent = {
          type: mediaType,
          path: mediaFilePath,
          size: fileStats.size,
          lastModified: fileStats.mtime
        };
        console.log(`Media found for ${this.repoName}:`, this.mediaContent);
      } else {
        console.log(`No media found for ${this.repoName}`);
      }
    } catch (error) {
      console.error(`Error loading media for ${this.repoName}:`, error);
    }
    
    if (!this.mediaContent) {
      this.mediaContent = null;
    }
  }
}

export default DreamNode;
