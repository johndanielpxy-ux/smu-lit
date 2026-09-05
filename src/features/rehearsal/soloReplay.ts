import { trainingScenarioFingerprint } from "../../domain/approval";
import type { ContractScenario } from "../../domain/mattershift";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";

export function getApprovedSoloReplayScenario(bundle: CompiledLawfloBundle): ContractScenario {
  const scenario = bundle.moduleContent.soloReplayScenario;
  if (!scenario) throw new Error("This module has no approved solo replay.");
  const approvedRef = bundle.manifest.scenarioRefs.find((item) => item.scenarioId === scenario.id && item.mode === "solo_replay");
  if (!approvedRef || approvedRef.scenarioVersion !== scenario.contractVersion || approvedRef.contentFingerprint !== trainingScenarioFingerprint(scenario)) {
    throw new Error("Solo replay does not match its approved fingerprint.");
  }
  return structuredClone(scenario);
}
