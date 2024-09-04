import React, { useCallback } from 'react';

const DreamGraph = ({ dreamNodes, updateNode }) => {
  const handleNodeClick = useCallback((clickedNodeIndex) => {
    const clickedNode = dreamNodes[clickedNodeIndex];
    if (clickedNode) {
      dreamNodes.forEach((node, index) => {
        updateNode(index, { position: clickedNode.position });
      });
    }
  }, [dreamNodes, updateNode]);

  // This component doesn't render anything visible
  return null;
};

export default DreamGraph;
