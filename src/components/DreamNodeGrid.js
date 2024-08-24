import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import DreamNode from './DreamNode';

const DreamNodeGrid = ({ scene }) => {
  const [dreamNodes, setDreamNodes] = useState([]);

  useEffect(() => {
    const loadDreamNodes = async () => {
      // Fetch the list of repositories from your backend
      const response = await fetch('/api/repositories');
      const repos = await response.json();

      const nodes = repos.map((repo, index) => {
        const { x, y } = calculateHoneycombPosition(index, repos.length);
        return new DreamNode({
          scene,
          position: new THREE.Vector3(x, y, 0),
          repoName: repo.name
        });
      });

      setDreamNodes(nodes);
    };

    loadDreamNodes();
  }, [scene]);

  const calculateHoneycombPosition = (index, total) => {
    const hexRadius = 2.2; // Adjust this value to change the spacing between nodes
    const columns = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / columns);
    const col = index % columns;
    const offset = row % 2 === 0 ? 0 : hexRadius * Math.cos(Math.PI / 6);
    
    const x = col * hexRadius * 2 * Math.cos(Math.PI / 6) + offset;
    const y = row * hexRadius * 1.5;

    return { x, y };
  };

  return null; // This component doesn't render anything directly
};

export default DreamNodeGrid;
