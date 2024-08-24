import React from 'react';

const DreamTalk = ({ repoName, mediaContent }) => {
  return (
    <div className="dream-talk" style={{
      width: '100%',
      height: '100%',
      background: 'rgb(0, 30, 60)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: '50%',
      border: '2px solid rgb(0, 100, 200)'
    }}>
      {mediaContent ? (
        mediaContent.type === 'video' ? (
          <video src={mediaContent.url} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <img src={mediaContent.url} alt={repoName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )
      ) : (
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>{repoName}</h2>
      )}
    </div>
  );
};

export default DreamTalk;
