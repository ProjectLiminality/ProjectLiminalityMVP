import React from 'react';
import { Line } from '@react-three/drei';

const DreamConnection = ({ start, end }) => {
  return (
    <Line
      points={[start, end]}
      color="white"
      lineWidth={1}
      dashed={true}
    />
  );
};

export default DreamConnection;
