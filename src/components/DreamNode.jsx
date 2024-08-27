import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
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

  useImperativeHandle(ref, () => ({
    getObject: () => object,
    getNodeRef: () => nodeRef.current,
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

  const createNodeObjects = useCallback(() => {
    if (scene && nodeRef.current && parentRef.current) {
      console.log(`DreamNode ${repoName}: Creating 3D objects`);
      const nodeContainer = new THREE.Object3D();
      object.add(nodeContainer);
      object.position.copy(position);

      parentRef.current.add(object);

      // Wait for the next frame to ensure the DOM elements are rendered
      requestAnimationFrame(() => {
        const dreamTalkElement = nodeRef.current.querySelector('.dream-talk');
        const dreamSongElement = nodeRef.current.querySelector('.dream-song');

        if (dreamTalkElement && dreamSongElement) {
          const dreamTalkObject = new CSS3DObject(dreamTalkElement);
          const dreamSongObject = new CSS3DObject(dreamSongElement);

          nodeContainer.add(dreamTalkObject);
          nodeContainer.add(dreamSongObject);

          dreamTalkObject.position.set(0, 0, 1);
          dreamSongObject.position.set(0, 0, -1);
          dreamSongObject.rotation.y = Math.PI;

          console.log(`DreamNode ${repoName}: 3D objects created and added to scene`);
        } else {
          console.error(`DreamNode ${repoName}: DOM elements not found`);
        }
      });

      return () => {
        console.log(`DreamNode ${repoName}: Removing 3D objects from scene`);
        parentRef.current.remove(object);
      };
    }
  }, [scene, position, parentRef, object, repoName]);

  useEffect(() => {
    const cleanup = createNodeObjects();
    return cleanup;
  }, [createNodeObjects]);

  useEffect(() => {
    if (object && position) {
      updatePosition(object, position, 1000);
    }
  }, [position, object]);

  const handleClick = useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (object) {
      const duration = 1000; // 1 second
      const newRotation = new THREE.Euler(0, isFlipped ? 0 : Math.PI, 0);
      updateRotation(object, newRotation, duration);
    }
    onNodeClick(repoName);
  }, [isFlipped, onNodeClick, repoName, object]);

  const handleHover = useCallback((isHovering) => {
    if (object) {
      const duration = 300; // 0.3 seconds
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(object, newScale, duration);
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
