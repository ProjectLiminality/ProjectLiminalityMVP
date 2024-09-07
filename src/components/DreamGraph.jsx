import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import DreamNode3DR3F from './DreamNode3DR3F';

const DreamGraph = ({ initialNodes }) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [hoveredNode, setHoveredNode] = useState(null);

  const positionNodesOnGrid = useCallback(() => {
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 200; // Increased spacing to 10000 (50 times the original value)
    
    setNodes(prevNodes => prevNodes.map((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      return {
        ...node,
        position: new THREE.Vector3(
          (col - gridSize / 2) * spacing,
          (row - gridSize / 2) * spacing,
          0
        )
      };
    }));
  }, [nodes.length]);

  useEffect(() => {
    positionNodesOnGrid();
  }, [positionNodesOnGrid]);

  const updateNodePositions = useCallback((clickedNodeIndex) => {
    setNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      return prevNodes.map(node => ({
        ...node,
        position: clickedNode.position.clone()
      }));
    });
  }, []);

  const handleNodeClick = useCallback((repoName) => {
    const clickedNodeIndex = nodes.findIndex(node => node.repoName === repoName);
    if (clickedNodeIndex !== -1) {
      updateNodePositions(clickedNodeIndex);
    }
    console.log('Node clicked:', repoName);
  }, [nodes, updateNodePositions]);

  return (
    <>
      {nodes.map((node, index) => (
        <DreamNode3DR3F
          key={node.repoName}
          repoName={node.repoName}
          position={node.position}
          onNodeClick={handleNodeClick}
          isHovered={hoveredNode === node.repoName}
          setHoveredNode={setHoveredNode}
          index={index}
        />
      ))}
    </>
  );
};

export default DreamGraph;
