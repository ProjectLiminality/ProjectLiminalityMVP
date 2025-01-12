import { useState, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { scanDreamVault } from '../services/electronService';

const SPHERE_RADIUS = 1000;

const useDreamNodes = (initialCount = 50) => {
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);

  const fetchNodes = useCallback(async (count, random = true) => {
    try {
      console.log('Scanning DreamVault...');
      const repos = await scanDreamVault();
      console.log('Repos found:', repos);
      if (repos.length > 0) {
        let selectedRepos = random
          ? repos.sort(() => 0.5 - Math.random()).slice(0, count)
          : repos.slice(0, count);
        
        console.log('Setting DreamNodes:', selectedRepos);
        const newNodes = selectedRepos.map((repo, index) => ({
          repoName: repo,
          position: calculateNodePosition(index, selectedRepos.length),
        }));
        
        setDreamNodes(prevNodes => [...prevNodes, ...newNodes]);
      } else {
        console.error('No repositories found in the DreamVault');
        setError('No repositories found in the DreamVault');
      }
    } catch (error) {
      console.error('Error scanning dream vault:', error);
      setError('Error scanning dream vault: ' + error.message);
    }
  }, []);

  const spawnNode = useCallback(async (repoName) => {
    try {
      console.log(`Attempting to spawn node: ${repoName}`);
      const repos = await scanDreamVault();
      const repo = repos.find(r => r === repoName);
      if (repo) {
        setDreamNodes(prevNodes => {
          if (prevNodes.some(node => node.repoName === repoName)) {
            console.log(`Node ${repoName} already exists. No action taken.`);
            return prevNodes;
          }
          const newNode = {
            repoName: repo,
            position: calculateNodePosition(prevNodes.length, prevNodes.length + 1),
          };
          console.log(`Node spawned: ${repoName}`);
          return [...prevNodes, newNode];
        });
      } else {
        console.error(`Repository not found: ${repoName}`);
      }
    } catch (error) {
      console.error('Error spawning node:', error);
      setError('Error spawning node: ' + error.message);
    }
  }, []);

  useEffect(() => {
    fetchNodes(initialCount);
  }, [fetchNodes, initialCount]);

  return { dreamNodes, setDreamNodes, error, spawnNode };
};

const calculateNodePosition = (index, total) => {
  const phi = Math.acos(1 - 2 * (index + 1) / (total + 1));
  const theta = 2 * Math.PI * (index + 1) / ((1 + Math.sqrt(5)) / 2);
  const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
  const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
  const z = SPHERE_RADIUS * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
};

export default useDreamNodes;
