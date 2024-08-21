import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';

class DreamNode {
  constructor(scene, position = new THREE.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.position = position;
    this.disc = null;
    this.textMeshFront = null;
    this.textMeshBack = null;

    this.createDisc();
    this.createText();
  }

  createDisc() {
    const geometry = new THREE.CylinderGeometry(2, 2, 0.05, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0x4287f5 });  // Blue disc
    this.disc = new THREE.Mesh(geometry, material);
    this.disc.rotation.x = Math.PI / 2; // Rotate 90 degrees around X-axis
    this.disc.position.copy(this.position);
    this.scene.add(this.disc);
  }

  createText() {
    const loader = new FontLoader();
    loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
      const textMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });  // White text

      // DreamTalk (front)
      const textGeometryFront = new TextGeometry('DreamTalk', {
        font: font,
        size: 0.3,
        height: 0.05,
      });
      this.textMeshFront = new THREE.Mesh(textGeometryFront, textMaterial);
      this.textMeshFront.position.set(-0.9, 0.03, 0);
      this.textMeshFront.rotation.x = -Math.PI / 2;
      this.disc.add(this.textMeshFront);

      // DreamSong (back)
      const textGeometryBack = new TextGeometry('DreamSong', {
        font: font,
        size: 0.3,
        height: 0.05,
      });
      this.textMeshBack = new THREE.Mesh(textGeometryBack, textMaterial);
      this.textMeshBack.position.set(0.9, -0.03, 0);
      this.textMeshBack.rotation.x = Math.PI / 2;
      this.textMeshBack.rotation.y = Math.PI;
      this.disc.add(this.textMeshBack);
    });
  }

  rotate(speed) {
    if (this.disc) {
      this.disc.rotation.y += speed;
    }
  }
}

export default DreamNode;
