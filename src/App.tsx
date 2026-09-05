import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { contractTrainingContent } from "./demo/contractScenarios";
import { demoUseCase } from "./demo/demoUseCase";
import { approveUseCase, isApprovalCurrent } from "./domain/approval";
import { createScopedEventReporter, type MatterShiftEventReporter } from "./domain/integration";
import type { MatterShiftEvent, UseCase } from "./domain/mattershift";
import { ChangeImpactPanel } from "./features/change-impact/ChangeImpactPanel";
import { assessChangeImpact } from "./features/change-impact/changeImpact";
import { LearningReview } from "./features/coaching/LearningReview";
import { deriveLearningReview, type LearningReviewResult } from "./features/coaching/coachingEngine";
import type { GeneratedModuleDraft } from "./domain/generation";
import { compileApprovedTrainingModule, type CompiledLawfloBundle } from "./features/compiler/bundleCompiler";
import { clearPublishedBundle, loadPublishedBundle, savePublishedBundle } from "./features/compiler/bundleStorage";
import { prepareDraftFromDemoPack } from "./features/compiler/compiler";
import { EpisodePlayer } from "./features/episode/EpisodePlayer";
import { clearEpisode } from "./features/episode/episodeStorage";
import { GeneratedDraftPanel } from "./features/generation/GeneratedDraftPanel";
import { getEvents, recordEvent, resetDemo } from "./features/events/eventStore";
import { EvidenceInspector } from "./features/evidence/EvidenceInspector";
import { WorkflowGuide } from "./features/guide/WorkflowGuide";
import { createJourneyState, journeyReducer } from "./features/journey/journeyReducer";
import { clearJourney, loadJourney, saveJourney } from "./features/journey/journeyStorage";
import { MatterWorkspace } from "./features/rehearsal/MatterWorkspace";
import { createRehearsalState } from "./features/rehearsal/rehearsalReducer";
import { clearRehearsal, loadRehearsal } from "./features/rehearsal/rehearsalStorage";
import { DemoPackInput } from "./features/studio/DemoPackInput";
import type { DemoPack } from "./features/studio/demoPack";

const emptyScope = { bundleId: "unpublished", sourceVersion: "draft", contractVersion: "draft", approvalFingerprint: "draft" };

function EventLedger({ events }: { events: MatterShiftEvent[] }) {
  return <aside className="platform-ledger"><div><span>Observed actions</span><strong>{events.length}</strong></div>{events.length ? <ol>{events.map((event) => <li key={event.id}><b>{event.type}</b><small>{event.metadata?.sourceVersion ? `v${event.metadata.sourceVersion}` : "draft"}</small></li>)}</ol> : <p>No actions recorded yet.</p>}</aside>;
}

export function App() {
  const [restoredBundle] = useState(() => loadPublishedBundle());
  const [useCase, setUseCase] = useState<UseCase>(() => restoredBundle?.useCase ?? structuredClone(demoUseCase));
  const [draftPrepared, setDraftPrepared] = useState(Boolean(restoredBundle));
  const [bundle, setBundle] = useState<CompiledLawfloBundle | undefined>(restoredBundle);
  const [events, setEvents] = useState<MatterShiftEvent[]>([]);
  const [review, setReview] = useState<LearningReviewResult | undefined>(() => {
    if (!restoredBundle) return undefined;
    const restored = loadRehearsal({ bundleId: restoredBundle.manifest.bundleId, sourceVersion: restoredBundle.manifest.sourceVersion, contractVersion: restoredBundle.rehearsal.scenario.contractVersion, approvalFingerprint: restoredBundle.manifest.approvalFingerprint });
    return restored?.task === "complete" ? deriveLearningReview(restored, restoredBundle.coaching) : undefined;
  });
  const [demoPack, setDemoPack] = useState<DemoPack>();
  const [status, setStatus] = useState(restoredBundle ? "Published module restored" : "Load five governed inputs to begin");
  const [error, setError] = useState<string>();
  const [governedOpen, setGovernedOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [journey, journeyDispatch] = useReducer(journeyReducer, restoredBundle, (restored) => {
    if (!restored) return createJourneyState(emptyScope);
    const scope = { bundleId: restored.manifest.bundleId, sourceVersion: restored.manifest.sourceVersion, contractVersion: restored.rehearsal.scenario.contractVersion, approvalFingerprint: restored.manifest.approvalFingerprint };
    return loadJourney(scope) ?? journeyReducer(createJourneyState(scope), { type: "BUNDLE_PUBLISHED", scope });
  });
  const studioHeading = useRef<HTMLHeadingElement>(null);
  const approvalCurrent = isApprovalCurrent(useCase);

  useEffect(() => { if (bundle) saveJourney(journey); }, [bundle, journey]);

  const refreshEvents = useCallback((target = useCase) => setEvents(getEvents(target.id, target.sourceVersion)), [useCase]);
  const prePublishReporter = useCallback<MatterShiftEventReporter>((type, metadata, options) => {
    try {
      recordEvent({ useCaseId: useCase.id, type, metadata: { ...metadata, sourceVersion: useCase.sourceVersion } }, options);
      refreshEvents();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "The event ledger could not record this action."); }
  }, [refreshEvents, useCase.id, useCase.sourceVersion]);
  const scopedReporter = useMemo<MatterShiftEventReporter | undefined>(() => {
    if (!bundle) return undefined;
    const reporter = createScopedEventReporter({ useCaseId: bundle.manifest.useCaseId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: bundle.rehearsal.scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint, bundleId: bundle.manifest.bundleId }, (event, options) => recordEvent(event, options));
    return (type, metadata, options) => {
      try { reporter(type, metadata, options); setEvents(getEvents(bundle.manifest.useCaseId, bundle.manifest.sourceVersion)); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "The evidence ledger needs attention."); }
    };
  }, [bundle]);

  async function handlePack(pack: DemoPack) {
    try { setError(undefined); setStatus("Checking the approved workflow markers…"); const draft = await prepareDraftFromDemoPack(pack); setDemoPack(pack); setUseCase(draft); setDraftPrepared(true); setStatus("Draft ready for named approval"); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "The demo pack could not be prepared."); }
  }
  function handleGeneratedDraft(generatedModuleDraft: GeneratedModuleDraft) {
    setUseCase((current) => ({
      ...current,
      generatedModuleDraft,
      approvalStatus: "draft",
      approvedBy: undefined,
      approvalRecord: undefined,
    }));
    setStatus("Generated draft ready for human approval");
  }
  function handleApprove() {
    try {
      const approved = approveUseCase(useCase, "Jordan Lee (synthetic reviewer)");
      setUseCase(approved);
      recordEvent({ useCaseId: approved.id, type: "human_approved", metadata: { sourceVersion: approved.sourceVersion, approvalFingerprint: approved.approvalRecord!.contentFingerprint } }, { idempotencyKey: `approval:${approved.approvalRecord!.contentFingerprint}` });
      setEvents(getEvents(approved.id, approved.sourceVersion)); setStatus("Exact workflow, scenarios and sources approved");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Approval could not be recorded."); }
  }
  function handlePublish() {
    try {
      setError(undefined);
      const nextBundle = compileApprovedTrainingModule(useCase, contractTrainingContent);
      const metadata = { bundleId: nextBundle.manifest.bundleId, sourceVersion: nextBundle.manifest.sourceVersion, contractVersion: nextBundle.rehearsal.scenario.contractVersion, approvalFingerprint: nextBundle.manifest.approvalFingerprint };
      recordEvent({ useCaseId: useCase.id, type: "use_case_compiled", metadata }, { idempotencyKey: `compile:${nextBundle.manifest.bundleId}` });
      recordEvent({ useCaseId: useCase.id, type: "module_published", metadata }, { idempotencyKey: `publish:${nextBundle.manifest.bundleId}` });
      savePublishedBundle(nextBundle); setBundle(nextBundle); setEvents(getEvents(useCase.id, useCase.sourceVersion)); setStatus("Module published");
      journeyDispatch({ type: "BUNDLE_PUBLISHED", scope: { bundleId: nextBundle.manifest.bundleId, sourceVersion: nextBundle.manifest.sourceVersion, contractVersion: nextBundle.rehearsal.scenario.contractVersion, approvalFingerprint: nextBundle.manifest.approvalFingerprint } });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Publication failed safely."); }
  }
  function finishRehearsal() {
    if (!bundle) return;
    const state = loadRehearsal({ bundleId: bundle.manifest.bundleId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: bundle.rehearsal.scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint }) ?? createRehearsalState("guided");
    setReview(deriveLearningReview(state, bundle.coaching)); journeyDispatch({ type: "REHEARSAL_COMPLETED" });
  }
  function reset() {
    resetDemo(); clearJourney(); clearPublishedBundle(); if (bundle) { clearEpisode(bundle.manifest.bundleId); clearRehearsal(bundle.manifest.bundleId); }
    setUseCase(structuredClone(demoUseCase)); setDemoPack(undefined); setDraftPrepared(false); setBundle(undefined); setReview(undefined); setEvents([]); setStatus("Load five governed inputs to begin"); setError(undefined); setGovernedOpen(false); setResetKey((value) => value + 1); journeyDispatch({ type: "RESET" });
    window.setTimeout(() => studioHeading.current?.focus(), 0);
  }

  const changedImpact = useMemo(() => {
    if (!bundle) return undefined;
    const changed = structuredClone(bundle.useCase); changed.sourceVersion = "2026.3"; changed.playbookRules[0].priority += 1;
    return assessChangeImpact(bundle.useCase, changed, bundle);
  }, [bundle]);

  const stage = bundle ? journey.stage : "studio";
  return <div className="platform-shell">
    <header className="platform-header"><button className="platform-brand" type="button" onClick={() => bundle ? journeyDispatch({ type: "GO_TO", stage: "catalogue" }) : studioHeading.current?.focus()}><span>LF</span>LAWFLO</button><nav aria-label="Learning journey">{bundle && ["Episode", "Rehearsal", "Review", "Guide"].map((label) => <button key={label} type="button" onClick={() => journeyDispatch({ type: "GO_TO", stage: label.toLowerCase() as "episode" | "rehearsal" | "review" | "guide" })}>{label}</button>)}</nav><div><button type="button" onClick={() => setGovernedOpen((value) => !value)} disabled={!bundle}>How this is governed</button><button type="button" onClick={reset}>Reset demo</button></div></header>
    {error && <div className="platform-error" role="alert"><strong>LAWFLO paused safely.</strong><span>{error}</span><button type="button" onClick={() => setError(undefined)}>Dismiss</button></div>}

    {stage === "studio" && <main className="platform-main"><section className="platform-hero"><span>Learn the workflow. Rehearse the judgment.</span><h1 ref={studioHeading} tabIndex={-1}>Turn legal AI pioneers into everyday practice.</h1><p>LAWFLO turns an approved legal-engineering workflow into a peer-led episode, a realistic contract matter and a source-linked desk guide.</p><div className="platform-pill-row"><span>Legal AI verification</span><span>Contract review</span><span>Human-controlled routing</span></div></section><DemoPackInput key={resetKey} onReady={(pack) => void handlePack(pack)} onEvent={prePublishReporter} /><GeneratedDraftPanel pack={demoPack} onGenerated={handleGeneratedDraft} /><section className="publication"><div><span>Publication boundary</span><h2>{useCase.generatedModuleDraft?.title ?? useCase.title}</h2><p>{status}</p></div><div><button type="button" onClick={handleApprove} disabled={!draftPrepared || approvalCurrent}>Approve exact version</button><button type="button" onClick={handlePublish} disabled={!approvalCurrent}>Publish learning module</button></div></section>{bundle && changedImpact && <ChangeImpactPanel result={changedImpact} />}</main>}

    {stage === "catalogue" && bundle && <main className="catalogue"><section><span>Ready to learn the workflow</span><h1>One episode.<br/>One matter.<br/>One safer habit.</h1><p>Watch Maya catch the AI’s missed liability redline, then work the same legal AI workflow yourself.</p><button type="button" onClick={() => journeyDispatch({ type: "GO_TO", stage: "episode" })}>Watch episode</button></section><article><span>LAWFLO INTERACTIVE STORY · S1:E1</span><h2>{bundle.episode.title}</h2><p>100 sec · Deterministic · Source-linked and human-approved</p><strong>Featuring Maya Tan</strong></article></main>}
    {stage === "episode" && bundle && scopedReporter && <EpisodePlayer bundle={bundle} onEvent={scopedReporter} onComplete={() => journeyDispatch({ type: "EPISODE_COMPLETED" })} />}
    {stage === "rehearsal" && bundle && scopedReporter && <MatterWorkspace bundle={bundle} mode="guided" onEvent={scopedReporter} onComplete={finishRehearsal} />}
    {stage === "review" && review && scopedReporter && <LearningReview result={review} onRepair={() => journeyDispatch({ type: "GO_TO", stage: "rehearsal" })} onOpenGuide={() => { journeyDispatch({ type: "REVIEW_OPENED" }); journeyDispatch({ type: "OPEN_GUIDE" }); }} onOpenSource={(sourceRefId) => scopedReporter("source_opened", { sourceRefId })} />}
    {stage === "guide" && bundle && review && scopedReporter && <WorkflowGuide bundle={bundle} review={review} onEvent={scopedReporter} onStartSoloReplay={() => journeyDispatch({ type: "START_SOLO_REPLAY" })} />}
    {stage === "solo_replay" && bundle && scopedReporter && <MatterWorkspace bundle={bundle} mode="solo" onEvent={scopedReporter} onComplete={() => journeyDispatch({ type: "REHEARSAL_COMPLETED" })} />}

    {governedOpen && bundle && <section className="governance" aria-label="How this is governed"><button type="button" onClick={() => setGovernedOpen(false)}>Close governance</button><EventLedger events={events} /><EvidenceInspector bundle={bundle} events={events} onSourceOpen={(sourceRefId) => scopedReporter?.("source_opened", { sourceRefId })} />{changedImpact && <ChangeImpactPanel result={changedImpact} />}</section>}
  </div>;
}
