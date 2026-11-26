import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface SuspectData3D {
  status: string;
  landmarks_3d: Record<string, number[][]>;
  depth_analysis: Record<string, number>;
  head_pose_3d: { yaw: number; pitch: number; roll: number; quality: string };
  reconstruction_quality: {
    confidence: number; landmark_count: number;
    mesh_vertices: number; mesh_faces: number;
    texture_quality: string; depth_accuracy: number;
  };
}

// ─── Face mesh geometry ──────────────────────────────────────────────────────
function ForensicFaceMesh({ wireframe }: { wireframe: boolean }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Slow rotate
  useFrame((_, dt) => {
    groupRef.current.rotation.y += dt * 0.2;
  });

  // Build a face-shaped mesh from a sphere + displacement
  const faceGeo = useMemo(() => {
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < pos.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];

      // Convert to spherical
      const len = Math.sqrt(x * x + y * y + z * z);
      const nx = x / len, ny = y / len, nz = z / len;

      // Only modify front face (nz > 0)
      if (nz > 0.1) {
        let disp = 0;

        // Flatten forehead
        if (ny > 0.5 && nz > 0.3) disp -= 0.04;

        // Eye sockets (left and right)
        const leftEye = Math.sqrt((nx + 0.3) ** 2 + (ny - 0.15) ** 2);
        const rightEye = Math.sqrt((nx - 0.3) ** 2 + (ny - 0.15) ** 2);
        if (leftEye < 0.18) disp -= 0.08 * (1 - leftEye / 0.18);
        if (rightEye < 0.18) disp -= 0.08 * (1 - rightEye / 0.18);

        // Nose bridge & tip
        const noseBridge = Math.sqrt(nx ** 2 + (ny - 0.05) ** 2);
        if (noseBridge < 0.1 && ny > -0.1 && ny < 0.25) disp += 0.12 * (1 - noseBridge / 0.1);

        // Nose tip
        const noseTip = Math.sqrt(nx ** 2 + (ny + 0.05) ** 2);
        if (noseTip < 0.18) disp += 0.14 * Math.max(0, 1 - noseTip / 0.18);

        // Cheekbones
        const lCheek = Math.sqrt((nx + 0.45) ** 2 + (ny + 0.05) ** 2);
        const rCheek = Math.sqrt((nx - 0.45) ** 2 + (ny + 0.05) ** 2);
        if (lCheek < 0.22) disp += 0.05 * (1 - lCheek / 0.22);
        if (rCheek < 0.22) disp += 0.05 * (1 - rCheek / 0.22);

        // Lips
        const lips = Math.sqrt(nx ** 2 + (ny + 0.28) ** 2);
        if (lips < 0.18) disp += 0.06 * (1 - lips / 0.18);

        // Chin
        const chin = Math.sqrt(nx ** 2 + (ny + 0.5) ** 2);
        if (chin < 0.2) disp += 0.04 * (1 - chin / 0.2);

        arr[i * 3]     = x + nx * disp;
        arr[i * 3 + 1] = y + ny * disp;
        arr[i * 3 + 2] = z + nz * disp;
      } else {
        // Flatten the back of the head slightly
        arr[i * 3 + 2] = z * 0.85;
      }
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  const matColor   = wireframe ? '#00ffcc' : '#1a6b8a';
  const emissive   = wireframe ? '#003322' : '#001122';
  const wireColor  = '#00ccaa';

  return (
    <group ref={groupRef} scale={[0.9, 1.1, 0.85]}>
      {/* Main face mesh */}
      <mesh geometry={faceGeo} castShadow>
        {wireframe ? (
          <meshStandardMaterial color={matColor} wireframe emissive={emissive} />
        ) : (
          <meshStandardMaterial
            color={matColor} roughness={0.55} metalness={0.15}
            emissive={emissive} emissiveIntensity={0.4}
          />
        )}
      </mesh>

      {/* Overlay wireframe for forensic look */}
      {!wireframe && (
        <mesh geometry={faceGeo}>
          <meshStandardMaterial color={wireColor} wireframe transparent opacity={0.15} />
        </mesh>
      )}

      {/* Eye whites - left */}
      <mesh position={[-0.29, 0.16, 0.9]} scale={[0.13, 0.08, 0.05]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={wireframe ? '#00ffcc' : '#ffffff'} wireframe={wireframe} />
      </mesh>
      {/* Eye whites - right */}
      <mesh position={[0.29, 0.16, 0.9]} scale={[0.13, 0.08, 0.05]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={wireframe ? '#00ffcc' : '#ffffff'} wireframe={wireframe} />
      </mesh>

      {/* Iris - left */}
      <mesh position={[-0.29, 0.16, 0.95]} scale={[0.065, 0.065, 0.02]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={wireframe ? '#00ff88' : '#3b6e8c'} wireframe={wireframe} emissive={wireframe ? '#004422' : '#000'} />
      </mesh>
      {/* Iris - right */}
      <mesh position={[0.29, 0.16, 0.95]} scale={[0.065, 0.065, 0.02]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={wireframe ? '#00ff88' : '#3b6e8c'} wireframe={wireframe} emissive={wireframe ? '#004422' : '#000'} />
      </mesh>

      {/* Lips */}
      <mesh position={[0, -0.28, 0.93]} scale={[0.22, 0.05, 0.06]}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshStandardMaterial color={wireframe ? '#00ffcc' : '#8b3a3a'} wireframe={wireframe} />
      </mesh>
      <mesh position={[0, -0.32, 0.91]} scale={[0.18, 0.05, 0.05]}>
        <sphereGeometry args={[1, 16, 8]} />
        <meshStandardMaterial color={wireframe ? '#00ffcc' : '#7a2a2a'} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

// ─── Landmark dots ────────────────────────────────────────────────────────────
function LandmarkPoints({ landmarks3d }: { landmarks3d: Record<string, number[][]> }) {
  const groupColors: Record<string, string> = {
    jawline: '#00ffe0', right_eyebrow: '#ff44cc', left_eyebrow: '#ff44cc',
    nose_bridge: '#ffdd00', nose_tip: '#ffaa00',
    right_eye: '#44aaff', left_eye: '#44aaff',
    outer_lips: '#ff4444', inner_lips: '#ff7777',
  };

  return (
    <group>
      {Object.entries(landmarks3d).map(([group, pts]) =>
        pts.map((p, i) => {
          const [x, y, z] = [p[0] * 2, p[1] * 2, p[2] * 2];
          return (
            <mesh key={`${group}-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[0.018, 6, 6]} />
              <meshBasicMaterial color={groupColors[group] || '#ffffff'} />
            </mesh>
          );
        })
      )}
    </group>
  );
}

// ─── Scanning ring ────────────────────────────────────────────────────────────
function ScanRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.9) * 1.1;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.15, 0.006, 8, 80]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.7} />
    </mesh>
  );
}

// ─── Measurement lines ────────────────────────────────────────────────────────
function MeasurementLines() {
  return (
    <group>
      {/* Horizontal cross-section lines */}
      <Line points={[[-1.3, 0.15, 0], [1.3, 0.15, 0]]} color="#00ccaa" lineWidth={0.5} transparent opacity={0.3} />
      <Line points={[[-1.3, -0.28, 0], [1.3, -0.28, 0]]} color="#00ccaa" lineWidth={0.5} transparent opacity={0.3} />
      <Line points={[[-1.3, 0.55, 0], [1.3, 0.55, 0]]} color="#00ccaa" lineWidth={0.5} transparent opacity={0.3} />
      {/* Vertical centerline */}
      <Line points={[[0, -1.2, 0], [0, 1.3, 0]]} color="#ff4444" lineWidth={0.5} transparent opacity={0.25} />
    </group>
  );
}

// ─── Main exported component ──────────────────────────────────────────────────
export function FaceViewer3D({ data, wireframe }: {
  data: SuspectData3D;
  textureUrl: string;
  wireframe: boolean;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 42 }} shadows gl={{ antialias: true }}>
      <color attach="background" args={['#020810']} />
      <fog attach="fog" args={['#020810', 10, 20]} />

      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[2, 4, 3]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[-2, 1, -1]} intensity={0.6} color="#6633ff" />
      <pointLight position={[0, -1, 2]} intensity={0.5} color="#00ccff" />
      <pointLight position={[2, 0, 1]} intensity={0.3} color="#00ffaa" />

      {/* Floor grid */}
      <gridHelper args={[8, 24, '#0a1a1a', '#0a1a1a']} position={[0, -1.35, 0]} />

      {/* Scan animation */}
      <ScanRing />

      {/* Measurement reference lines */}
      <MeasurementLines />

      <Suspense fallback={null}>
        {/* The face */}
        <ForensicFaceMesh wireframe={wireframe} />

        {/* 3D landmark points */}
        <LandmarkPoints landmarks3d={data.landmarks_3d} />
      </Suspense>

      {/* 3D axes */}
      <axesHelper args={[1.8]} />

      <OrbitControls
        enableDamping dampingFactor={0.08}
        minDistance={1.8} maxDistance={6}
        autoRotate={false}
      />
    </Canvas>
  );
}
