import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sparkles, Float } from "@react-three/drei";
import * as THREE from "three";

interface ProgressOrbProps {
  progress: number;
  size?: number;
  ariaLabel?: string;
}

function Orb({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.4;
      groupRef.current.rotation.x = Math.sin(performance.now() / 1800) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += dt * 0.6;
    }
  });

  const color = useMemo(() => {
    const c = new THREE.Color();
    const hue = (210 - 70 * progress) / 360;
    const sat = 0.55 + 0.25 * progress;
    const light = 0.45 + 0.1 * progress;
    c.setHSL(hue, sat, light);
    return c;
  }, [progress]);

  const ringArc = Math.max(0.0001, progress * Math.PI * 2);

  return (
    <group ref={groupRef}>
      <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.6}>
        <mesh>
          <icosahedronGeometry args={[1, 6]} />
          <MeshDistortMaterial
            color={color}
            distort={0.35 + progress * 0.15}
            speed={1.6}
            roughness={0.25}
            metalness={0.55}
          />
        </mesh>
      </Float>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.045, 16, 96, ringArc]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>

      <Sparkles count={28} scale={3.2} size={2} speed={0.4} color={color} />
    </group>
  );
}

export function ProgressOrb({ progress, size = 56, ariaLabel }: ProgressOrbProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <div
      className="progress-orb"
      style={{ width: size, height: size }}
      aria-label={ariaLabel ?? `Progress: ${Math.round(clamped * 100)}%`}
      role="img"
    >
      <Canvas
        camera={{ position: [0, 0, 3.6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} />
        <pointLight position={[-4, -2, -3]} intensity={0.6} color="#9ad7ff" />
        <Suspense fallback={null}>
          <Orb progress={clamped} />
        </Suspense>
      </Canvas>
    </div>
  );
}
