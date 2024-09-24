import React, { useState, useCallback, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import DreamNode from './DreamNode';
import { getRepoData } from '../utils/fileUtils';
import { Quaternion, Vector3 } from 'three';

// New constant for interaction types
const INTERACTION_TYPES = {
  NODE_CLICK: 'NODE_CLICK',
  ESCAPE: 'ESCAPE',
};

const MAX_SCALE = 50; // Maximum scale for nodes
const MIN_SCALE = 1; // Minimum scale for nodes
const SPHERE_RADIUS = 1000; // Radius of the sphere for node positioning
const DEFAULT_NODE_STATE = {
  liminalScaleFactor: 1,
  viewScaleFactor: 1,
  isInLiminalView: false,
  isFlipped: false
};

const calculateViewScaleFactor = (node, camera, size) => {
  if (node.isInLiminalView) {
    return node.liminalScaleFactor;
  }
  const tempV = new THREE.Vector3();
  tempV.copy(node.position).project(camera);
  const screenPosition = {
    x: (tempV.x * 0.5 + 0.5) * size.width,
    y: (tempV.y * -0.5 + 0.5) * size.height
  };
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const distanceFromCenter = Math.sqrt(
    (screenPosition.x - centerX) ** 2 + (screenPosition.y - centerY) ** 2
  );
  const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
  const normalizedDistance = distanceFromCenter / maxDistance;
  const focusedDistance = normalizedDistance * 2;
  const scale = MAX_SCALE * (1 - Math.min(1, focusedDistance));
  return Math.max(MIN_SCALE / node.baseScale, Math.min(MAX_SCALE / node.baseScale, scale));
};

const calculateRotation = (originalVector) => {
  const targetVector = new Vector3(0, 0, -1000);
  const normalizedOriginal = originalVector.clone().normalize();
  const normalizedTarget = targetVector.clone().normalize();
  const quaternion = new Quaternion();
  quaternion.setFromUnitVectors(normalizedOriginal, normalizedTarget);
  return quaternion;
};

const applyRotationToPosition = (position, rotation) => {
  return position.applyQuaternion(rotation).normalize().multiplyScalar(SPHERE_RADIUS);
};

const DreamGraph = forwardRef(({ initialNodes, onNodeRightClick, resetCamera }, ref) => {
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isSphericalLayout, setIsSphericalLayout] = useState(true);
  const [centeredNode, setCenteredNode] = useState(null);
  const [interactionHistory, setInteractionHistory] = useState([]);
  const { size } = useThree();

  const { camera } = useThree();
  const tempV = useRef(new THREE.Vector3());

  useEffect(() => {
    console.log('Interaction History:', interactionHistory);
  }, [interactionHistory]);

  const addInteraction = useCallback((type, data) => {
    setInteractionHistory(prev => [...prev, { type, data, timestamp: Date.now() }]);
  }, []);

  useFrame(() => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (!node.isInLiminalView) {
          const newViewScaleFactor = calculateViewScaleFactor(node, camera, size);
          if (Math.abs(node.viewScaleFactor - newViewScaleFactor) > 0.01) {
            return { ...node, viewScaleFactor: newViewScaleFactor };
          }
        }
        return node;
      })
    );
  });

  useEffect(() => {
    const fetchNodesData = async () => {
      const nodesData = await Promise.all(initialNodes.map(async (node) => {
        const { metadata, dreamTalkMedia, dreamSongMedia } = await getRepoData(node.repoName);
        return {
          ...node,
          metadata,
          dreamTalkMedia,
          dreamSongMedia,
          baseScale: 1,
          viewScaleFactor: 1,
          liminalScaleFactor: 1,
          isInLiminalView: false,
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
      return prevNodes.map((node, index) => {
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
    });
    setIsSphericalLayout(false);
  }, [nodes.length]);

  const positionNodesOnSphere = useCallback((centeredNodeIndex = -1) => {
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    
    setNodes(prevNodes => {
      let rotation = new Quaternion();

      if (centeredNodeIndex !== -1) {
        const i = centeredNodeIndex + 1;
        const phi = Math.acos(1 - 2 * i / (prevNodes.length + 1));
        const theta = 2 * Math.PI * i / goldenRatio;

        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = SPHERE_RADIUS * Math.cos(phi);

        const originalVector = new Vector3(x, y, z);
        rotation = calculateRotation(originalVector);

      }

      return prevNodes.map((node, index) => {
        const i = index + 1;
        const phi = Math.acos(1 - 2 * i / (prevNodes.length + 1));
        const theta = 2 * Math.PI * i / goldenRatio;

        const x = SPHERE_RADIUS * Math.sin(phi) * Math.cos(theta);
        const y = SPHERE_RADIUS * Math.sin(phi) * Math.sin(theta);
        const z = SPHERE_RADIUS * Math.cos(phi);

        const originalPosition = new Vector3(x, y, z);
        const rotatedPosition = applyRotationToPosition(originalPosition, rotation);


        return {
          ...node,
          ...DEFAULT_NODE_STATE,
          position: rotatedPosition,
          scale: 1,
          rotation: new THREE.Euler(0, 0, 0),
        };
      });
    });
    setIsSphericalLayout(true);
    setCenteredNode(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        positionNodesOnSphere();
        if (resetCamera) {
          resetCamera();
        }
      });
    }, 100); // Short delay to ensure nodes are loaded

    return () => clearTimeout(timer);
  }, [positionNodesOnSphere, resetCamera]);

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
        { 
          ...clickedNode, 
          position: new THREE.Vector3(0, 0, 0), 
          liminalScaleFactor: 5, 
          viewScaleFactor: 5,
          isInLiminalView: true 
        },
        ...relatedNodes.map((node, index) => {
          const angle = (index / relatedNodes.length) * Math.PI * 2;
          return {
            ...node,
            position: new THREE.Vector3(
              Math.cos(angle) * relatedCircleRadius,
              Math.sin(angle) * relatedCircleRadius,
              0
            ),
            liminalScaleFactor: 1,
            viewScaleFactor: 1,
            isInLiminalView: true
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
            liminalScaleFactor: 0.5,
            viewScaleFactor: 0.5,
            isInLiminalView: true
          };
        })
      ];

      setCenteredNode(clickedNode.repoName);
      return newNodes;
    });
    setIsSphericalLayout(false);
  }, []);

  const handleNodeClick = useCallback((clickedRepoName) => {
    const clickedNodeIndex = nodes.findIndex(node => node.repoName === clickedRepoName);
    if (clickedNodeIndex !== -1) {
      // Reset the flip state of the previously centered node
      if (centeredNode) {
        setNodes(prevNodes => prevNodes.map(node => 
          node.repoName === centeredNode ? { ...node, isFlipped: false } : node
        ));
      }
      updateNodePositions(clickedNodeIndex);
      if (resetCamera) {
        resetCamera();
      }
      addInteraction(INTERACTION_TYPES.NODE_CLICK, { repoName: clickedRepoName });
    }
  }, [nodes, updateNodePositions, resetCamera, centeredNode, addInteraction]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        addInteraction(INTERACTION_TYPES.ESCAPE, {});
        if (centeredNode) {
          const nodeIndex = nodes.findIndex(node => node.repoName === centeredNode);
          if (nodeIndex !== -1) {
            positionNodesOnSphere(nodeIndex);
            if (resetCamera) {
              resetCamera();
            }
          }
        } else if (!isSphericalLayout) {
          positionNodesOnSphere();
          if (resetCamera) {
            resetCamera();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [positionNodesOnSphere, isSphericalLayout, resetCamera, centeredNode, nodes, addInteraction]);

  const renderedNodes = useMemo(() => {
    return nodes.map((node, index) => (
      <DreamNode
        key={node.repoName}
        {...node}
        scale={node.baseScale * (node.isInLiminalView ? node.liminalScaleFactor : node.viewScaleFactor)}
        onNodeClick={handleNodeClick}
        onNodeRightClick={onNodeRightClick}
        isHovered={hoveredNode === node.repoName}
        setHoveredNode={setHoveredNode}
        index={index}
        isCentered={centeredNode === node.repoName}
      />
    ));
  }, [nodes, hoveredNode, handleNodeClick, onNodeRightClick, setHoveredNode, centeredNode]);

  useImperativeHandle(ref, () => ({
    handleUndo: () => {
      setInteractionHistory(prevHistory => {
        if (prevHistory.length < 2) {
          console.log('Nothing to undo');
          return prevHistory;
        }

        const newHistory = prevHistory.slice(0, -1);
        const lastAction = newHistory[newHistory.length - 1];

        console.log('Undoing action:', lastAction);

        // Execute the last action
        switch (lastAction.type) {
          case INTERACTION_TYPES.NODE_CLICK:
            handleNodeClick(lastAction.data.repoName);
            break;
          case INTERACTION_TYPES.ESCAPE:
            if (centeredNode) {
              const nodeIndex = nodes.findIndex(node => node.repoName === centeredNode);
              if (nodeIndex !== -1) {
                positionNodesOnSphere(nodeIndex);
                if (resetCamera) {
                  resetCamera();
                }
              }
            } else if (!isSphericalLayout) {
              positionNodesOnSphere();
              if (resetCamera) {
                resetCamera();
              }
            }
            break;
          default:
            console.log('Unknown action type:', lastAction.type);
        }

        return newHistory;
      });
    }
  }));

  return <>{renderedNodes}</>;
});

export default DreamGraph;
