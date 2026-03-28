"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

function AshokaChakra({ scrollProgress }: { scrollProgress: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Base Chakra Color: Navy Blue (as required by the original emblem, while the environment holds the flag colors)
  const chakraColor = "#000080";
  const materialProps = { 
    color: chakraColor, 
    roughness: 0.2, 
    metalness: 0.8,
    emissive: "#000030", // Slight inner glow
    emissiveIntensity: 0.5 
  };

  // Generate the 24 spokes and bumps
  const spokes = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      return (
        <group key={i} rotation={[0, 0, angle]}>
          <mesh position={[0, 1.15, 0]}>
             <cylinderGeometry args={[0.01, 0.08, 1.6, 8]} />
             <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
             <cylinderGeometry args={[0.08, 0.04, 0.15, 8]} />
             <meshStandardMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 1.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
             <meshStandardMaterial {...materialProps} />
          </mesh>
        </group>
      );
    });
  }, [materialProps.color, materialProps.roughness, materialProps.metalness, materialProps.emissive, materialProps.emissiveIntensity]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Constant rotation of the Chakra
    groupRef.current.rotation.z -= delta * 0.4;
    
    // Smooth scroll interpolation
    // Target Z: Camera is at Z=7. As we scroll, object moves past the camera to Z = 12
    const targetZ = -10 + scrollProgress.current * 22; 
    
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z, 
      targetZ, 
      0.08
    );
  });

  return (
    <group ref={groupRef}>
      {/* Outer Ring */}
      <mesh>
        <torusGeometry args={[1.9, 0.15, 32, 100]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* Inner Hub (Emblem Center) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.2, 32]} />
        <meshStandardMaterial {...materialProps} />
      </mesh>

      {/* The 24 Spikes */}
      {spokes}
    </group>
  );
}

function SceneLightsAndParticles({ mouse }: { mouse: [number, number] }) {
  const { viewport } = useThree();
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    // Parallax on mouse move
    const tx = mouse[0] * viewport.width * 0.02;
    const ty = mouse[1] * viewport.height * 0.02;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, tx, 0.05);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, ty, 0.05);
  });

  return (
    <group ref={group}>
      {/* Lighting formatted as Saffron, White, and Green */}
      <ambientLight intensity={0.4} color="#ffffff" />
      <pointLight position={[-5, 4, 3]} intensity={4} color="#D14F00" />  {/* Saffron (India) top left */}
      <pointLight position={[5, -4, 3]} intensity={4} color="#034A26" />   {/* Green (India) bottom right */}
      <pointLight position={[0, 0, 8]} intensity={2} color="#FFFFFF" />    {/* White (India) center */}
    </group>
  );
}

export default function HeroScene() {
  const [mouse, setMouse] = useState<[number, number]>([0, 0]);
  const scrollRatio = useRef(0);

  // Hook into the page scroll entirely for the zoom/reveal effect
  useEffect(() => {
    const handleScroll = () => {
      // Get how far down the page we've scrolled.
      // E.g., over the first 800px or window height, complete the animation.
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate fraction (0.0 to 1.0) of scrolling down the first full screen
      scrollRatio.current = Math.min(Math.max(scrollY / windowHeight, 0), 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 touch-none"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMouse([
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -(((e.clientY - r.top) / r.height) * 2 - 1),
        ]);
      }}
      onPointerLeave={() => setMouse([0, 0])}
    >
      <Canvas
        className="h-full w-full"
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
        // Note: clearing transparently so the rest of the site shows behind it when Z zooms past
        onCreated={({ gl }) => gl.setClearColor(0xffffff, 0)}
      >
        <SceneLightsAndParticles mouse={mouse} />
        
        {/* Float adds a slow hovering motion while it rotates */}
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
          <AshokaChakra scrollProgress={scrollRatio} />
        </Float>
      </Canvas>
    </div>
  );
}
