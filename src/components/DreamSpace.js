import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { FlyControls } from '@react-three/drei';
import * as THREE from 'three';
import { scanDreamVault } from '../services/electronService';
import DreamNode3DR3F from './DreamNode3DR3F';
import DreamGraph from './DreamGraph';


const IntersectionChecker = ({ dreamNodes, hoveredNode, setHoveredNode }) => {
  const { raycaster, camera, scene } = useThree();
  const mouse = useRef(new THREE.Vector2());

  const checkIntersection = useCallback(() => {
    if (dreamNodes.length === 0) return;

    raycaster.setFromCamera(mouse.current, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
      const intersectedNode = intersects[0].object.parent;
      const intersectedRepoName = intersectedNode.userData.repoName;
      if (hoveredNode !== intersectedRepoName) {
        setHoveredNode(intersectedRepoName);
      }
    } else if (hoveredNode !== null) {
      setHoveredNode(null);
    }
  }, [dreamNodes, hoveredNode, setHoveredNode, raycaster, camera, scene]);

  useFrame(() => {
    checkIntersection();
  });

  useEffect(() => {
    const updateMouse = (event) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', updateMouse);
    return () => {
      window.removeEventListener('mousemove', updateMouse);
    };
  }, []);

  return null;
};


const DreamSpace = () => {
  const [dreamNodes, setDreamNodes] = useState([]);
  const [error, setError] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const mouse = useRef(new THREE.Vector2());

  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    tiltLeft: false,
    tiltRight: false,
  });

  const CameraController = () => {
    const { camera } = useThree();
    const moveSpeed = 10;
    const rotateSpeed = 0.002;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    useFrame(() => {
      const moveVector = new THREE.Vector3();

      if (moveState.current.forward) moveVector.z -= moveSpeed;
      if (moveState.current.backward) moveVector.z += moveSpeed;
      if (moveState.current.left) moveVector.x -= moveSpeed;
      if (moveState.current.right) moveVector.x += moveSpeed;
      if (moveState.current.up) moveVector.y += moveSpeed;
      if (moveState.current.down) moveVector.y -= moveSpeed;

      camera.translateX(moveVector.x);
      camera.translateY(moveVector.y);
      camera.translateZ(moveVector.z);

      const tiltSpeed = 0.02;
      if (moveState.current.tiltLeft) {
        camera.rotateZ(tiltSpeed);
      }
      if (moveState.current.tiltRight) {
        camera.rotateZ(-tiltSpeed);
      }
    });

    const onMouseMove = (event) => {
      if (isDragging) {
        const movementX = event.clientX - previousMousePosition.x;
        const movementY = event.clientY - previousMousePosition.y;

        camera.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), -movementX * rotateSpeed);
        camera.rotateX(-movementY * rotateSpeed);
        camera.up.set(0, 1, 0);

        previousMousePosition = { x: event.clientX, y: event.clientY };
      }

      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const onMouseDown = (event) => {
      if (event.button === 0) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = (event) => {
      if (event.button === 0) {
        isDragging = false;
      }
    };

    const onKeyDown = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w': moveState.current.forward = true; break;
        case 's': moveState.current.backward = true; break;
        case 'a': moveState.current.left = true; break;
        case 'd': moveState.current.right = true; break;
        case ' ': moveState.current.up = true; break;
        case 'shift': moveState.current.down = true; break;
        case 'q': moveState.current.tiltLeft = true; break;
        case 'e': moveState.current.tiltRight = true; break;
      }
    };

    const onKeyUp = (event) => {
      switch (event.key.toLowerCase()) {
        case 'w': moveState.current.forward = false; break;
        case 's': moveState.current.backward = false; break;
        case 'a': moveState.current.left = false; break;
        case 'd': moveState.current.right = false; break;
        case ' ': moveState.current.up = false; break;
        case 'shift': moveState.current.down = false; break;
        case 'q': moveState.current.tiltLeft = false; break;
        case 'e': moveState.current.tiltRight = false; break;
      }
    };

    React.useEffect(() => {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
      };
    }, []);

    return null;
  };

  const updateNode = useCallback((index, updates) => {
    setDreamNodes(prevNodes => {
      const newNodes = [...prevNodes];
      newNodes[index] = { ...newNodes[index], ...updates };
      return newNodes;
    });
  }, []);

  React.useEffect(() => {
    const fetchDreamNodes = async (count = 10, random = true) => {
      try {
        console.log('Scanning DreamVault...');
        const repos = await scanDreamVault();
        console.log('Repos found:', repos);
        if (repos.length > 0) {
          let selectedRepos = random
            ? repos.sort(() => 0.5 - Math.random()).slice(0, count)
            : repos.slice(0, count);
          console.log('Setting DreamNodes:', selectedRepos);
          const newNodes = selectedRepos.map((repo, index) => ({
            repoName: repo,
            position: new THREE.Vector3(
              (index % 3) * 200 - 200,
              Math.floor(index / 3) * 200 - 200,
              0
            )
          }));
          setDreamNodes(newNodes);
        } else {
          console.error('No repositories found in the DreamVault');
          setError('No repositories found in the DreamVault');
        }
      } catch (error) {
        console.error('Error scanning dream vault:', error);
        setError('Error scanning dream vault: ' + error.message);
      }
    };

    fetchDreamNodes();
  }, []);

  const handleNodeClick = (repoName) => {
    console.log('Node clicked:', repoName);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 1000], fov: 75, near: 0.1, far: 3000 }}>
        <FlyControls movementSpeed={100} rollSpeed={0.5} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {dreamNodes.map((node) => (
          <DreamNode3DR3F
            key={node.repoName}
            repoName={node.repoName}
            position={node.position}
            onNodeClick={handleNodeClick}
            isHovered={hoveredNode === node.repoName}
            setHoveredNode={setHoveredNode}
          />
        ))}
        <IntersectionChecker
          dreamNodes={dreamNodes}
          hoveredNode={hoveredNode}
          setHoveredNode={setHoveredNode}
        />
        <axesHelper args={[5]} />
      </Canvas>
      {dreamNodes.length === 0 && (
        <div style={{ color: 'white', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          Loading...
        </div>
      )}
      <DreamGraph dreamNodes={dreamNodes} updateNode={updateNode} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, color: 'white' }}>
        Node count: {dreamNodes.length}
      </div>
    </div>
  );
};

export default DreamSpace;
