import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import DreamNode3DR3F from './DreamNode3DR3F';

const DreamGraph = ({ initialNodes, onOpenMetadataPanel }) => {
  const [nodes, setNodes] = useState(initialNodes.map(node => ({ ...node, scale: 1 })));
  const [hoveredNode, setHoveredNode] = useState(null);

  const positionNodesOnGrid = useCallback(() => {
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 10;
    
    setNodes(prevNodes => prevNodes.map((node, index) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      return {
        ...node,
        position: new THREE.Vector3(
          (col - gridSize / 2) * spacing,
          (row - gridSize / 2) * spacing,
          0
        ),
        scale: 1
      };
    }));
  }, [nodes.length]);

  useEffect(() => {
    positionNodesOnGrid();
  }, [positionNodesOnGrid]);

  const updateNodePositions = useCallback((clickedNodeIndex) => {
    setNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      const otherNodes = prevNodes.filter((_, index) => index !== clickedNodeIndex);
      
      const relatedCount = Math.floor(Math.random() * (otherNodes.length / 2)) + 1;
      const relatedNodes = otherNodes.slice(0, relatedCount);
      const unrelatedNodes = otherNodes.slice(relatedCount);

      const relatedCircleRadius = 30;
      const unrelatedCircleRadius = 200;

      const newNodes = [
        { ...clickedNode, position: new THREE.Vector3(0, 0, 0), scale: 5 },
        ...relatedNodes.map((node, index) => {
          const angle = (index / relatedCount) * Math.PI * 2;
          return {
            ...node,
            position: new THREE.Vector3(
              Math.cos(angle) * relatedCircleRadius,
              Math.sin(angle) * relatedCircleRadius,
              0
            ),
            scale: 1
          };
        }),
        ...unrelatedNodes.map((node, index) => {
          const angle = (index / unrelatedNodes.length) * Math.PI * 2;
          return {
            ...node,
            position: new THREE.Vector3(
              Math.cos(angle) * unrelatedCircleRadius,
              Math.sin(angle) * unrelatedCircleRadius,
              0
            ),
            scale: 1
          };
        })
      ];

      return newNodes;
    });
  }, []);

  const handleNodeClick = useCallback((repoName) => {
    const clickedNodeIndex = nodes.findIndex(node => node.repoName === repoName);
    if (clickedNodeIndex !== -1) {
      updateNodePositions(clickedNodeIndex);
    }
    onOpenMetadataPanel(repoName);
  }, [nodes, updateNodePositions, onOpenMetadataPanel]);

  return (
    <>
      {nodes.map((node, index) => (
        <DreamNode3DR3F
          key={node.repoName}
          repoName={node.repoName}
          position={node.position}
          scale={node.scale}
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
