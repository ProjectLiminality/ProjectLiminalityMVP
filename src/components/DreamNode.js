import React, { useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';

const DreamNode = ({ scene, position = new THREE.Vector3(0, 0, 0) }) => {
  const discRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  useEffect(() => {
    const createDisc = () => {
      const geometry = new THREE.CylinderGeometry(2, 2, 0.05, 32);
      const material = new THREE.MeshPhongMaterial({ color: 0x4287f5 });  // Blue disc
      const disc = new THREE.Mesh(geometry, material);
      disc.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
      disc.position.copy(position);
      scene.add(disc);
      discRef.current = disc;
    };

    const createHTMLElement = (Component, position, rotation) => {
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

      discRef.current.add(cssObject);

      return { element: reactRoot, object: cssObject };
    };

    createDisc();

    const frontElement = createHTMLElement(
      DreamTalk,
      new THREE.Vector3(0, 0.03, 0),
      new THREE.Euler(-Math.PI / 2, 0, 0)
    );
    frontRef.current = frontElement;

    const backElement = createHTMLElement(
      DreamSong,
      new THREE.Vector3(0, -0.03, 0),
      new THREE.Euler(Math.PI / 2, 0, Math.PI)
    );
    backRef.current = backElement;

    // Clean up function
    return () => {
      scene.remove(discRef.current);
    };
  }, [scene, position]);

  useEffect(() => {
    if (frontRef.current && backRef.current) {
      ReactDOM.render(<DreamTalk />, frontRef.current.element);
      ReactDOM.render(<DreamSong />, backRef.current.element);
    }
  }, []);

  return null;  // This component doesn't render anything directly in React
};

export default DreamNode;
