import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as THREE from 'three';
import DreamNode from '../DreamNode';

// Mock Three.js classes and methods
jest.mock('three', () => ({
  Object3D: jest.fn(),
  Vector3: jest.fn(),
  CircleGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(),
  Scene: jest.fn(() => ({
    addEventListener: jest.fn(),
  })),
}));

jest.mock('three/examples/jsm/renderers/CSS3DRenderer', () => ({
  CSS3DObject: jest.fn(),
}));

describe('DreamNode', () => {
  let dreamNode;
  let mockScene;

  beforeEach(() => {
    mockScene = new THREE.Scene();
    dreamNode = new DreamNode({ scene: mockScene });
  });

  test('initializes correctly', () => {
    expect(dreamNode.scene).toBe(mockScene);
    expect(dreamNode.object).toBeDefined();
    expect(dreamNode.isRotating).toBe(false);
    expect(dreamNode.targetRotation).toBe(0);
  });

  test('createNode method creates necessary objects', () => {
    const spy = jest.spyOn(dreamNode, 'createSide');
    dreamNode.createNode();
    expect(THREE.CircleGeometry).toHaveBeenCalled();
    expect(THREE.MeshBasicMaterial).toHaveBeenCalled();
    expect(THREE.Mesh).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  test('rotateNode method sets rotation properties', () => {
    dreamNode.rotateNode();
    expect(dreamNode.isRotating).toBe(true);
    expect(dreamNode.targetRotation).toBe(Math.PI);
  });

  test('update method handles rotation', () => {
    dreamNode.isRotating = true;
    dreamNode.targetRotation = Math.PI;
    dreamNode.object.rotation.y = 0;
    dreamNode.update();
    expect(dreamNode.object.rotation.y).toBeGreaterThan(0);
  });

  test('onNodeClick method triggers rotation', () => {
    const mockEvent = {
      intersects: [{ object: { parent: dreamNode.object } }],
    };
    dreamNode.onNodeClick(mockEvent);
    expect(dreamNode.isRotating).toBe(true);
  });
});
