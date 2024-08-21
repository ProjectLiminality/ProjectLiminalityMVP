import React from 'react';
import * as THREE from 'three';
import DreamNode from '../DreamNode';

jest.mock('three', () => ({
  Object3D: jest.fn(() => ({
    add: jest.fn(),
    rotation: { y: 0 },
    position: { copy: jest.fn() },
  })),
  Vector3: jest.fn(() => ({
    copy: jest.fn(),
  })),
  Scene: jest.fn(() => ({
    addEventListener: jest.fn(),
  })),
}));

describe('DreamNode', () => {
  let dreamNode;
  let mockScene;

  beforeEach(() => {
    mockScene = new THREE.Scene();
    dreamNode = new DreamNode({ 
      scene: mockScene,
      position: new THREE.Vector3(0, 0, 0)
    });
    dreamNode.object = {
      rotation: { y: 0 },
      position: { copy: jest.fn() },
    };
  });

  // Add your tests here
});
