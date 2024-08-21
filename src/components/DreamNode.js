import React from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';

class DreamNode {
  constructor({ scene, position = new THREE.Vector3(0, 0, 0) }) {
    this.scene = scene;
    this.position = position;
    this.object = new THREE.Object3D();
    this.discRef = null;
    this.frontRef = null;
    this.backRef = null;
    this.isRotating = false;
    this.targetRotation = 0;

    this.init();
  }

  init() {
    this.createDisc();
    this.createFrontElement();
    this.createBackElement();
    this.addClickListener();
  }

  createDisc() {
    const geometry = new THREE.CylinderGeometry(2, 2, 0.1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x4287f5 });  // Blue disc
    const disc = new THREE.Mesh(geometry, material);
    disc.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
    disc.position.copy(this.position);
    this.object.add(disc);
    this.discRef = disc;
  }

  addClickListener() {
    this.discRef.userData.clickable = true;
    this.scene.addEventListener('click', this.onNodeClick.bind(this));
  }

  onNodeClick(event) {
    const intersects = event.intersects;
    if (intersects.length > 0) {
      const clickedObject = intersects[0].object;
      if (clickedObject === this.discRef && !this.isRotating) {
        this.rotateNode();
      }
    }
  }

  rotateNode() {
    this.isRotating = true;
    this.targetRotation = this.object.rotation.y + Math.PI;
  }

  update() {
    if (this.isRotating) {
      const rotationSpeed = 0.1;
      this.object.rotation.y += rotationSpeed;
      if (Math.abs(this.object.rotation.y - this.targetRotation) < 0.1) {
        this.object.rotation.y = this.targetRotation;
        this.isRotating = false;
      }
    }
  }

  createHTMLElement(Component, position, rotation) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const reactRoot = document.createElement('div');
    reactRoot.style.width = '1024px';
    reactRoot.style.height = '1024px';
    
    ReactDOM.render(React.createElement(Component), reactRoot);

    const htmlRenderer = new CSS3DRenderer();
    htmlRenderer.setSize(1024, 1024);
    htmlRenderer.domElement.style.position = 'absolute';
    htmlRenderer.domElement.style.top = '0';
    document.body.appendChild(htmlRenderer.domElement);

    const tempScene = new THREE.Scene();
    const tempCamera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    tempCamera.position.z = 1;
    
    const cssObject = new CSS3DObject(reactRoot);
    tempScene.add(cssObject);

    htmlRenderer.render(tempScene, tempCamera);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new THREE.PlaneGeometry(4, 4);
    const plane = new THREE.Mesh(geometry, material);

    plane.position.copy(position);
    plane.rotation.copy(rotation);

    this.object.add(plane);

    // Remove the temporary renderer
    document.body.removeChild(htmlRenderer.domElement);

    return { element: reactRoot, object: plane };
  }

  createFrontElement() {
    this.frontRef = this.createHTMLElement(
      DreamTalk,
      new THREE.Vector3(0, 0.051, 0),
      new THREE.Euler(0, 0, 0)
    );
  }

  createBackElement() {
    this.backRef = this.createHTMLElement(
      DreamSong,
      new THREE.Vector3(0, -0.051, 0),
      new THREE.Euler(0, Math.PI, 0)
    );
  }

  getObject() {
    return this.object;
  }
}

export default DreamNode;
