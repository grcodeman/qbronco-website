import { useCallback, useMemo, useState } from "react";

export interface QubitState {
  theta: number; // polar angle [0, π], 0 = |0⟩ (top), π = |1⟩ (bottom)
  phi: number; // azimuthal angle [0, 2π)
}

export interface QubitDerived {
  alpha: number; // |α| (real magnitude, since α = cos(θ/2) is real ≥ 0)
  beta: number; // |β| magnitude = sin(θ/2)
  phi: number; // global phase carried by β
  position: [number, number, number]; // unit-vector tip position
}

const DEFAULT_THETA = Math.PI / 2;
const DEFAULT_PHI = Math.PI / 4;

export function useQubitState() {
  const [state, setState] = useState<QubitState>({
    theta: DEFAULT_THETA,
    phi: DEFAULT_PHI,
  });

  const derived = useMemo<QubitDerived>(() => {
    const { theta, phi } = state;
    const alpha = Math.cos(theta / 2);
    const beta = Math.sin(theta / 2);
    // x = sin(θ)cos(φ), y = cos(θ) [z-up], z = sin(θ)sin(φ) — three.js Y is up.
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.cos(theta);
    const z = Math.sin(theta) * Math.sin(phi);
    return {
      alpha,
      beta,
      phi,
      position: [x, y, z],
    };
  }, [state]);

  const setAngles = useCallback((theta: number, phi: number) => {
    const clampedTheta = Math.max(0.0001, Math.min(Math.PI - 0.0001, theta));
    const wrappedPhi = ((phi % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    setState({ theta: clampedTheta, phi: wrappedPhi });
  }, []);

  const nudge = useCallback((dTheta: number, dPhi: number) => {
    setState((prev) => {
      const theta = Math.max(
        0.0001,
        Math.min(Math.PI - 0.0001, prev.theta + dTheta),
      );
      const phi =
        (((prev.phi + dPhi) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      return { theta, phi };
    });
  }, []);

  return { state, derived, setAngles, nudge };
}

export function formatPhase(phi: number): string {
  // Render phi as a fraction of π for the readout: "e^(iπ/2)", "e^(i·0.42π)", etc.
  if (Math.abs(phi) < 1e-3) return "1";
  const ratio = phi / Math.PI;
  const rounded = Math.round(ratio * 1000) / 1000;
  if (Math.abs(rounded - 1) < 1e-3) return "e^(iπ)";
  if (Math.abs(rounded - 0.5) < 1e-3) return "e^(iπ/2)";
  if (Math.abs(rounded - 1.5) < 1e-3) return "e^(i3π/2)";
  if (Math.abs(rounded - 0.25) < 1e-3) return "e^(iπ/4)";
  return `e^(i·${rounded.toFixed(3)}π)`;
}
