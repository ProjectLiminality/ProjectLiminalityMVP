import React, { useState } from 'react';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';

const CustomNumberInput = ({ value, onChange }) => {
  const [hoverUp, setHoverUp] = useState(false);
  const [hoverDown, setHoverDown] = useState(false);

  const buttonStyle = {
    width: '10px',
    height: '10px',
    backgroundColor: BLACK,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const triangleStyle = {
    width: 0,
    height: 0,
    borderLeft: '5.625px solid transparent',
    borderRight: '5.625px solid transparent',
  };

  const upTriangleStyle = {
    ...triangleStyle,
    borderBottom: `7.875px solid ${BLUE}`,
    borderTop: 'none',
  };

  const downTriangleStyle = {
    ...triangleStyle,
    borderTop: `7.875px solid ${BLUE}`,
    borderBottom: 'none',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{
          width: '40px',
          padding: '5px',
          backgroundColor: BLACK,
          color: WHITE,
          border: `1px solid ${BLUE}`,
          borderRadius: '4px',
          marginRight: '5px',
          textAlign: 'center',
          appearance: 'textfield',
          MozAppearance: 'textfield',
          WebkitAppearance: 'textfield',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = `0 0 0 2px ${RED}`;
          e.target.style.border = `1px solid ${BLACK}`;
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'none';
          e.target.style.border = `1px solid ${BLUE}`;
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
            ...upTriangleStyle,
            borderBottom: `7.875px solid ${hoverUp ? WHITE : BLUE}`,
          }} />
        </div>
        <div
          style={buttonStyle}
          onMouseEnter={() => setHoverDown(true)}
          onMouseLeave={() => setHoverDown(false)}
          onClick={() => onChange(value - 1)}
        >
          <div style={{
            ...downTriangleStyle,
            borderTop: `7.875px solid ${hoverDown ? WHITE : BLUE}`,
          }} />
        </div>
      </div>
    </div>
  );
};

export default CustomNumberInput;
