import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updateRotation, updateScale, updatePosition } from '../utils/3DUtils';
import { readMetadata, getMediaFilePath, readFile } from '../services/electronService';

const DreamNode = forwardRef(({ initialPosition, repoName, onNodeClick, cssScene }, ref) => {
  const [metadata, setMetadata] = useState({});
  const [mediaContent, setMediaContent] = useState(null);
  const frontObjectRef = useRef(null);
  const backObjectRef = useRef(null);
  const frontNodeRef = useRef(null);
  const backNodeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePosition: (newPosition, duration = 1000) => {
      console.log(`Updating position for ${repoName}:`, newPosition);
      if (frontObjectRef.current && backObjectRef.current) {
        updatePosition(frontObjectRef.current, newPosition, duration);
        updatePosition(backObjectRef.current, newPosition, duration);
      }
    },
    updateRotation: (newRotation, duration = 1000) => {
      console.log(`Updating rotation for ${repoName}:`, newRotation);
      if (frontObjectRef.current && backObjectRef.current) {
        updateRotation(frontObjectRef.current, newRotation, duration);
        updateRotation(backObjectRef.current, newRotation, duration);
      }
    },
    updateScale: (newScale, duration = 300) => {
      console.log(`Updating scale for ${repoName}:`, newScale);
      if (frontObjectRef.current && backObjectRef.current) {
        updateScale(frontObjectRef.current, newScale, duration);
        updateScale(backObjectRef.current, newScale, duration);
      }
    },
    frontObject: frontObjectRef.current,
    backObject: backObjectRef.current
  }));

  const readMetadataAndMedia = useCallback(async () => {
    try {
      console.log(`Reading metadata for ${repoName}`);
      const data = await readMetadata(repoName);
      console.log(`Metadata for ${repoName}:`, data);
      setMetadata(data);
      if (data.mediaContent) {
        console.log(`Reading media content for ${repoName}`);
        const mediaPath = await getMediaFilePath(repoName);
        console.log(`Media path for ${repoName}:`, mediaPath);
        const mediaData = await readFile(mediaPath);
        console.log(`Media data received for ${repoName}. Length:`, mediaData.length);
        const mediaContent = { 
          ...data.mediaContent, 
          path: mediaPath,
          data: `data:${data.mediaContent.type};base64,${mediaData}`
        };
        console.log(`Setting media content for ${repoName}:`, mediaContent);
        setMediaContent(mediaContent);
      } else {
        console.log(`No media content found for ${repoName}`);
      }
    } catch (error) {
      console.error(`Error reading metadata or media for ${repoName}:`, error);
      setMetadata({});
      setMediaContent(null);
    }
  }, [repoName]);

  useEffect(() => {
    readMetadataAndMedia();
  }, [readMetadataAndMedia]);

  useEffect(() => {
    console.log(`DreamNode effect for ${repoName}. frontNodeRef.current:`, !!frontNodeRef.current, 'backNodeRef.current:', !!backNodeRef.current, 'cssScene:', !!cssScene);
    if (frontNodeRef.current && backNodeRef.current && cssScene && !frontObjectRef.current && !backObjectRef.current) {
      console.log(`Creating CSS3DObjects for ${repoName}`);
      const frontCSS3DObject = new CSS3DObject(frontNodeRef.current);
      const backCSS3DObject = new CSS3DObject(backNodeRef.current);
      
      frontCSS3DObject.position.copy(initialPosition);
      backCSS3DObject.position.copy(initialPosition);
      
      // Rotate the back object 180 degrees around the Y-axis
      backCSS3DObject.rotation.y = Math.PI;

      // Ensure both sides are fully opaque
      frontCSS3DObject.element.style.backfaceVisibility = 'hidden';
      backCSS3DObject.element.style.backfaceVisibility = 'hidden';

      frontObjectRef.current = frontCSS3DObject;
      backObjectRef.current = backCSS3DObject;
      
      cssScene.add(frontCSS3DObject);
      cssScene.add(backCSS3DObject);
      
      console.log(`Added CSS3DObjects for ${repoName} to scene. Scene children count:`, cssScene.children.length);

      return () => {
        console.log(`Removing CSS3DObjects for ${repoName}`);
        cssScene.remove(frontCSS3DObject);
        cssScene.remove(backCSS3DObject);
        frontObjectRef.current = null;
        backObjectRef.current = null;
      };
    }
  }, [initialPosition, cssScene, repoName]);

  const handleClick = useCallback(() => {
    console.log(`${repoName} clicked`);
    onNodeClick(repoName);
  }, [onNodeClick, repoName]);

  const handleHover = useCallback((isHovering) => {
    console.log(`${repoName} hover state:`, isHovering);
    if (frontObjectRef.current && backObjectRef.current) {
      const newScale = new THREE.Vector3(isHovering ? 1.1 : 1, isHovering ? 1.1 : 1, isHovering ? 1.1 : 1);
      updateScale(frontObjectRef.current, newScale, 300);
      updateScale(backObjectRef.current, newScale, 300);
    }
  }, [repoName]);

  const borderColor = metadata.color || '#000000';

  return (
    <>
      <div ref={frontNodeRef} style={{ width: '300px', height: '300px' }}>
        <DreamTalk 
          repoName={repoName} 
          mediaContent={mediaContent} 
          metadata={metadata} 
          onClick={handleClick}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        />
      </div>
      <div ref={backNodeRef} style={{ width: '300px', height: '300px' }}>
        <DreamSong 
          repoName={repoName} 
          metadata={metadata}
          onClick={handleClick}
          onMouseEnter={() => handleHover(true)}
          onMouseLeave={() => handleHover(false)}
        />
      </div>
    </>
  );
});

export default React.memo(DreamNode);
