import React from 'react';
import DreamTalk from './DreamTalk';

const FullscreenDreamTalk = ({ repoName, dreamTalkMedia, metadata, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <div style={{
        width: '90%',
        height: '90%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <div style={{ width: '80%', height: '80%' }}>
          <DreamTalk
            repoName={repoName}
            dreamTalkMedia={dreamTalkMedia}
            metadata={metadata}
            onClick={() => {}}
            onRightClick={() => {}}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
            isHovered={false}
            borderColor="transparent"
            onFlip={() => {}}
            onToggleFullscreen={() => {}}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'rgba(255, 255, 255, 0.5)',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
            zIndex: 1001,
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FullscreenDreamTalk;
