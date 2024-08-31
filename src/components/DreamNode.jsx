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

      const createCSS3DObject = (element, posZ) => {
        const obj = new CSS3DObject(element);
        obj.position.set(0, 0, posZ);
        return obj;
      };

      const dreamTalkObject = createCSS3DObject(nodeRef.current.querySelector('.dream-talk'), 1);
      const dreamSongObject = createCSS3DObject(nodeRef.current.querySelector('.dream-song'), -1);
      dreamSongObject.rotation.y = Math.PI;

      nodeContainer.add(dreamTalkObject, dreamSongObject);

      return () => {
        parentRef.current.remove(object);
        nodeContainer.remove(dreamTalkObject, dreamSongObject);
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
    if (object) {
      const newRotation = new THREE.Euler(0, isFlipped ? 0 : Math.PI, 0);
      updateRotation(object, newRotation, 1000);
    }
    onNodeClick(repoName);
  }, [isFlipped, onNodeClick, repoName, object]);

  const handleHover = useCallback((isHovering) => {
    if (object) {
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(object, newScale, 300);
    }
  }, [object]);

  return (
    <div ref={nodeRef}>
      <div 
        className="dream-talk" 
        onClick={handleClick} 
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <DreamTalk repoName={repoName} mediaContent={mediaContent} />
      </div>
      <div 
        className="dream-song" 
        onClick={handleClick}
        onMouseEnter={() => handleHover(true)}
        onMouseLeave={() => handleHover(false)}
      >
        <DreamSong repoName={repoName} mediaContent={mediaContent} />
      </div>
    </div>
  );
});

DreamNode.displayName = 'DreamNode';

export default React.memo(DreamNode);
