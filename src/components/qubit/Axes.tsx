import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";

const ACCENT = "#b5a167";
const TEXT_DIM = "#4a4640";
const AXIS_LENGTH = 1.35;

function makeAxisGeometry(axis: "x" | "y" | "z") {
  const points: THREE.Vector3[] = [];
  if (axis === "x") {
    points.push(
      new THREE.Vector3(-AXIS_LENGTH, 0, 0),
      new THREE.Vector3(AXIS_LENGTH, 0, 0),
    );
  } else if (axis === "y") {
    points.push(
      new THREE.Vector3(0, -AXIS_LENGTH, 0),
      new THREE.Vector3(0, AXIS_LENGTH, 0),
    );
  } else {
    points.push(
      new THREE.Vector3(0, 0, -AXIS_LENGTH),
      new THREE.Vector3(0, 0, AXIS_LENGTH),
    );
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

export function Axes() {
  const xGeo = useMemo(() => makeAxisGeometry("x"), []);
  const yGeo = useMemo(() => makeAxisGeometry("y"), []);
  const zGeo = useMemo(() => makeAxisGeometry("z"), []);

  return (
    <group>
      <line geometry={xGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.45} />
      </line>
      <line geometry={yGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.45} />
      </line>
      <line geometry={zGeo}>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.45} />
      </line>

      {/* Pole labels: |0⟩ at +Y (top), |1⟩ at -Y (bottom) */}
      <Html
        position={[0, AXIS_LENGTH + 0.08, 0]}
        center
        distanceFactor={6}
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: "0.9rem",
          color: "#f5f1e8",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        |0⟩
      </Html>
      <Html
        position={[0, -AXIS_LENGTH - 0.08, 0]}
        center
        distanceFactor={6}
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: "0.9rem",
          color: "#f5f1e8",
          pointerEvents: "none",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        |1⟩
      </Html>

      {/* Axis end labels */}
      <Html
        position={[AXIS_LENGTH + 0.08, 0, 0]}
        center
        distanceFactor={7}
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: "0.65rem",
          color: TEXT_DIM,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        x
      </Html>
      <Html
        position={[0, 0, AXIS_LENGTH + 0.08]}
        center
        distanceFactor={7}
        style={{
          fontFamily: "JetBrains Mono, ui-monospace, monospace",
          fontSize: "0.65rem",
          color: TEXT_DIM,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        y
      </Html>
    </group>
  );
}
