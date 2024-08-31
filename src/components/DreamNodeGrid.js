import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer';

const DreamNodeGrid = ({ scene, cssScene, camera, dreamNodes, onNodeClick, renderer, cssRenderer }) => {
  const [dreamNodeInstances, setDreamNodeInstances] = useState([]);

  const createDreamNode = useCallback((repoName, position) => {
    const element = document.createElement('div');
    element.className = 'dream-node';
    element.style.width = '200px';
    element.style.height = '200px';
    element.style.backgroundColor = 'rgba(0,127,127,0.5)';
    element.style.border = '1px solid white';
    element.textContent = repoName;

    const object = new CSS3DObject(element);
    object.position.copy(position);
    cssScene.add(object);

    return { object, element };
  }, [cssScene]);

  useEffect(() => {
    const newDreamNodeInstances = [];
    dreamNodes.forEach((node, index) => {
      const position = new THREE.Vector3(
        (index % 5) * 250 - 500,
        Math.floor(index / 5) * 250 - 500,
        0
      );
      const { object, element } = createDreamNode(node.repoName, position);
      newDreamNodeInstances.push({ object, element, repoName: node.repoName });
    });
    setDreamNodeInstances(newDreamNodeInstances);

    return () => {
      dreamNodeInstances.forEach((node) => {
        cssScene.remove(node.object);
      });
    };
  }, [dreamNodes, createDreamNode, cssScene]);

  return null;
};

export default DreamNodeGrid;
