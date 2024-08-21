import React from 'react';

const DreamSong = () => {
  return (
    <div className="dream-song" style={{
      width: '100%',
      height: '100%',
      background: 'rgb(200, 100, 0)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: '50%',
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>DreamSong</h2>
      <p style={{ fontSize: '16px', padding: '0 20px' }}>Back side of the DreamNode</p>
    </div>
  );
};

export default DreamSong;
