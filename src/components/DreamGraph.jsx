import React, { useState, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import DreamNode from './DreamNode';
import { getRepoData } from '../utils/fileUtils';

const SPHERE_RADIUS = 200; // Adjust this value to match your camera distance

const DreamGraph = ({ initialNodes, onNodeRightClick }) => {
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);

  useEffect(() => {
    const fetchNodesData = async () => {
      const nodesData = await Promise.all(initialNodes.map(async (node) => {
        const { metadata, mediaContent } = await getRepoData(node.repoName);
        return {
          ...node,
          metadata,
          mediaContent,
          scale: 1,
          position: new THREE.Vector3(0, 0, 0)
        };
      }));
      setNodes(nodesData);
    };
    fetchNodesData();
  }, [initialNodes]);

  const positionNodesOnGrid = useCallback(() => {
    const gridSize = Math.ceil(Math.sqrt(nodes.length));
    const spacing = 10;
    
    setNodes(prevNodes => {
      const newNodes = prevNodes.map((node, index) => {
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
      });

      console.log('DreamGraph - Nodes positioned on grid:', newNodes.map(node => ({
        repoName: node.repoName,
        position: node.position,
        scale: node.scale,
        type: node.metadata?.type
      })));

      return newNodes;
    });
  }, [nodes.length]);

  useEffect(() => {
    positionNodesOnSphere();
  }, [positionNodesOnSphere]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        positionNodesOnSphere();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [positionNodesOnSphere]);

  const positionNodesOnSphere = useCallback(() => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    setNodes(prevNodes => {
      const newNodes = prevNodes.map((node, index) => {
        const i = index + 1;
        const phi = Math.acos(1 - 2 * i / (nodes.length + 1));
        const theta = 2 * Math.PI * i / goldenRatio;

        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = SPHERE_RADIUS * Math.cos(phi);

        return {
          ...node,
          position: new THREE.Vector3(x, y, z),
          scale: 1
        };
      });

      console.log('DreamGraph - Nodes positioned on sphere:', newNodes.map(node => ({
        repoName: node.repoName,
        position: node.position,
        scale: node.scale,
        type: node.metadata?.type
      })));

      return newNodes;
    });
  }, [nodes.length]);

  const updateNodePositions = useCallback((clickedNodeIndex) => {
    setNodes(prevNodes => {
      const clickedNode = prevNodes[clickedNodeIndex];
      const otherNodes = prevNodes.filter((_, index) => index !== clickedNodeIndex);
      
      const relatedNodes = otherNodes.filter(node => 
        clickedNode.metadata?.relatedNodes?.includes(node.repoName) && 
        node.metadata?.type !== clickedNode.metadata?.type
      );
      const unrelatedNodes = otherNodes.filter(node => 
        !clickedNode.metadata?.relatedNodes?.includes(node.repoName) || 
        node.metadata?.type === clickedNode.metadata?.type
      );

      const relatedCircleRadius = 30;
      const unrelatedCircleRadius = 200;

      const newNodes = [
        { ...clickedNode, position: new THREE.Vector3(0, 0, 0), scale: 5 },
        ...relatedNodes.map((node, index) => {
          const angle = (index / relatedNodes.length) * Math.PI * 2;
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
      console.log('DreamGraph - Node clicked:', {
        clickedNode: nodes[clickedNodeIndex],
        allNodes: nodes.map(node => ({
          repoName: node.repoName,
          type: node.metadata?.type,
          relatedNodes: node.metadata?.relatedNodes
        }))
      });
      updateNodePositions(clickedNodeIndex);
    }
  }, [nodes, updateNodePositions]);

  return (
    <>
      {nodes.map((node, index) => (
        <DreamNode
          key={node.repoName}
          {...node}
          onNodeClick={handleNodeClick}
          onNodeRightClick={onNodeRightClick}
          isHovered={hoveredNode === node.repoName}
          setHoveredNode={setHoveredNode}
          index={index}
        />
      ))}
    </>
  );
};

export default DreamGraph;
