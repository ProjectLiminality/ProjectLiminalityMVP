import React, { useState } from 'react';
import { BLACK, BLUE, WHITE } from '../constants/colors';

const CustomNumberInput = ({ value, onChange }) => {
  const [hoverUp, setHoverUp] = useState(false);
  const [hoverDown, setHoverDown] = useState(false);

  const buttonStyle = {
    width: '20px',
    height: '20px',
    backgroundColor: BLACK,
    border: `1px solid ${BLUE}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const triangleStyle = {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{
          width: '50px',
          padding: '5px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
          borderRadius: '4px',
          marginRight: '5px',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={buttonStyle}
          onMouseEnter={() => setHoverUp(true)}
          onMouseLeave={() => setHoverUp(false)}
          onClick={() => onChange(value + 1)}
        >
          <div style={{
            ...triangleStyle,
            borderBottom: `7px solid ${hoverUp ? BLUE : BLACK}`,
          }} />
        </div>
        <div
          style={buttonStyle}
          onMouseEnter={() => setHoverDown(true)}
          onMouseLeave={() => setHoverDown(false)}
          onClick={() => onChange(value - 1)}
        >
          <div style={{
            ...triangleStyle,
            borderTop: `7px solid ${hoverDown ? BLUE : BLACK}`,
          }} />
        </div>
      </div>
    </div>
  );
};

export default CustomNumberInput;
