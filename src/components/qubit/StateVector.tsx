import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#b5a167";
const ACCENT_GLOW = "#d4bc7a";

interface Props {
  position: [number, number, number];
}

export function StateVector({ position }: Props) {
  const tipRef = useRef<THREE.Group>(null);
  const lineRef = useRef<THREE.BufferGeometry>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  // Smoothed target for visually nicer transitions when state jumps.
  const target = useMemo(() => new THREE.Vector3(...position), []);
  const current = useMemo(() => new THREE.Vector3(...position), []);

  useFrame((_, delta) => {
    target.set(position[0], position[1], position[2]);
    current.lerp(target, Math.min(1, delta * 12));

    if (tipRef.current) {
      tipRef.current.position.copy(current);
    }
    if (lineRef.current) {
      const positions = lineRef.current.attributes.position
        .array as Float32Array;
      positions[3] = current.x;
      positions[4] = current.y;
      positions[5] = current.z;
      lineRef.current.attributes.position.needsUpdate = true;
    }
    if (haloRef.current) {
      const t = performance.now() * 0.002;
      const pulse = 1 + Math.sin(t) * 0.08;
      haloRef.current.scale.setScalar(pulse);
    }
  });

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, ...position]);
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <group>
      <line ref={lineRef as never} geometry={lineGeometry}>
        <lineBasicMaterial
          color={ACCENT_GLOW}
          transparent
          opacity={0.95}
          linewidth={1}
        />
      </line>

      <group ref={tipRef}>
        {/* Inner solid dot */}
        <mesh>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color={ACCENT_GLOW} />
        </mesh>
        {/* Halo */}
        <mesh ref={haloRef}>
          <sphereGeometry args={[0.085, 24, 24]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.28}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
