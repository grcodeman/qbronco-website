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
  const haloRef = useRef<THREE.Mesh>(null);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array([0, 0, 0, ...position]);
    const attr = new THREE.BufferAttribute(positions, 3);
    attr.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("position", attr);
    return g;
  }, []);

  const target = useMemo(() => new THREE.Vector3(...position), []);
  const current = useMemo(() => new THREE.Vector3(...position), []);

  useFrame((_, delta) => {
    target.set(position[0], position[1], position[2]);
    current.lerp(target, Math.min(1, delta * 12));

    if (tipRef.current) {
      tipRef.current.position.copy(current);
    }

    const positions = lineGeometry.attributes.position.array as Float32Array;
    positions[3] = current.x;
    positions[4] = current.y;
    positions[5] = current.z;
    lineGeometry.attributes.position.needsUpdate = true;

    if (haloRef.current) {
      const t = performance.now() * 0.002;
      const pulse = 1 + Math.sin(t) * 0.08;
      haloRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={ACCENT_GLOW}
          transparent
          opacity={0.95}
          linewidth={1}
        />
      </line>

      <group ref={tipRef}>
        <mesh>
          <sphereGeometry args={[0.045, 24, 24]} />
          <meshBasicMaterial color={ACCENT_GLOW} />
        </mesh>
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
