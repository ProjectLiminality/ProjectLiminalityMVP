import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updateRotation, updateScale, updatePosition } from '../utils/3DUtils';
import { readMetadata, getMediaFilePath } from '../services/electronService';

// No changes needed in the DreamNode component itself
const DreamNode = forwardRef(({ initialPosition, repoName, onNodeClick, cssScene }, ref) => {
  const [metadata, setMetadata] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const css3DObjectRef = useRef(null);
  const nodeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePosition: (newPosition, duration = 1000) => {
      console.log(`Updating position for ${repoName}:`, newPosition);
      if (css3DObjectRef.current) {
        updatePosition(css3DObjectRef.current, newPosition, duration);
      }
    },
    updateRotation: (newRotation, duration = 1000) => {
      console.log(`Updating rotation for ${repoName}:`, newRotation);
      if (css3DObjectRef.current) {
        updateRotation(css3DObjectRef.current, newRotation, duration);
      }
    },
    updateScale: (newScale, duration = 300) => {
      console.log(`Updating scale for ${repoName}:`, newScale);
      if (css3DObjectRef.current) {
        updateScale(css3DObjectRef.current, newScale, duration);
      }
    },
    flip: () => {
      console.log(`Flipping ${repoName}`);
      setIsFlipped(prev => !prev);
      if (css3DObjectRef.current) {
        const newRotation = new THREE.Euler(0, isFlipped ? 0 : Math.PI, 0);
        updateRotation(css3DObjectRef.current, newRotation, 1000);
      }
    }
  }));

  const fetchMetadata = useCallback(async () => {
    try {
      console.log(`Fetching metadata for ${repoName}`);
      const data = await readMetadata(repoName);
      setMetadata(data);
      if (data.mediaContent) {
        const mediaPath = await getMediaFilePath(repoName);
        setMediaContent({ ...data.mediaContent, path: mediaPath });
      }
    } catch (error) {
      console.error(`Error reading metadata for ${repoName}:`, error);
      setMetadata({});
    }
  }, [repoName]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    if (nodeRef.current && cssScene && !css3DObjectRef.current) {
      console.log(`Creating CSS3DObject for ${repoName}`);
      const newCSS3DObject = new CSS3DObject(nodeRef.current);
      newCSS3DObject.position.copy(initialPosition);
      css3DObjectRef.current = newCSS3DObject;
      cssScene.add(newCSS3DObject);

      return () => {
        console.log(`Removing CSS3DObject for ${repoName}`);
        cssScene.remove(newCSS3DObject);
        css3DObjectRef.current = null;
      };
    }
  }, [initialPosition, cssScene, repoName]);

  const handleClick = useCallback(() => {
    console.log(`${repoName} clicked`);
    onNodeClick(repoName);
  }, [onNodeClick, repoName]);

  const handleHover = useCallback((isHovering) => {
    console.log(`${repoName} hover state:`, isHovering);
    if (css3DObjectRef.current) {
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(css3DObjectRef.current, newScale, 300);
    }
  }, [repoName]);

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
import React, { useState, useEffect } from 'react';
import { readMetadata } from '../services/electronService';

const DreamNode = ({ repoName }) => {
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await readMetadata(repoName);
        setMetadata(data);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      }
    };

    fetchMetadata();
  }, [repoName]);

  if (!metadata) {
    return <div className="dream-node">Loading...</div>;
  }

  return (
    <div className="dream-node">
      <h3>{repoName}</h3>
      <p>Last commit: {metadata.lastCommit}</p>
      <p>Author: {metadata.author}</p>
      <p>Files: {metadata.fileCount}</p>
    </div>
  );
};

export default DreamNode;
