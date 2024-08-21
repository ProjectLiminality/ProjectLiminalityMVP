import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import * as THREE from 'three';
import DreamNode from '../DreamNode';

// Mock Three.js classes and methods
jest.mock('three', () => ({
  Object3D: jest.fn(() => ({
    add: jest.fn(),
    rotation: { y: 0 },
    position: { copy: jest.fn() },
  })),
  Vector3: jest.fn(() => ({
    copy: jest.fn(),
    lerpVectors: jest.fn(),
  })),
  CircleGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(() => ({
    position: {
      copy: jest.fn()
    }
  })),
  Scene: jest.fn(() => ({
    addEventListener: jest.fn(),
  })),
}));

jest.mock('three/examples/jsm/renderers/CSS3DRenderer', () => ({
  CSS3DObject: jest.fn(() => ({
    position: { set: jest.fn() },
    scale: { set: jest.fn() },
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
      add: jest.fn()
    };
  });

  test('initializes correctly', () => {
    expect(dreamNode.scene).toBe(mockScene);
    expect(dreamNode.object).toBeDefined();
    expect(dreamNode.isRotating).toBe(false);
    expect(dreamNode.targetRotation).toBe(0);
    expect(dreamNode.isMoving).toBe(false);
  });

  test('createNode method creates necessary objects', () => {
    const spy = jest.spyOn(dreamNode, 'createSide');
    dreamNode.createNode();
    expect(THREE.CircleGeometry).toHaveBeenCalled();
    expect(THREE.MeshBasicMaterial).toHaveBeenCalled();
    expect(THREE.Mesh).toHaveBeenCalled();
    expect(THREE.Mesh().position.copy).toHaveBeenCalledWith(dreamNode.position);
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

  test('updatePosition method sets movement properties', () => {
    const newPosition = new THREE.Vector3(1, 1, 1);
    dreamNode.updatePosition(newPosition);
    expect(dreamNode.isMoving).toBe(true);
    expect(dreamNode.targetPosition).toEqual(newPosition);
  });

  test('update method handles movement', () => {
    const startPosition = new THREE.Vector3(0, 0, 0);
    const targetPosition = new THREE.Vector3(1, 1, 1);
    dreamNode.startPosition = startPosition;
    dreamNode.targetPosition = targetPosition;
    dreamNode.isMoving = true;
    dreamNode.movementStartTime = Date.now() - 750; // Half of movement duration
    dreamNode.update();
    expect(dreamNode.object.position.copy).toHaveBeenCalled();
  });

  test('easeInOutCubic function returns correct values', () => {
    expect(dreamNode.easeInOutCubic(0)).toBe(0);
    expect(dreamNode.easeInOutCubic(0.5)).toBe(0.5);
    expect(dreamNode.easeInOutCubic(1)).toBe(1);
  });
});
