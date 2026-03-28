"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useRef, useState } from "react";

function EmberOrb({ mouse }: { mouse: [number, number] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.05;
    mesh.current.rotation.y += delta * 0.1;
    const tx = mouse[0] * 0.35 * viewport.width * 0.05;
    const ty = mouse[1] * 0.25 * viewport.height * 0.05;
    mesh.current.position.x += (tx - mesh.current.position.x) * 0.04;
    mesh.current.position.y += (ty - mesh.current.position.y) * 0.04;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.25} floatIntensity={0.35}>
      <mesh ref={mesh} scale={1.25}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#5C0301"
          emissive="#E15A15"
          emissiveIntensity={0.75}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  const [mouse, setMouse] = useState<[number, number]>([0, 0]);

  return (
    <div
      className="pointer-events-auto absolute inset-0 z-0 touch-none"
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
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 1.5]}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <fog attach="fog" args={["#120504", 6, 16]} />
        <ambientLight intensity={0.1} />
        <pointLight position={[6, 4, 6]} intensity={1.2} color="#E15A15" />
        <pointLight position={[-5, -2, 4]} intensity={0.4} color="#DA1702" />
        <EmberOrb mouse={mouse} />
        <Sparkles
          count={55}
          scale={10}
          size={1.6}
          speed={0.18}
          color="#A78F62"
          opacity={0.35}
        />
      </Canvas>
    </div>
  );
}
