import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, RoundedBox } from '@react-three/drei';
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
  const { faceCanvas, faceCtx, faceTexture } = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Initial dark screen
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 512, 256);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    return { faceCanvas: canvas, faceCtx: ctx, faceTexture: texture };
  }, []);

  // Update Face Canvas based on Boot State and Hover Mood
  useEffect(() => {
    if (!faceCtx || !faceTexture) return;
    
    // Draw helper
    const fillFace = (color) => {
      faceCtx.fillStyle = color;
      faceCtx.fillRect(0, 0, 512, 256);
      
      // Draw screen border glow (Agentix style)
      const gradient = faceCtx.createLinearGradient(0, 0, 512, 256);
      gradient.addColorStop(0, "rgba(50, 80, 255, 0.4)");
      gradient.addColorStop(1, "rgba(255, 50, 150, 0.4)");
      
      faceCtx.lineWidth = 14;
      faceCtx.strokeStyle = gradient;
      faceCtx.strokeRect(7, 7, 498, 242);
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
      faceTexture.needsUpdate = true;
    };

    const drawEyes = (mood) => {
      fillFace('#000000');
      faceCtx.fillStyle = '#ffffff';
      faceCtx.shadowColor = '#ffffff';
      faceCtx.shadowBlur = 15;
      
      const drawCircle = (x, y, r) => {
        faceCtx.beginPath();
        faceCtx.arc(x, y, r, 0, Math.PI * 2);
        faceCtx.fill();
        faceCtx.closePath();
      };
      
      if (mood === 'neutral' || !mood) {
        drawCircle(160, 128, 25);
        drawCircle(352, 128, 25);
      } else if (mood === 'happy') {
        // Happy arch eyes (U shapes)
        faceCtx.lineWidth = 12;
        faceCtx.lineCap = 'round';
        faceCtx.strokeStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(160, 138, 25, Math.PI, Math.PI * 2);
        faceCtx.stroke();
        faceCtx.beginPath();
        faceCtx.arc(352, 138, 25, Math.PI, Math.PI * 2);
        faceCtx.stroke();
      } else if (mood === 'focused') {
        // Focused semi-circles (looking sharp)
        faceCtx.beginPath();
        faceCtx.arc(160, 128, 25, 0, Math.PI, true); // draw upper half
        faceCtx.fill();
        faceCtx.beginPath();
        faceCtx.arc(352, 128, 25, 0, Math.PI, true);
        faceCtx.fill();
      } else if (mood === 'surprised') {
        // Wide outline circle eyes, looking hollow
        faceCtx.lineWidth = 10;
        faceCtx.strokeStyle = '#ffffff';
        faceCtx.beginPath();
        faceCtx.arc(160, 128, 30, 0, Math.PI * 2);
        faceCtx.stroke();
        faceCtx.beginPath();
        faceCtx.arc(352, 128, 30, 0, Math.PI * 2);
        faceCtx.stroke();
      } else if (mood === 'loading') {
        // Loading dots or spinning eyes
        faceCtx.fillRect(145, 123, 30, 10);
        faceCtx.fillRect(337, 123, 30, 10);
      }
      
      faceCtx.shadowBlur = 0;
      faceTexture.needsUpdate = true;
    };

    // Logic Tree
    if (bootState === 'black') {
      faceCtx.fillStyle = '#111111';
      faceCtx.fillRect(0, 0, 512, 256);
      faceTexture.needsUpdate = true;
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

  }, [bootState, hoveredProjectId, faceCtx, faceTexture]);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const t = state.clock.getElapsedTime();
    // Bobbing - adjusted lower to not overlap with text
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.15 - 1.0;
    
    // Mouse tracking
    const mouseX = (state.pointer.x * Math.PI) / 4;
    const mouseY = (state.pointer.y * Math.PI) / 4;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, mouseX, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -mouseY, 0.1);
  });

  return (
    <group ref={groupRef} position={[0, -1.0, -5]}>
      {/* Head */}
      <RoundedBox args={[2.4, 1.8, 1.8]} radius={0.4} smoothness={4} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#d4c9b9" roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* Screen Base */}
      <RoundedBox args={[2.1, 1.5, 0.1]} radius={0.1} smoothness={4} position={[0, 1.5, 0.91]}>
        <meshStandardMaterial color="#111111" />
      </RoundedBox>

      {/* Interactive LED Face (slightly in front of the screen base to prevent z-fighting) */}
      <mesh position={[0, 1.5, 0.98]}>
        <planeGeometry args={[1.9, 1.3]} />
        <meshBasicMaterial map={faceTexture} transparent={false} />
      </mesh>

      {/* Ears */}
      <mesh position={[-1.3, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.3, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Ear Rings glow */}
      <mesh position={[-1.46, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#9165ff" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[1.46, 1.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[0.1, 0.15, 32]} />
        <meshBasicMaterial color="#9165ff" side={THREE.DoubleSide} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial color="#9165ff" emissive="#9165ff" emissiveIntensity={0.5} />
      </mesh>

      {/* Body */}
      <RoundedBox args={[1.8, 1.5, 1.5]} radius={0.3} smoothness={4} position={[0, -0.3, 0]}>
        <meshStandardMaterial color="#d4c9b9" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[1.2, 1.0, 0.1]} radius={0.1} smoothness={4} position={[0, -0.3, 0.76]}>
        <meshStandardMaterial color="#bbafa0" />
      </RoundedBox>
      {/* Body Status Light (Diamond) */}
      <mesh position={[0, -0.3, 0.82]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color="#9165ff" />
      </mesh>

      {/* Arms */}
      <mesh position={[-1.1, -0.1, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[1.1, -0.1, 0]} rotation={[0, 0, Math.PI / 6]}>
        <capsuleGeometry args={[0.2, 0.6, 4, 16]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Legs & Feet */}
      <mesh position={[-0.5, -1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.5, -1.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.5]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[-0.5, -1.5, 0.1]}>
        <capsuleGeometry args={[0.25, 0.3, 4, 16]} />
        <meshStandardMaterial color="#d4c9b9" />
      </mesh>
      <mesh position={[0.5, -1.5, 0.1]}>
        <capsuleGeometry args={[0.25, 0.3, 4, 16]} />
        <meshStandardMaterial color="#d4c9b9" />
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
