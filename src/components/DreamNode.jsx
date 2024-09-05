import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as THREE from 'three';
import DreamTalk from './DreamTalk';
import DreamSong from './DreamSong';
import { getRepoData } from '../utils/fileUtils';
import DreamNode3D from './DreamNode3D';
import { BLUE, RED } from '../constants/colors';

const log = (message, ...args) => {
  console.log(`[DreamNode] ${message}`, ...args);
};

/**
 * @typedef {Object} RepoData
 * @property {Object} metadata - Metadata of the repository
 * @property {Object|null} mediaContent - Media content of the repository
 */

/**
 * DreamNode component
 * @type {React.ForwardRefExoticComponent<React.PropsWithoutRef<{
 *   initialPosition: THREE.Vector3,
 *   repoName: string,
 *   onNodeClick: (repoName: string) => void,
 *   cssScene: THREE.Scene,
 *   isHovered: boolean
 * }> & React.RefAttributes<unknown>>}
 */
const DreamNode = forwardRef(({ initialPosition, repoName, onNodeClick, cssScene, isHovered, onDreamGraphClick }, ref) => {
  log('DreamNode rendered', { repoName, isHovered });

  /** @type {[RepoData, React.Dispatch<React.SetStateAction<RepoData>>]} */
  const [repoData, setRepoData] = useState({ metadata: {}, mediaContent: null });
  const nodeRef = useRef(null);
  /** @type {React.MutableRefObject<DreamNode3D|null>} */
  const dreamNode3DRef = useRef(null);

  useImperativeHandle(ref, () => ({
    /**
     * @param {THREE.Vector3} newPosition
     * @param {number} [duration=1]
     */
    updatePosition: (newPosition, duration = 1) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updatePosition(newPosition, duration);
      }
    },
    /**
     * @param {THREE.Euler} newRotation
     * @param {number} [duration=1]
     */
    updateRotation: (newRotation, duration = 1) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updateRotation(newRotation, duration);
      }
    },
    /**
     * @param {THREE.Vector3} newScale
     * @param {number} [duration=0.3]
     */
    updateScale: (newScale, duration = 0.3) => {
      if (dreamNode3DRef.current) {
        dreamNode3DRef.current.updateScale(newScale, duration);
      }
    },
    getFrontPlane: () => dreamNode3DRef.current?.getFrontPlane(),
    getBackPlane: () => dreamNode3DRef.current?.getBackPlane(),
    object: dreamNode3DRef.current
  }));

  useEffect(() => {
    log('Fetching repo data for', repoName);
    const fetchRepoData = async () => {
      const data = await getRepoData(repoName);
      log('Repo data fetched', { repoName, data });
      setRepoData(data);
    };
    fetchRepoData();
  }, [repoName]);

  useEffect(() => {
    log('DreamNode effect running', { repoName, hasNodeRef: !!nodeRef.current, hasCssScene: !!cssScene, hasDreamNode3DRef: !!dreamNode3DRef.current });
    if (nodeRef.current && cssScene && !dreamNode3DRef.current) {
      log('Creating new DreamNode3D', { repoName });
      const dreamNode3D = new DreamNode3D(nodeRef.current, initialPosition, repoName);
      log('DreamNode3D created', { repoName, dreamNode3DRepoName: dreamNode3D.getRepoName() });
      dreamNode3DRef.current = dreamNode3D;
      cssScene.add(dreamNode3D);

      return () => {
        log('Cleaning up DreamNode3D', { repoName });
        cssScene.remove(dreamNode3D);
        dreamNode3DRef.current = null;
      };
    }
  }, [initialPosition, cssScene, repoName]);

  useEffect(() => {
    log('repoName changed', { repoName });
  }, [repoName]);


  const handleClick = useCallback(() => {
    onNodeClick(repoName);
    if (onDreamGraphClick) {
      onDreamGraphClick(repoName);
    }
  }, [onNodeClick, onDreamGraphClick, repoName]);

  useEffect(() => {
    log('DreamNode rendered', { repoName, isHovered });
  });

  return (
    <div ref={nodeRef} style={{ width: '300px', height: '300px', position: 'relative', transformStyle: 'preserve-3d' }}>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden' }}>
        <DreamTalk 
          repoName={repoName} 
          mediaContent={repoData.mediaContent} 
          metadata={repoData.metadata} 
          onClick={handleClick}
          isHovered={isHovered}
          borderColor={repoData.metadata?.type === 'person' ? RED : BLUE}
        />
      </div>
      <div style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
        <DreamSong 
          repoName={repoName} 
          metadata={repoData.metadata}
          onClick={handleClick}
          isHovered={isHovered}
          borderColor={repoData.metadata?.type === 'person' ? RED : BLUE}
        />
      </div>
    </div>
  );
});

export default React.memo(DreamNode);
