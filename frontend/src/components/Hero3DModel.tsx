import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, MeshDistortMaterial, Torus, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Floating Particles ─────────────────────────────────────── */
const Particles = () => {
  const mesh = useRef<THREE.Points>(null);

  const [positions, randoms] = useMemo(() => {
    const count = 120;
    const pos = new Float32Array(count * 3);
    const rnd = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.6 + Math.random() * 2.2;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      rnd[i] = Math.random();
    }
    return [pos, rnd];
  }, []);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.04;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.02;
    }
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points ref={mesh} geometry={geo}>
      <pointsMaterial
        size={0.035}
        color="#a89cff"
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

/* ─── Orbiting Ring ──────────────────────────────────────────── */
const OrbitRing = ({
  radius,
  tube,
  tiltX,
  tiltZ,
  speed,
  color,
  opacity,
}: {
  radius: number;
  tube: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  color: string;
  opacity: number;
}) => {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 1, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/* ─── Central Morphing Core ──────────────────────────────────── */
const MorphingCore = () => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.15;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.22;
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.1, 128, 128]} />
      <MeshDistortMaterial
        color="#5a52f5"
        emissive="#a2a0caff"
        emissiveIntensity={0.4}
        distort={0.35}
        speed={1.8}
        roughness={0.05}
        metalness={0.6}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
};

/* ─── Inner Glow Shell ───────────────────────────────────────── */
const GlowShell = () => {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = -state.clock.elapsedTime * 0.08;
      mesh.current.rotation.y = -state.clock.elapsedTime * 0.12;
      const s = 1 + 0.04 * Math.sin(state.clock.elapsedTime * 0.9);
      mesh.current.scale.setScalar(s);
    }
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.38, 52, 52]} />
      <meshStandardMaterial
        color="#7b6eea"
        emissive="#a3a1bfff"
        emissiveIntensity={0.25}
        transparent
        opacity={0.12}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
};

/* ─── Full Scene ─────────────────────────────────────────────── */
const Scene = () => (
  <>
    <ambientLight intensity={0.6} />
    <pointLight position={[4, 4, 4]} intensity={6} color="#8975ffff" />
    <pointLight position={[-4, -4, -4]} intensity={3} color="#b3b2cbff" />
    <pointLight position={[0, 5, -3]} intensity={2} color="#ffffff" />

    <GlowShell />
    <MorphingCore />

    {/* Tilted orbital rings */}
    <OrbitRing radius={2.0} tube={0.012} tiltX={Math.PI / 3} tiltZ={0.3} speed={0.28} color="#8b7fff" opacity={0.7} />
    <OrbitRing radius={2.4} tube={0.008} tiltX={-Math.PI / 5} tiltZ={-0.5} speed={-0.18} color="#a89cff" opacity={0.5} />
    <OrbitRing radius={1.7} tube={0.01} tiltX={Math.PI / 7} tiltZ={1.2} speed={0.38} color="#6c5ce7" opacity={0.55} />

    <Particles />
  </>
);

/* ─── Canvas Wrapper ─────────────────────────────────────────── */
const Hero3DModel = () => (
  <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 48 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        enableRotate={false}
      />
    </Canvas>
  </div>
);

export default Hero3DModel;
