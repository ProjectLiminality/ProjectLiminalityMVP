import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

const DreamConnection = ({ startNodeName, endNodeName, getNodePosition }) => {
  const [startPos, setStartPos] = useState([0, 0, 0]);
  const [endPos, setEndPos] = useState([0, 0, 0]);
  const lineRef = useRef();

  useFrame(() => {
    const newStartPos = getNodePosition(startNodeName);
    const newEndPos = getNodePosition(endNodeName);
    if (newStartPos && newEndPos) {
      setStartPos(newStartPos);
      setEndPos(newEndPos);
    }
  });

  return (
    <Line
      ref={lineRef}
      points={[startPos, endPos]}
      color="white"
      lineWidth={1}
      dashed={true}
    />
  );
};

export default DreamConnection;
