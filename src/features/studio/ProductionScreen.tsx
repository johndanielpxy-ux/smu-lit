import { useEffect, useState } from "react";

const productionSteps = [
  "Reading approved sources",
  "Writing the source-linked script",
  "Planning cinematic scenes",
  "Generating video and narration",
  "Adding learning interactions",
] as const;

interface ProductionScreenProps {
  mode: "prepared" | "live";
  onComplete: () => void;
  stepDurationMs?: number;
}

export function ProductionScreen({ mode, onComplete, stepDurationMs = 900 }: ProductionScreenProps) {
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCompletedCount((current) => Math.min(current + 1, productionSteps.length));
    }, stepDurationMs);
    return () => window.clearInterval(interval);
  }, [stepDurationMs]);

  useEffect(() => {
    if (completedCount === productionSteps.length) onComplete();
  }, [completedCount, onComplete]);

  return <main id="main-content" className="production-screen">
    <section className="production-screen__content">
      <p className="entry__eyebrow">{mode === "prepared" ? "Prepared demo render" : "Live production"}</p>
      <h1>Creating your learning episode</h1>
      <p>LAWFLO is turning the approved workflow into a short lesson your team can watch and practise.</p>
      <ol className="production-screen__steps">
        {productionSteps.map((step, index) => {
          const status = index < completedCount ? "complete" : index === completedCount ? "current" : "waiting";
          return <li key={step} data-status={status} aria-current={status === "current" ? "step" : undefined}><span>{status === "complete" ? "✓" : String(index + 1).padStart(2, "0")}</span><strong>{step}</strong></li>;
        })}
      </ol>
      <small>{mode === "prepared" ? "Loading an approved episode produced through the same generation pipeline." : "Fresh video generation may take several minutes."}</small>
    </section>
  </main>;
}
