import React, { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

const DreamConnection = ({ startNodeName, endNodeName, getNodePosition }) => {
  const [startPos, setStartPos] = useState([0, 0, 0]);
  const [endPos, setEndPos] = useState([0, 0, 0]);
  const lineRef = useRef();

  useEffect(() => {
    console.log('DreamConnection created:', { startNodeName, endNodeName });
  }, [startNodeName, endNodeName]);

  useFrame(() => {
    const newStartPos = getNodePosition(startNodeName);
    const newEndPos = getNodePosition(endNodeName);
    if (newStartPos && newEndPos) {
      setStartPos(newStartPos);
      setEndPos(newEndPos);
    } else {
      console.log('Unable to get positions:', { startNodeName, endNodeName, newStartPos, newEndPos });
    }
  });

  if (!startPos || !endPos || startPos.some(isNaN) || endPos.some(isNaN)) {
    console.log('Invalid positions:', { startPos, endPos });
    return null; // Don't render the line if we don't have valid positions
  }

  return (
    <Line
      ref={lineRef}
      points={[startPos, endPos]}
      color="white"
      lineWidth={2}
      dashed={false}
    />
  );
};

export default DreamConnection;
