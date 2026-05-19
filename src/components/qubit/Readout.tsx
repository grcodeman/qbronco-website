import { formatPhase, type QubitDerived } from "./useQubitState";

interface Props {
  derived: QubitDerived;
}

export function Readout({ derived }: Props) {
  const alpha = derived.alpha.toFixed(3);
  const beta = derived.beta.toFixed(3);
  const phase = formatPhase(derived.phi);

  return (
    <div className="qubit-readout pointer-events-none select-none">
      <p className="qubit-readout__line">|ψ⟩ = α|0⟩ + β|1⟩</p>
      <p className="qubit-readout__line">α = {alpha}</p>
      <p className="qubit-readout__line">
        β = {beta}
        {phase === "1" ? "" : ` · ${phase}`}
      </p>
    </div>
  );
}
