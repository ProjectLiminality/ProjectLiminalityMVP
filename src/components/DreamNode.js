import React, { useRef, useEffect, useState } from 'react';
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

    this.init();
  }

  init() {
    this.createDisc();
    this.createFrontElement();
    this.createBackElement();
  }

  createDisc() {
    const geometry = new THREE.CylinderGeometry(2, 2, 0.05, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x4287f5 });  // Blue disc
    const disc = new THREE.Mesh(geometry, material);
    disc.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
    disc.position.copy(this.position);
    this.object.add(disc);
    this.discRef = disc;
  }

  createHTMLElement(Component, position, rotation) {
    const element = document.createElement('div');
    element.style.width = '400px';
    element.style.height = '400px';
    element.style.background = 'rgba(0,0,0,0.1)';
    element.style.border = '1px solid white';

    const reactRoot = document.createElement('div');
    element.appendChild(reactRoot);

    const cssObject = new CSS3DObject(element);
    cssObject.position.copy(position);
    cssObject.rotation.copy(rotation);
    cssObject.scale.set(0.005, 0.005, 0.005);  // Scale down to fit on the disc

    this.object.add(cssObject);

    ReactDOM.render(React.createElement(Component), reactRoot);

    return { element: reactRoot, object: cssObject };
  }

  createFrontElement() {
    this.frontRef = this.createHTMLElement(
      DreamTalk,
      new THREE.Vector3(0, 0.03, 0),
      new THREE.Euler(-Math.PI / 2, 0, 0)
    );
  }

  createBackElement() {
    this.backRef = this.createHTMLElement(
      DreamSong,
      new THREE.Vector3(0, -0.03, 0),
      new THREE.Euler(Math.PI / 2, 0, Math.PI)
    );
  }

  getObject() {
    return this.object;
  }
}

export default DreamNode;
