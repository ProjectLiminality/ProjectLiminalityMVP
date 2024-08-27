import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { updatePosition, updateRotation, updateScale } from '../utils/3DUtils';
import { readMetadata } from '../services/electronService';

const DreamNode = ({ scene, initialPosition, repoName }) => {
  const nodeRef = useRef(null);
  const [metadata, setMetadata] = useState({});
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const data = await readMetadata(repoName);
        setMetadata(data);
      } catch (error) {
        console.error('Error reading metadata:', error);
        setMetadata({});
      }
    };

    fetchMetadata();
  }, [repoName]);

  useEffect(() => {
    if (scene && nodeRef.current) {
      // Create 3D object
      const object = new THREE.Object3D();
      const nodeContainer = new THREE.Object3D();
      object.add(nodeContainer);
      object.position.copy(initialPosition);

      // Add to scene
      scene.add(object);

      // Create CSS3D objects for DreamTalk and DreamSong
      const dreamTalkObject = new CSS3DObject(nodeRef.current.querySelector('.dream-talk'));
      const dreamSongObject = new CSS3DObject(nodeRef.current.querySelector('.dream-song'));

      nodeContainer.add(dreamTalkObject);
      nodeContainer.add(dreamSongObject);

      // Set initial positions
      dreamTalkObject.position.set(0, 0, 1);
      dreamSongObject.position.set(0, 0, -1);
      dreamSongObject.rotation.y = Math.PI;

      return () => {
        scene.remove(object);
      };
    }
  }, [scene, initialPosition]);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    // Add flip animation logic here
  };

  return (
    <div ref={nodeRef}>
      <div className="dream-talk" onClick={handleClick} style={{ display: isFlipped ? 'none' : 'block' }}>
        <DreamTalk repoName={repoName} mediaContent={metadata.mediaContent} />
      </div>
      <div className="dream-song" onClick={handleClick} style={{ display: isFlipped ? 'block' : 'none' }}>
        <DreamSong />
      </div>
    </div>
  );
};

export default DreamNode;
