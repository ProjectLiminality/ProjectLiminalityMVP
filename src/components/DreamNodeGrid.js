import * as THREE from 'three';
import DreamNode from './DreamNode';

class DreamNodeGrid {
  constructor({ scene, camera }) {
    this.scene = scene;
    this.camera = camera;
    this.dreamNodes = [];
    this.init();
  }

  async init() {
    console.log("Initializing DreamNodeGrid");
    if (window.electron) {
      const repos = await window.electron.scanDreamVault();
      console.log("Found repositories:", repos);
      this.createDreamNodes(repos);
    }
  }

  createDreamNodes(repos) {
    this.dreamNodes = repos.map((repoName, index) => {
      const position = this.calculateGridPosition(index, repos.length);
      const isRed = index % 5 === 0; // Make every 5th node red
      const dreamNode = new DreamNode({ scene: this.scene, position, repoName, isRed });
      const dreamNodeObject = dreamNode.getObject();
      this.scene.add(dreamNodeObject);
      return dreamNode;
    });
    console.log(`Created ${this.dreamNodes.length} DreamNodes`);
  }

  calculateGridPosition(index, total) {
    const hexRadius = 1.5; // Reduced radius for smaller nodes
    const columns = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / columns);

    const gridWidth = columns * hexRadius * 2 * Math.cos(Math.PI / 6);
    const gridHeight = rows * hexRadius * 1.5;

    const startX = -gridWidth / 2;
    const startY = gridHeight / 2;

    const row = Math.floor(index / columns);
    const col = index % columns;
    const offset = row % 2 === 0 ? 0 : hexRadius * Math.cos(Math.PI / 6);

    const x = startX + col * hexRadius * 2 * Math.cos(Math.PI / 6) + offset;
    const y = startY - row * hexRadius * 1.5;

    return new THREE.Vector3(x, y, 0);
  }

  getDreamNodes() {
    return this.dreamNodes;
  }

  update() {
    this.dreamNodes.forEach(node => node.update());
  }
}

export default DreamNodeGrid;
