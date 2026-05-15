import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Stars, Float } from "@react-three/drei";
import * as THREE from "three";
import type { Category } from "../../types";

interface KnowledgeGalaxyProps {
  categories: Category[];
  reviewedIds: Set<string>;
  flaggedIds: Set<string>;
  onSelect: (categoryId: string) => void;
}

interface NodeProps {
  position: [number, number, number];
  label: string;
  total: number;
  reviewed: number;
  flaggedCount: number;
  color: THREE.Color;
  onClick: () => void;
}

function CategoryNode({
  position,
  label,
  total,
  reviewed,
  flaggedCount,
  color,
  onClick,
}: NodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const progress = total > 0 ? reviewed / total : 0;
  const radius = 0.35 + Math.min(1.0, total / 33) * 0.4;

  useFrame((_, dt) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += dt * (hovered ? 0.9 : 0.25);
      meshRef.current.rotation.x += dt * 0.08;
      const targetScale = hovered ? 1.18 : 1;
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.12,
      );
    }
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <group position={position}>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
        <mesh
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = "auto";
          }}
        >
          <icosahedronGeometry args={[radius, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.25 + progress * 0.55}
            metalness={0.45}
            roughness={0.3}
            flatShading
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[
              radius * 1.45,
              0.025,
              12,
              80,
              Math.max(0.0001, progress * Math.PI * 2),
            ]}
          />
          <meshStandardMaterial
            color="#7be38e"
            emissive="#7be38e"
            emissiveIntensity={0.9}
          />
        </mesh>

        {flaggedCount > 0 && (
          <mesh position={[radius * 0.95, radius * 0.95, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#f0b842"
              emissive="#f0b842"
              emissiveIntensity={1.1}
            />
          </mesh>
        )}

        <Html
          center
          position={[0, -(radius + 0.35), 0]}
          style={{ pointerEvents: "none" }}
        >
          <div className={`galaxy-node-label ${hovered ? "hovered" : ""}`}>
            <div className="galaxy-node-title">{label}</div>
            <div className="galaxy-node-meta">
              {reviewed}/{total}
              {flaggedCount > 0 && <span> · 🔎 {flaggedCount}</span>}
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function distributeOnSphere(count: number, radius: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const offset = 2 / count;
  const inc = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = i * offset - 1 + offset / 2;
    const r = Math.sqrt(1 - y * y);
    const phi = i * inc;
    out.push([Math.cos(phi) * r * radius, y * radius, Math.sin(phi) * r * radius]);
  }
  return out;
}

const PALETTE = [
  "#6aa3e0",
  "#c98ad9",
  "#e8a86a",
  "#7bd4a8",
  "#e08aa3",
  "#7ec5d6",
  "#d6c46a",
  "#9b87e3",
];

export function KnowledgeGalaxy({
  categories,
  reviewedIds,
  flaggedIds,
  onSelect,
}: KnowledgeGalaxyProps) {
  const positions = useMemo(
    () => distributeOnSphere(categories.length, 2.6),
    [categories.length],
  );

  return (
    <div className="galaxy-canvas-wrap">
      <Canvas
        camera={{ position: [0, 0, 6.8], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#070a12"]} />
        <ambientLight intensity={0.45} />
        <pointLight position={[6, 6, 6]} intensity={1.3} color="#cfe1ff" />
        <pointLight position={[-6, -3, -4]} intensity={0.8} color="#9b87e3" />
        <Suspense fallback={null}>
          <Stars
            radius={40}
            depth={50}
            count={1200}
            factor={3}
            saturation={0}
            fade
            speed={0.6}
          />
          {categories.map((cat, i) => {
            const total = cat.questions.length;
            const reviewed = cat.questions.filter((q) =>
              reviewedIds.has(q.id),
            ).length;
            const flaggedCount = cat.questions.filter((q) =>
              flaggedIds.has(q.id),
            ).length;
            const color = new THREE.Color(PALETTE[i % PALETTE.length]);
            return (
              <CategoryNode
                key={cat.id}
                position={positions[i] ?? [0, 0, 0]}
                label={cat.label}
                total={total}
                reviewed={reviewed}
                flaggedCount={flaggedCount}
                color={color}
                onClick={() => onSelect(cat.id)}
              />
            );
          })}
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom
          autoRotate
          autoRotateSpeed={0.6}
          minDistance={4.5}
          maxDistance={11}
        />
      </Canvas>
      <div className="galaxy-hint">
        Drag to rotate · scroll to zoom · click an orb to open
      </div>
    </div>
  );
}
