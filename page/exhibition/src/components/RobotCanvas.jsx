import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';
import { projectData } from '../data/projects';
import ReactorBackground from './ReactorBackground';

// The Interactive Robot component
function InteractiveRobot() {
  const groupRef = useRef();
  const faceTextureRef = useRef(null);
  const canvasRef = useRef(null);
  
  const bootState = useStore((state) => state.bootState);
  const hoveredProjectId = useStore((state) => state.hoveredProject);
  
  // Memoize canvas setup so it persists
  const [faceCtx, setFaceCtx] = useState(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Initial black screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 256);
    
    canvasRef.current = canvas;
    faceTextureRef.current = new THREE.CanvasTexture(canvas);
    faceTextureRef.current.colorSpace = THREE.SRGBColorSpace;
    setFaceCtx(ctx);
  }, []);

  // Update Face Canvas based on Boot State and Hover Mood
  useEffect(() => {
    if (!faceCtx || !faceTextureRef.current) return;
    
    // Draw helper
    const fillFace = (color) => {
      faceCtx.fillStyle = color;
      faceCtx.fillRect(0, 0, 512, 256);
    };

    const drawText = (text, size = '40px') => {
      fillFace('#000000');
      faceCtx.fillStyle = '#ffffff';
      faceCtx.font = `bold ${size} monospace`;
      faceCtx.textAlign = 'center';
      faceCtx.textBaseline = 'middle';
      faceCtx.shadowColor = '#ffffff';
      faceCtx.shadowBlur = 10;
      faceCtx.fillText(text, 256, 128);
      faceCtx.shadowBlur = 0;
      faceTextureRef.current.needsUpdate = true;
    };

    const drawEyes = (mood) => {
      fillFace('#000000');
      faceCtx.fillStyle = '#ffffff';
      faceCtx.shadowColor = '#ffffff';
      faceCtx.shadowBlur = 15;
      
      if (mood === 'neutral' || !mood) {
        faceCtx.fillRect(80, 80, 80, 60);
        faceCtx.fillRect(352, 80, 80, 60);
      } else if (mood === 'happy') {
        faceCtx.fillRect(80, 100, 80, 30);
        faceCtx.fillRect(352, 100, 80, 30);
      } else if (mood === 'focused') {
        faceCtx.beginPath();
        faceCtx.moveTo(80, 80); faceCtx.lineTo(160, 100); faceCtx.lineTo(160, 120); faceCtx.lineTo(80, 120);
        faceCtx.fill();
        faceCtx.beginPath();
        faceCtx.moveTo(432, 80); faceCtx.lineTo(352, 100); faceCtx.lineTo(352, 120); faceCtx.lineTo(432, 120);
        faceCtx.fill();
      } else if (mood === 'surprised') {
        faceCtx.fillRect(90, 60, 60, 90);
        faceCtx.fillRect(362, 60, 60, 90);
      }
      
      faceCtx.shadowBlur = 0;
      faceTextureRef.current.needsUpdate = true;
    };

    // Logic Tree
    if (bootState === 'black') {
      fillFace('#000000');
      faceTextureRef.current.needsUpdate = true;
    } else if (bootState === 'init') {
      drawText('Initialize Protocol', '30px');
    } else if (bootState === 'system_on') {
      drawText('System On');
    } else if (bootState === 'ignite') {
      // Find mood based on hovered project
      let targetMood = 'neutral';
      if (hoveredProjectId) {
        const proj = projectData.find(p => p.id === hoveredProjectId);
        if (proj) targetMood = proj.robot_mood;
      }
      drawEyes(targetMood);
    }

  }, [bootState, hoveredProjectId, faceCtx]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    // Bobbing
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.2 + 2;
    
    // Mouse tracking
    const mouseX = (state.pointer.x * Math.PI) / 4;
    const mouseY = (state.pointer.y * Math.PI) / 4;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY, 0.1);
  });

  return (
    <group ref={groupRef} position={[0, 2, -5]}>
      {/* Glossy Pill shape */}
      <mesh>
        <capsuleGeometry args={[1, 2.5, 4, 16]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          metalness={0.6} 
          roughness={0.1} 
          clearcoat={1} 
        />
      </mesh>
      {/* Interactive LED Face */}
      <mesh position={[0, 0.5, 1.01]}>
        <planeGeometry args={[1.5, 0.8]} />
        {faceTextureRef.current ? (
          <meshBasicMaterial map={faceTextureRef.current} transparent />
        ) : (
          <meshBasicMaterial color="#000000" />
        )}
      </mesh>
    </group>
  );
}

const RobotCanvas = () => {
  return (
    <div id="canvas-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1 }}>
      <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
        {/* Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[-10, 10, 10]} intensity={1.5} />
        <directionalLight position={[10, 5, 5]} intensity={1.0} color="#00aaff" />
        
        <Environment preset="city" />

        {/* Starry Space Background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Phase 1: Reactor Background */}
        <ReactorBackground />

        {/* The Interactive Responsive Robot */}
        <InteractiveRobot />
      </Canvas>
    </div>
  );
};

export default RobotCanvas;
