import * as THREE from 'three';
import DreamNode from './DreamNode';

class DreamNodeGrid {
  constructor({ scene, camera }) {
    this.scene = scene;
    this.camera = camera;
    this.dreamNodes = [];
    this.layouts = {
      grid: this.calculateGridPosition,
      circle: this.calculateCirclePosition,
      // Add more layouts as needed
    };
    this.currentLayout = 'grid';
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.init();
    this.addEventListeners();
  }

  addEventListeners() {
    window.addEventListener('click', this.onClick.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }

  onClick(event) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    for (let intersect of intersects) {
      let object = intersect.object;
      while (object.parent && !object.userData.dreamNode) {
        object = object.parent;
      }
      if (object.userData.dreamNode) {
        this.centerOnNode(object.userData.dreamNode);
        break;
      }
    }
  }

  centerOnNode(clickedNode) {
    const centerPosition = new THREE.Vector3(0, 0, 0);
    const offset = new THREE.Vector3().subVectors(centerPosition, clickedNode.position);

    this.dreamNodes.forEach(node => {
      const newPosition = new THREE.Vector3().addVectors(node.position, offset);
      node.updatePosition(newPosition);
    });
  }

  onMouseMove(event) {
    this.updateMousePosition(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    
    this.dreamNodes.forEach(node => {
      const isHovered = intersects.some(intersect => {
        let object = intersect.object;
        while (object.parent && !object.userData.dreamNode) {
          object = object.parent;
        }
        return object.userData.dreamNode === node;
      });
      node.onHover(isHovered);
    });
  }

  updateMousePosition(event) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  async init() {
    console.log("Initializing DreamNodeGrid");
    if (window.electron) {
      const repos = await window.electron.scanDreamVault();
      console.log("Found repositories:", repos);
      await this.createDreamNodes(repos);
    }
  }

  async createDreamNodes(repos) {
    this.dreamNodes = await Promise.all(repos.map(async (repoName, index) => {
      const position = this.layouts[this.currentLayout](index, repos.length);
      const metadata = await this.readMetadata(repoName);
      const dreamNode = new DreamNode({ scene: this.scene, position, repoName, metadata });
      this.scene.add(dreamNode.getObject());
      return dreamNode;
    }));
    console.log(`Created ${this.dreamNodes.length} DreamNodes`);
  }

  async readMetadata(repoName) {
    try {
      const response = await fetch(`/${repoName}/.pl`);
      if (!response.ok) {
        console.warn(`HTTP error for ${repoName}! status: ${response.status}`);
        return this.getDefaultMetadata(repoName);
      }

      const text = await response.text();
      console.log(`Raw .pl content for ${repoName}:`, text);

      // Parse the .pl file content
      const lines = text.split('\n');
      const metadata = {};
      for (const line of lines) {
        const [key, value] = line.split(':').map(part => part.trim());
        if (key && value) {
          metadata[key] = value;
        }
      }

      console.log(`Parsed metadata for ${repoName}:`, metadata);

      // Ensure the metadata has a 'type' field
      if (!metadata.type) {
        console.warn(`No 'type' field found in metadata for ${repoName}, using default.`);
        metadata.type = 'idea';
      }

      return metadata;
    } catch (error) {
      console.error(`Error reading metadata for ${repoName}:`, error);
      return this.getDefaultMetadata(repoName);
    }
  }

  getDefaultMetadata(repoName) {
    return {
      type: 'idea',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      interactions: 0,
      relatedNodes: []
    };
  }

  calculateGridPosition(index, total) {
    const hexRadius = 2.2; // Increased spacing between nodes
    const columns = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / columns);

    const gridWidth = columns * hexRadius * 2;
    const gridHeight = rows * hexRadius * Math.sqrt(3);

    const startX = -gridWidth / 2;
    const startY = gridHeight / 2;

    const row = Math.floor(index / columns);
    const col = index % columns;
    const offset = row % 2 === 0 ? 0 : hexRadius;

    const x = startX + col * hexRadius * 2 + offset;
    const y = startY - row * hexRadius * Math.sqrt(3);

    return new THREE.Vector3(x, y, 0);
  }

  calculateCirclePosition(index, total) {
    const radius = Math.sqrt(total) * 1.5;
    const angle = (index / total) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return new THREE.Vector3(x, y, 0);
  }

  getDreamNodes() {
    return this.dreamNodes;
  }

  update() {
    this.dreamNodes.forEach(node => node.update());
  }

  changeLayout(newLayout) {
    if (this.layouts[newLayout]) {
      this.currentLayout = newLayout;
      this.updateNodePositions();
    } else {
      console.error(`Layout '${newLayout}' not found`);
    }
  }

  updateNodePositions() {
    this.dreamNodes.forEach((node, index) => {
      const newPosition = this.layouts[this.currentLayout](index, this.dreamNodes.length);
      node.updatePosition(newPosition);
    });
  }

  scaleNodes(scale) {
    this.dreamNodes.forEach(node => {
      node.updateScale(scale);
    });
  }
}

export default DreamNodeGrid;
