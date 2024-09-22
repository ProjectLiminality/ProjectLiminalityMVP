import React, { useState, useEffect, useRef } from 'react';
import { Billboard, Html } from '@react-three/drei';
import gsap from 'gsap';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { BLUE, RED } from '../constants/colors';

const DreamNode = ({ repoName, position, scale, metadata, mediaContent, dreamSongMedia, onNodeClick, onNodeRightClick, isHovered, setHoveredNode }) => {
  const firstDreamSongMedia = dreamSongMedia && dreamSongMedia.length > 0 ? dreamSongMedia[0] : null;
  const [hovered, setHovered] = useState(false);
  const nodeRef = useRef();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useEffect(() => {
    if (nodeRef.current) {
      gsap.to(nodeRef.current.position, {
        x: position.x,
        y: position.y,
        z: position.z,
        duration: 2,
        ease: "power2.inOut"
      });
      gsap.to(nodeRef.current.scale, {
        x: scale,
        y: scale,
        z: scale,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [position, scale]);

  const borderColor = metadata?.type === 'person' ? RED : BLUE;

  const handlePointerOver = () => {
    setHovered(true);
    setHoveredNode(repoName);
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredNode(null);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    onNodeClick(repoName);
  };

  const handleRightClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onNodeRightClick(repoName, event);
  };

  return (
    <Billboard
      ref={nodeRef}
      follow={true}
      lockX={false}
      lockY={false}
      lockZ={false}
      onContextMenu={handleRightClick}
    >
      <Html
        transform
        position={[0, 0, 0.01]}
        style={{
          width: '300px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <DreamTalk 
          repoName={repoName}
          mediaContent={firstDreamSongMedia || mediaContent}
          metadata={metadata}
          onClick={handleClick}
          onRightClick={handleRightClick}
          isHovered={hovered}
          borderColor={borderColor}
        />
      </Html>
      <Html
        transform
        position={[0, 0, -0.01]}
        rotation={[0, Math.PI, 0]}
        style={{
          width: '300px',
          height: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <DreamSong 
          repoName={repoName}
          dreamSongMedia={dreamSongMedia}
          metadata={metadata}
          onClick={handleClick}
          onRightClick={handleRightClick}
          isHovered={hovered}
          borderColor={borderColor}
        />
      </Html>
    </Billboard>
  );
};

export default DreamNode;
