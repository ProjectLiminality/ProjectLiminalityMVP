import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updateRotation, updateScale, updatePosition } from '../utils/3DUtils';
import { readMetadata, getMediaFilePath, readFile, listFiles } from '../services/electronService';
import * as electronService from '../services/electronService';

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

  const readMetadata = useCallback(async () => {
    try {
      console.log(`Reading metadata for ${repoName}`);
      const data = await electronService.readMetadata(repoName);
      console.log(`Metadata for ${repoName}:`, data);
      setMetadata(data);
    } catch (error) {
      console.error(`Error reading metadata for ${repoName}:`, error);
      setMetadata({});
    }
  }, [repoName]);

  const getMediaFile = useCallback(async () => {
    try {
      console.log(`Getting media file for ${repoName}`);
      const files = await listFiles(repoName);
      const preferredExtensions = ['.gif', '.mp4', '.png', '.jpg', '.jpeg'];
      
      const mediaFiles = files.filter(file => 
        file.startsWith(repoName) && preferredExtensions.some(ext => file.toLowerCase().endsWith(ext))
      );
      
      console.log(`Found media files:`, mediaFiles);

      if (mediaFiles.length > 0) {
        const selectedFile = mediaFiles.sort((a, b) => {
          const extA = preferredExtensions.findIndex(ext => a.toLowerCase().endsWith(ext));
          const extB = preferredExtensions.findIndex(ext => b.toLowerCase().endsWith(ext));
          return extA - extB;
        })[0];

        console.log(`Selected media file: ${selectedFile}`);

        const mediaPath = await getMediaFilePath(repoName, selectedFile);
        const mediaData = await readFile(mediaPath);
        const fileExtension = selectedFile.split('.').pop().toLowerCase();
        const mimeTypes = {
          'mp4': 'video/mp4',
          'gif': 'image/gif',
          'png': 'image/png',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg'
        };
        const mediaContent = {
          type: mimeTypes[fileExtension] || 'application/octet-stream',
          path: mediaPath,
          data: `data:${mimeTypes[fileExtension] || 'application/octet-stream'};base64,${mediaData}`
        };
        console.log(`Setting media content for ${repoName}:`, mediaContent);
        setMediaContent(mediaContent);
      } else {
        console.log(`No media content found for ${repoName}`);
        setMediaContent(null);
      }
    } catch (error) {
      console.error(`Error getting media file for ${repoName}:`, error);
      setMediaContent(null);
    }
  }, [repoName]);

  useEffect(() => {
    console.log(`Calling readMetadata and getMediaFile for ${repoName}`);
    readMetadata();
    getMediaFile();
  }, [readMetadata, getMediaFile, repoName]);

  useEffect(() => {
    console.log(`Metadata for ${repoName}:`, metadata);
  }, [metadata, repoName]);

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
      console.log(`Front object for ${repoName}:`, frontCSS3DObject);
      console.log(`Back object for ${repoName}:`, backCSS3DObject);

      return () => {
        console.log(`Removing CSS3DObjects for ${repoName}`);
        cssScene.remove(frontCSS3DObject);
        cssScene.remove(backCSS3DObject);
        frontObjectRef.current = null;
        backObjectRef.current = null;
      };
    } else {
      console.log(`Conditions not met for creating CSS3DObjects for ${repoName}:`, {
        frontNodeRef: !!frontNodeRef.current,
        backNodeRef: !!backNodeRef.current,
        cssScene: !!cssScene,
        frontObjectRef: !!frontObjectRef.current,
        backObjectRef: !!backObjectRef.current
      });
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

  const borderColor = metadata && metadata.color ? metadata.color : '#000000';

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
