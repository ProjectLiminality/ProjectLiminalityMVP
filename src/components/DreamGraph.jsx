import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import DreamNode3DR3F from './DreamNode';

const DreamGraph = ({ initialNodes, onOpenMetadataPanel, onNodeRightClick }) => {
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

  // New useEffect hook for Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        positionNodesOnGrid();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [positionNodesOnGrid]);

  const updateNodePositions = useCallback((clickedNodeIndex) => {
    setNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      const otherNodes = prevNodes.filter((_, index) => index !== clickedNodeIndex);
      
      const relatedNodes = otherNodes.filter(node => node.metadata?.type !== clickedNode.metadata?.type);
      const unrelatedNodes = otherNodes.filter(node => node.metadata?.type === clickedNode.metadata?.type);
      
      const relatedCount = Math.max(1, Math.min(relatedNodes.length, Math.floor(Math.random() * relatedNodes.length) + 1));
      const selectedRelatedNodes = relatedNodes.slice(0, relatedCount);
      const remainingUnrelatedNodes = [...unrelatedNodes, ...relatedNodes.slice(relatedCount)];

      const relatedCircleRadius = 30;
      const unrelatedCircleRadius = 200;

      const newNodes = [
        { ...clickedNode, position: new THREE.Vector3(0, 0, 0), scale: 5 },
        ...selectedRelatedNodes.map((node, index) => {
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
        ...remainingUnrelatedNodes.map((node, index) => {
          const angle = (index / remainingUnrelatedNodes.length) * Math.PI * 2;
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

  const handleNodeRightClick = useCallback((repoName) => {
    onNodeRightClick(repoName);
  }, [onNodeRightClick]);

  return (
    <>
      {nodes.map((node, index) => (
        <DreamNode3DR3F
          key={node.repoName}
          repoName={node.repoName}
          position={node.position}
          scale={node.scale}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
          isHovered={hoveredNode === node.repoName}
          setHoveredNode={setHoveredNode}
          index={index}
          type={node.type}
        />
      ))}
    </>
  );
};

export default DreamGraph;
