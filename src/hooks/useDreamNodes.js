import { useState, useEffect } from 'react';
import * as THREE from 'three';
import { scanDreamVault } from '../services/electronService';

const SPHERE_RADIUS = 1000; // Radius of the sphere for node positioning

const useDreamNodes = () => {
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDreamNodes = async (count = 30, random = true, useCount = false) => {
      try {
        console.log('Scanning DreamVault...');
        const repos = await scanDreamVault();
        console.log('Repos found:', repos);
        if (repos.length > 0) {
          let selectedRepos = repos;
          if (useCount) {
            selectedRepos = random
              ? repos.sort(() => 0.5 - Math.random()).slice(0, count)
              : repos.slice(0, count);
          } else if (random) {
            selectedRepos = repos.sort(() => 0.5 - Math.random());
          }
          console.log('Setting DreamNodes:', selectedRepos);
          const newNodes = selectedRepos.map((repo, index) => {
            const phi = Math.acos(1 - 2 * (index + 1) / (selectedRepos.length + 1));
            const theta = 2 * Math.PI * (index + 1) / ((1 + Math.sqrt(5)) / 2);
            const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
            const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
            const z = SPHERE_RADIUS * Math.cos(phi);
            return {
              repoName: repo,
              position: new THREE.Vector3(x, y, z)
            };
          });
          setDreamNodes(newNodes);
        } else {
          console.error('No repositories found in the DreamVault');
          setError('No repositories found in the DreamVault');
        }
      } catch (error) {
        console.error('Error scanning dream vault:', error);
        setError('Error scanning dream vault: ' + error.message);
      }
    };

    // Call fetchDreamNodes with useCount set to false to disable the count limit
    fetchDreamNodes(30, true, false);
  }, []);

  return { dreamNodes, setDreamNodes, error };
};

export default useDreamNodes;
