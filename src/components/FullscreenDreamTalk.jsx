import React from 'react';
import { BLACK, BLUE, RED, WHITE } from '../constants/colors';
import DreamTalk from './DreamTalk';

const FullscreenDreamTalk = ({ isOpen, onClose, repoName, dreamTalkMedia, metadata }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: BLACK,
      color: WHITE,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '90%',
        height: '90%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `2px solid ${BLUE}`,
        borderRadius: '10px',
        padding: '20px',
      }}>
        <h2 style={{ color: WHITE, marginBottom: '20px' }}>{repoName}</h2>
        <div style={{ width: '100%', height: 'calc(100% - 60px)', position: 'relative' }}>
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
            background: RED,
            color: WHITE,
            border: 'none',
            borderRadius: '5px',
            padding: '5px 10px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default FullscreenDreamTalk;
