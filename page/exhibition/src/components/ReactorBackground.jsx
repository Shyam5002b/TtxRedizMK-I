import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

// Custom GLSL Shader for the Reactor Background
const ReactorMaterial = shaderMaterial(
  {
    uTime: 0,
    uSpeed: 1.0,
    uFlare: 0.0,
    uColorCore: new THREE.Color('#6a00ff'), // Purple core
    uColorEdge: new THREE.Color('#0044ff'), // Blue edge
    uColorActive: new THREE.Color('#ff2a00'), // Reddish violent flame
    uViolence: 0.0, // Driven by mouse movement
    uOpacity: 0.0, // For boot sequence fade-in
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uFlare;
    uniform float uViolence;
    uniform vec3 uColorCore;
    uniform vec3 uColorEdge;
    uniform vec3 uColorActive;
    uniform float uOpacity;

    varying vec2 vUv;

    // Ashima Simplex Noise 2D
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Base coordinates with zoom
      vec2 uv = vUv * 3.0;
      
      // Churning offset based on time, scroll speed, and mouse violence
      float t = uTime * (0.2 * uSpeed + uViolence * 3.0);
      
      // Layered noise for complexity
      float noise1 = snoise(uv + t);
      float noise2 = snoise(uv * 2.0 - t * 1.5) * 0.5;
      float noise3 = snoise(uv * 4.0 + t * 0.5) * 0.25;
      
      float finalNoise = noise1 + noise2 + noise3;
      
      // Radial gradient for core vs edge
      float dist = distance(vUv, vec2(0.5));
      
      // Flare effect brightens the core and expands it
      float flareMultiplier = 1.0 + uFlare * 0.5 + uViolence * 0.8;
      float coreIntensity = smoothstep(0.8, 0.0, dist / flareMultiplier);
      
      // Combine noise with radial intensity
      float fluid = finalNoise * 0.5 + 0.5;
      
      // Increase contrast based on violence for a sharper flame
      fluid = mix(fluid, pow(fluid, 0.6), uViolence);
      
      // Mix colors: Blue edge transitioning to Purple core
      vec3 color = mix(uColorEdge, uColorCore, coreIntensity * fluid);
      
      // Transition to active red violent flame based on mouse movement
      color = mix(color, uColorActive, uViolence * fluid * coreIntensity * 1.5);
      
      // Add brightness boost for flares and violence
      color += uColorCore * uFlare * fluid * 0.5;
      color += uColorActive * uViolence * fluid * 0.7;
      
      // Multiply color by opacity for smooth additive fade-in
      gl_FragColor = vec4(color * uOpacity, uOpacity);
    }
  `
);

extend({ ReactorMaterial });

export default function ReactorBackground() {
  const materialRef = useRef();
  
  const bootState = useStore((state) => state.bootState);
  const scrollSpeed = useStore((state) => state.scrollSpeed);
  const flareTrigger = useStore((state) => state.flareTrigger);
  
  // Track flare animation manually
  const flareAnim = useRef(0);
  const opacityAnim = useRef(0);
  const violenceAnim = useRef(0);
  const mousePos = useRef(new THREE.Vector2(0, 0));
  const mouseVelocity = useRef(0);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Time progression
    materialRef.current.uTime += delta;

    // Mouse velocity calculation
    const currentMouse = state.pointer;
    const distance = currentMouse.distanceTo(mousePos.current);
    // Smooth velocity reading
    mouseVelocity.current = THREE.MathUtils.lerp(mouseVelocity.current, distance / Math.max(delta, 0.001), 0.1);
    mousePos.current.copy(currentMouse);

    // Target violence based on mouse speed (clamp to max 1.0)
    // Scale velocity down so it requires fast movement to max out
    const targetViolence = Math.min(mouseVelocity.current * 0.15, 1.0);
    violenceAnim.current = THREE.MathUtils.lerp(violenceAnim.current, targetViolence, delta * 3.0);
    materialRef.current.uViolence = violenceAnim.current;

    // Base speed + scroll speed boost
    // Scroll speed should be absolute and decay
    const targetSpeed = 1.0 + Math.abs(scrollSpeed) * 5.0;
    materialRef.current.uSpeed = THREE.MathUtils.lerp(
      materialRef.current.uSpeed, 
      targetSpeed, 
      0.1
    );

    // Flare animation (spike up quickly, decay slowly)
    if (flareTrigger > 0 && flareAnim.current < 0.1) {
      // Just triggered (hacky way to detect new trigger: we update a ref)
      flareAnim.current = 1.0;
    }
    flareAnim.current = THREE.MathUtils.lerp(flareAnim.current, 0, delta * 2.0);
    materialRef.current.uFlare = flareAnim.current;

    // Boot sequence opacity
    const targetOpacity = bootState === 'ignite' ? 1.0 : 0.0;
    opacityAnim.current = THREE.MathUtils.lerp(opacityAnim.current, targetOpacity, delta * 0.5);
    materialRef.current.uOpacity = opacityAnim.current;
  });

  return (
    <mesh position={[0, 0, -10]}>
      {/* A large plane to cover the background */}
      <planeGeometry args={[50, 50]} />
      <reactorMaterial 
        ref={materialRef} 
        transparent={true} 
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
