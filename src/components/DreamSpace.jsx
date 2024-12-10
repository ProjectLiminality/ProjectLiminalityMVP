import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import DreamGraph from './DreamGraph';
import CameraController from './CameraController';
import useDreamNodes from '../hooks/useDreamNodes';

const DreamSpace = ({ onNodeRightClick, onFileRightClick, dreamGraphRef, onDrop, onHover }) => {
  const { dreamNodes, error, spawnNode } = useDreamNodes(5); // Set initial count to 5
  const [resetCamera, setResetCamera] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [lastSearchResults, setLastSearchResults] = useState([]);
  const searchCountRef = useRef(0);

  const handleNodeRightClick = (event, repoName) => {
    onNodeRightClick(repoName, event);
  };

  const onResetCamera = useCallback((resetFunc) => {
    setResetCamera(() => resetFunc);
  }, []);

  const handleSpawnSearchResults = useCallback(async (searchResults) => {
    searchCountRef.current += 1;
    const currentSearchCount = searchCountRef.current;
    console.log(`Search #${currentSearchCount} initiated with ${searchResults.length} results`);

    // Check if the new search results are different from the last ones
    const areResultsDifferent = JSON.stringify(searchResults) !== JSON.stringify(lastSearchResults);
    
    if (areResultsDifferent) {
      console.log(`Search #${currentSearchCount}: New search results received, spawning nodes...`);
      for (const result of searchResults) {
        await spawnNode(result.repoName);
      }
      // After spawning all nodes, update the graph
      if (dreamGraphRef.current) {
        dreamGraphRef.current.displaySearchResults(searchResults);
      }
      // Update the last search results
      setLastSearchResults(searchResults);
      console.log(`Search #${currentSearchCount}: Processing complete`);
    } else {
      console.log(`Search #${currentSearchCount}: Search results unchanged, skipping node spawn`);
    }
  }, [spawnNode, lastSearchResults]);

  const handleSpawnRelatedNodes = useCallback(async (relatedNodeNames) => {
    console.log(`Spawning related nodes: ${relatedNodeNames.join(', ')}`);
    for (const nodeName of relatedNodeNames) {
      await spawnNode(nodeName);
    }
  }, [spawnNode]);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    if (hoveredNode) {
      console.log(`Item dropped on ${hoveredNode}`);
    } else {
      onDrop(event);
    }
  }, [hoveredNode, onDrop]);

  const handleHover = useCallback((repoName) => {
    setHoveredNode(repoName);
    if (onHover) {
      onHover(repoName);
    }
  }, [onHover]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && resetCamera) {
        resetCamera();
      }
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        spawnNode('LiminalConsulting');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragover', (e) => e.preventDefault());
      window.removeEventListener('drop', handleDrop);
    };
  }, [resetCamera, handleDrop, spawnNode]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 100], fov: 75, near: 0.1, far: 3000 }}>
        <CameraController onResetCamera={onResetCamera} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {dreamNodes.length > 0 && (
          <DreamGraph 
            ref={dreamGraphRef}
            initialNodes={dreamNodes} 
            onNodeRightClick={handleNodeRightClick}
            onFileRightClick={onFileRightClick}
            resetCamera={resetCamera}
            onHover={handleHover}
            onSpawnSearchResults={handleSpawnSearchResults}
            onSpawnRelatedNodes={handleSpawnRelatedNodes}
          />
        )}
      </Canvas>
      {dreamNodes.length === 0 && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
    </div>
  );
};

export default DreamSpace;
