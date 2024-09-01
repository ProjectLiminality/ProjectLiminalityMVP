import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { getRepoData } from '../utils/fileUtils';
import DreamNode3D from './DreamNode3D';

const DreamNode = forwardRef(({ initialPosition, repoName, onNodeClick, cssScene, isHovered }, ref) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [repoData, setRepoData] = useState({ metadata: {}, mediaContent: null });
  const nodeRef = useRef(null);
  const dreamNode3DRef = useRef(null);

  useImperativeHandle(ref, () => ({
    updatePosition: (newPosition, duration = 1000) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updatePosition(newPosition, duration);
      }
    },
    updateRotation: (newRotation, duration = 1000) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updateRotation(newRotation, duration);
      }
    },
    updateScale: (newScale, duration = 300) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updateScale(newScale, duration);
      }
    },
    getFrontPlane: () => dreamNode3DRef.current?.getFrontPlane(),
    getBackPlane: () => dreamNode3DRef.current?.getBackPlane(),
    object: dreamNode3DRef.current
  }));

  useEffect(() => {
    const fetchRepoData = async () => {
      const data = await getRepoData(repoName);
      setRepoData(data);
    };
    fetchRepoData();
  }, [repoName]);

  useEffect(() => {
    if (nodeRef.current && cssScene && !dreamNode3DRef.current) {
      const dreamNode3D = new DreamNode3D(nodeRef.current, initialPosition);
      dreamNode3DRef.current = dreamNode3D;
      cssScene.add(dreamNode3D);

      return () => {
        cssScene.remove(dreamNode3D);
        dreamNode3DRef.current = null;
      };
    }
  }, [initialPosition, cssScene, repoName]);

  useEffect(() => {
    if (dreamNode3DRef.current) {
      const newScale = new THREE.Vector3(isHovered ? 1.1 : 1, isHovered ? 1.1 : 1, isHovered ? 1.1 : 1);
      dreamNode3DRef.current.updateScale(newScale, 300);
    }
    setShowOverlay(isHovered);
    
    if (isHovered) {
      console.log('DreamNode is now hovered:', repoName);
    } else {
      console.log('DreamNode is no longer hovered:', repoName);
    }
  }, [isHovered, repoName]);

  const handleClick = useCallback(() => {
    onNodeClick(repoName);
  }, [onNodeClick, repoName]);

  return (
    <div ref={nodeRef} style={{ width: '300px', height: '300px', position: 'relative', transformStyle: 'preserve-3d' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
        <DreamTalk 
          repoName={repoName} 
          mediaContent={repoData.mediaContent} 
          metadata={repoData.metadata} 
          onClick={handleClick}
          isHovered={isHovered}
        />
        {showOverlay && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontSize: '16px',
            textAlign: 'center',
            padding: '10px',
            boxSizing: 'border-box',
          }}>
            <p>{repoData.metadata.description || 'No description available'}</p>
          </div>
        )}
      </div>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <DreamSong 
          repoName={repoName} 
          metadata={repoData.metadata}
          onClick={handleClick}
          isHovered={isHovered}
        />
      </div>
    </div>
  );
});

export default React.memo(DreamNode);
