"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function CursorEffect() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    let idCounter = 0;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      setTrail((prev) => {
        const newTrail = [...prev, { x: e.clientX, y: e.clientY, id: idCounter++ }];
        if (newTrail.length > 15) {
          newTrail.shift();
        }
        return newTrail;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const interval = setInterval(() => {
      setTrail((prev) => (prev.length > 0 ? prev.slice(1) : []));
    }, 40);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden mix-blend-screen">
      <div
        className="absolute w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px] bg-amber-600/30 transition-transform duration-75 ease-out"
        style={{ left: position.x, top: position.y }}
      />
      {trail.map((pt, i) => (
        <div
          key={pt.id}
          className="absolute"
          style={{
            left: pt.x,
            top: pt.y,
            opacity: i / 15,
            transform: `translate(-50%, -50%) scale(${i / 10}) rotate(${pt.id * 10}deg)`,
            transition: 'opacity 0.1s ease-out, transform 0.1s ease-out'
          }}
        >
          <Sparkles className="text-amber-400/80 w-3 h-3" />
        </div>
      ))}
    </div>
  );
}
