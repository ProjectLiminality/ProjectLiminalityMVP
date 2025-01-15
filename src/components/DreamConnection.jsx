import React, { useState, useCallback } from 'react';
import { Line } from '@react-three/drei';

const DreamConnection = ({ start, end }) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = useCallback(() => {
    setIsClicked((prev) => !prev);
  }, []);

  return (
    <Line
      points={[start, end]}
      color="white"
      lineWidth={isClicked ? 3 : 1}
      dashed={true}
      onClick={handleClick}
    />
  );
};

export default DreamConnection;
