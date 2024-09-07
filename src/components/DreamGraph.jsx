import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import DreamNode3DR3F from './DreamNode3DR3F';

const DreamGraph = ({ initialNodes, onOpenMetadataPanel }) => {
  const [nodes, setNodes] = useState(initialNodes);
  const [hoveredNode, setHoveredNode] = useState(null);

  console.log('DreamGraph rendered. Initial nodes:', initialNodes);

  const positionNodesOnGrid = useCallback(() => {
    console.log('Positioning nodes on grid');
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 200;
    
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
    console.log('Updating node positions. Clicked node index:', clickedNodeIndex);
    setNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      const otherNodes = prevNodes.filter((_, index) => index !== clickedNodeIndex);
      
      // Randomly select related nodes (between 1 and half of the remaining nodes)
      const relatedCount = Math.floor(Math.random() * (otherNodes.length / 2)) + 1;
      const relatedNodes = otherNodes.slice(0, relatedCount);
      const unrelatedNodes = otherNodes.slice(relatedCount);

      console.log('Related nodes count:', relatedNodes.length);
      console.log('Unrelated nodes count:', unrelatedNodes.length);

      // Set up circles
      const relatedCircleRadius = 300;
      const unrelatedCircleRadius = 2000; // Outside field of view

      // Create new nodes array with updated positions
      const newNodes = [
        // Clicked node at origin
        { ...clickedNode, position: new THREE.Vector3(0, 0, 0) },
        
        // Related nodes
        ...relatedNodes.map((node, index) => {
          const angle = (index / relatedCount) * Math.PI * 2;
          return {
            ...node,
            position: new THREE.Vector3(
              Math.cos(angle) * relatedCircleRadius,
              Math.sin(angle) * relatedCircleRadius,
              0
            )
          };
        }),
        
        // Unrelated nodes
        ...unrelatedNodes.map((node, index) => {
          const angle = (index / unrelatedNodes.length) * Math.PI * 2;
          return {
            ...node,
            position: new THREE.Vector3(
              Math.cos(angle) * unrelatedCircleRadius,
              Math.sin(angle) * unrelatedCircleRadius,
              0
            )
          };
        })
      ];

      console.log('New node positions:', newNodes.map(n => ({ repoName: n.repoName, position: n.position.toArray() })));
      return newNodes;
    });
  }, []);

  const handleNodeClick = useCallback((repoName) => {
    console.log('Node clicked:', repoName);
    const clickedNodeIndex = nodes.findIndex(node => node.repoName === repoName);
    console.log('Clicked node index:', clickedNodeIndex);
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
