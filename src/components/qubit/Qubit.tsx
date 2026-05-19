import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

import { BlochSphere } from "./BlochSphere";
import { Axes } from "./Axes";
import { StateVector } from "./StateVector";
import { Readout } from "./Readout";
import { useQubitState, type QubitDerived } from "./useQubitState";

const IDLE_RESUME_MS = 2000;
const AMBIENT_ROT_SPEED = 0.12; // rad / sec
const DRAG_THETA_SCALE = 0.006;
const DRAG_PHI_SCALE = 0.008;

interface SceneProps {
  interactive: boolean;
  reducedMotion: boolean;
  onDerived: (d: QubitDerived) => void;
}

function Scene({ interactive, reducedMotion, onDerived }: SceneProps) {
  const { state, derived, nudge } = useQubitState();
  const groupRef = useRef<THREE.Group>(null);
  const lastInteractionRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  const { gl } = useThree();

  useEffect(() => {
    onDerived(derived);
  }, [derived, onDerived]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (reducedMotion) return;

    const now = performance.now();
    const idle =
      !draggingRef.current && now - lastInteractionRef.current > IDLE_RESUME_MS;
    if (idle) {
      groupRef.current.rotation.y += AMBIENT_ROT_SPEED * delta;
    }
  });

  useEffect(() => {
    if (!interactive) return;
    const dom = gl.domElement;

    const onDown = (e: PointerEvent) => {
      draggingRef.current = true;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionRef.current = performance.now();
      dom.setPointerCapture?.(e.pointerId);
      dom.style.cursor = "grabbing";
    };

    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current || !lastPointerRef.current) return;
      const dx = e.clientX - lastPointerRef.current.x;
      const dy = e.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: e.clientX, y: e.clientY };
      lastInteractionRef.current = performance.now();
      nudge(dy * DRAG_THETA_SCALE, dx * DRAG_PHI_SCALE);
    };

    const onUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      lastPointerRef.current = null;
      lastInteractionRef.current = performance.now();
      dom.releasePointerCapture?.(e.pointerId);
      dom.style.cursor = "grab";
    };

    dom.style.cursor = "grab";
    dom.style.touchAction = "none";

    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("pointerleave", onUp);

    return () => {
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointercancel", onUp);
      dom.removeEventListener("pointerleave", onUp);
    };
  }, [gl, interactive, nudge]);

  return (
    <group ref={groupRef}>
      <BlochSphere />
      <Axes />
      <StateVector position={derived.position} />
    </group>
  );
}

export default function Qubit() {
  const [ready, setReady] = useState(false);
  const [interactive, setInteractive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [derived, setDerived] = useState<QubitDerived>(() => {
    const theta = Math.PI / 2;
    const phi = Math.PI / 4;
    return {
      alpha: Math.cos(theta / 2),
      beta: Math.sin(theta / 2),
      phi,
      position: [
        Math.sin(theta) * Math.cos(phi),
        Math.cos(theta),
        Math.sin(theta) * Math.sin(phi),
      ],
    };
  });

  useEffect(() => {
    const mqlMobile = window.matchMedia("(max-width: 767px)");
    const mqlMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setInteractive(!mqlMobile.matches && !mqlMotion.matches);
      setReducedMotion(mqlMotion.matches);
    };
    update();
    mqlMobile.addEventListener("change", update);
    mqlMotion.addEventListener("change", update);
    setReady(true);
    return () => {
      mqlMobile.removeEventListener("change", update);
      mqlMotion.removeEventListener("change", update);
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="qubit-root relative h-full w-full">
      <Canvas
        camera={{ position: [2.4, 1.6, 2.4], fov: 38 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <Scene
          interactive={interactive}
          reducedMotion={reducedMotion}
          onDerived={setDerived}
        />
        {!reducedMotion && (
          <EffectComposer>
            <Bloom
              intensity={0.4}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>

      <Readout derived={derived} />
    </div>
  );
}
