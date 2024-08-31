import React, { useEffect, useRef, useState, useCallback, forwardRef } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updatePosition, updateRotation, updateScale } from '../utils/3DUtils';
import { readMetadata, getMediaFilePath } from '../services/electronService';

const DreamNode = forwardRef(({ scene, camera, position, repoName, onNodeClick, parentRef, object }, ref) => {
  const nodeRef = useRef(null);
  const [metadata, setMetadata] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [css3DObject, setCSS3DObject] = useState(null);

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
    if (scene && nodeRef.current && parentRef.current) {
      const nodeContainer = new THREE.Object3D();
      object.add(nodeContainer);
      object.position.copy(position);

      parentRef.current.add(object);

      const createCSS3DObject = (element) => {
        const obj = new CSS3DObject(element);
        return obj;
      };

      const newCSS3DObject = createCSS3DObject(nodeRef.current);
      setCSS3DObject(newCSS3DObject);
      nodeContainer.add(newCSS3DObject);

      return () => {
        parentRef.current.remove(object);
        nodeContainer.remove(newCSS3DObject);
      };
    }
  }, [scene, position, parentRef, object, repoName]);

  useEffect(() => {
    if (object && position) {
      updatePosition(object, position, 1000);
    }
  }, [position, object]);

  const handleClick = useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (css3DObject) {
      const newRotation = new THREE.Euler(0, isFlipped ? 0 : Math.PI, 0);
      updateRotation(css3DObject, newRotation, 1000);
    }
    onNodeClick(repoName);
  }, [isFlipped, onNodeClick, repoName, css3DObject]);

  const handleHover = useCallback((isHovering) => {
    if (css3DObject) {
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(css3DObject, newScale, 300);
    }
  }, [css3DObject]);

  return (
    <div ref={nodeRef} style={{ width: '300px', height: '300px', position: 'relative' }}>
      <div 
        className="dream-talk" 
        onClick={handleClick} 
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}
      >
        <DreamTalk repoName={repoName} mediaContent={mediaContent} metadata={metadata} />
      </div>
      <div 
        className="dream-song" 
        onClick={handleClick}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
        style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <DreamSong repoName={repoName} mediaContent={mediaContent} metadata={metadata} />
      </div>
    </div>
  );
});

DreamNode.displayName = 'DreamNode';

export default React.memo(DreamNode);
