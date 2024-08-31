import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updateRotation, updateScale, updatePosition } from '../utils/3DUtils';
import { readMetadata, getMediaFilePath } from '../services/electronService';

const DreamNode = forwardRef(({ initialPosition, repoName, onNodeClick, cssScene }, ref) => {
  const [metadata, setMetadata] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [css3DObject, setCSS3DObject] = useState(null);
  const nodeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePosition: (newPosition, duration = 1000) => {
      if (css3DObject) {
        updatePosition(css3DObject, newPosition, duration);
      }
    },
    updateRotation: (newRotation, duration = 1000) => {
      if (css3DObject) {
        updateRotation(css3DObject, newRotation, duration);
      }
    },
    updateScale: (newScale, duration = 300) => {
      if (css3DObject) {
        updateScale(css3DObject, newScale, duration);
      }
    },
    flip: () => {
      setIsFlipped(prev => !prev);
      if (css3DObject) {
        const newRotation = new THREE.Euler(0, isFlipped ? 0 : Math.PI, 0);
        updateRotation(css3DObject, newRotation, 1000);
      }
    }
  }));

  const fetchMetadata = useCallback(async () => {
    try {
      const data = await readMetadata(repoName);
      setMetadata(data);
      if (data.mediaContent) {
        const mediaPath = await getMediaFilePath(repoName);
        setMediaContent({ ...data.mediaContent, path: mediaPath });
      }
    } catch (error) {
      console.error('Error reading metadata:', error);
      setMetadata({});
    }
  }, [repoName]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (nodeRef.current && cssScene) {
      const newCSS3DObject = new CSS3DObject(nodeRef.current);
      newCSS3DObject.position.copy(initialPosition);
      setCSS3DObject(newCSS3DObject);
      cssScene.add(newCSS3DObject);

      return () => {
        cssScene.remove(newCSS3DObject);
      };
    }
  }, [initialPosition, cssScene]);

  const handleClick = useCallback(() => {
    onNodeClick(repoName);
  }, [onNodeClick, repoName]);

  const handleHover = useCallback((isHovering) => {
    if (css3DObject) {
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(css3DObject, newScale, 300);
    }
  }, [css3DObject]);

  const borderColor = metadata.color || '#000000';

  return (
    <div ref={nodeRef} style={{ width: '300px', height: '300px', position: 'relative' }}>
      <div 
        className="dream-talk" 
        onClick={handleClick} 
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: 'transform 0.6s',
          border: `5px solid ${borderColor}`,
          borderRadius: '10px',
        }}
      >
        <DreamTalk repoName={repoName} mediaContent={mediaContent} metadata={metadata} />
      </div>
      <div 
        className="dream-song" 
        onClick={handleClick}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ 
          position: 'absolute', 
          width: '100%', 
          height: '100%', 
          backfaceVisibility: 'hidden', 
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          transition: 'transform 0.6s',
          border: `5px solid ${borderColor}`,
          borderRadius: '10px',
        }}
      >
        <DreamSong repoName={repoName} metadata={metadata} />
      </div>
    </div>
  );
});

export default React.memo(DreamNode);
