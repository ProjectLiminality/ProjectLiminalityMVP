import React from 'react';

const DreamTalk = ({ repoName }) => {
  return (
    <div className="dream-talk" style={{
      width: '100%',
      height: '100%',
      background: 'rgb(0, 100, 200)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      borderRadius: '50%',
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{repoName}</h2>
    </div>
  );
};

export default DreamTalk;
