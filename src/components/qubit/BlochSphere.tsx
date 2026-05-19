import { useMemo } from "react";
import * as THREE from "three";

const TEXT_MUTED = "#8c8780";

export function BlochSphere() {
  const wireGeometry = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(1, 3);
    return new THREE.EdgesGeometry(base, 1);
  }, []);

  const equatorGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
    const points2 = curve.getPoints(96);
    const points = points2.map(
      (p) => new THREE.Vector3(p.x, 0, p.y), // equator in XZ plane (Y is up)
    );
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const meridianXGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
    const points2 = curve.getPoints(96);
    const points = points2.map(
      (p) => new THREE.Vector3(p.x, p.y, 0), // XY plane
    );
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const meridianZGeometry = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2, false, 0);
    const points2 = curve.getPoints(96);
    const points = points2.map(
      (p) => new THREE.Vector3(0, p.x, p.y), // YZ plane
    );
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group>
      {/* Geodesic wireframe */}
      <lineSegments geometry={wireGeometry}>
        <lineBasicMaterial
          color={TEXT_MUTED}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </lineSegments>

      {/* Equator + two meridians */}
      <line geometry={equatorGeometry}>
        <lineBasicMaterial
          color={TEXT_MUTED}
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </line>
      <line geometry={meridianXGeometry}>
        <lineBasicMaterial
          color={TEXT_MUTED}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </line>
      <line geometry={meridianZGeometry}>
        <lineBasicMaterial
          color={TEXT_MUTED}
          transparent
          opacity={0.35}
          depthWrite={false}
        />
      </line>
    </group>
  );
}
