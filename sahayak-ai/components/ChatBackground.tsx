"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles, Stars, Float } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function DataParticles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = 200;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t } = particle;
      const { factor, speed, xFactor, yFactor, zFactor } = particle;
      t = particle.t += speed / 2;
      const a = Math.cos(t) + Math.sin(t * 1) / 10;
      const b = Math.sin(t) + Math.cos(t * 2) / 10;
      const s = Math.cos(t);
      dummy.position.set(
        (particle.mx / 10) * a + xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        (particle.my / 10) * b + yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        (particle.my / 10) * b + zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.set(s, s, s);
      dummy.rotation.set(s * 5, s * 5, s * 5);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={[0, 0, -30]}>
      <octahedronGeometry args={[0.2, 0]} />
      <meshBasicMaterial color="#DA1702" transparent opacity={0.3} wireframe />
    </instancedMesh>
  );
}

function EngineCore() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.002;
    mesh.current.rotation.x += 0.001;
  });

  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={mesh} position={[5, 0, -10]} scale={2.5}>
        <icosahedronGeometry args={[2, 1]} />
        <meshStandardMaterial 
          color="#FF7A00" 
          wireframe 
          transparent 
          opacity={0.15} 
          emissive="#DA1702"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[-6, -4, -15]} scale={1.5}>
        <torusKnotGeometry args={[1.5, 0.4, 64, 8]} />
        <meshBasicMaterial color="#A78F62" wireframe transparent opacity={0.1} />
      </mesh>
    </Float>
  );
}

export default function ChatBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
      >
        <fog attach="fog" args={["#0a0a0a", 10, 40]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <EngineCore />
        <DataParticles />
        <Stars radius={50} depth={50} count={1500} factor={4} saturation={0} fade speed={1} />
        <Sparkles count={100} scale={20} size={2} speed={0.4} color="#FF7A00" opacity={0.2} />
      </Canvas>
    </div>
  );
}