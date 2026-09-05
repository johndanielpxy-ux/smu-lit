import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { contractTrainingContent } from "./demo/contractScenarios";
import { demoUseCase } from "./demo/demoUseCase";
import { approveUseCase } from "./domain/approval";
import { createScopedEventReporter, type MatterShiftEventReporter } from "./domain/integration";
import type { MatterShiftEvent, UseCase } from "./domain/mattershift";
import { ChangeImpactPanel } from "./features/change-impact/ChangeImpactPanel";
import { assessChangeImpact } from "./features/change-impact/changeImpact";
import { LearningReview } from "./features/coaching/LearningReview";
import { deriveLearningReview, type LearningReviewResult } from "./features/coaching/coachingEngine";
import { compileApprovedTrainingModule, type CompiledLawfloBundle } from "./features/compiler/bundleCompiler";
import { clearPublishedBundle, loadPublishedBundle, savePublishedBundle } from "./features/compiler/bundleStorage";
import { prepareDraftFromDemoPack } from "./features/compiler/compiler";
import { EpisodePlayer } from "./features/episode/EpisodePlayer";
import { preparedEpisodeMedia } from "./features/episode/episodeMedia";
import { clearEpisode } from "./features/episode/episodeStorage";
import { useNarration } from "./features/generation/useNarration";
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
import { ProductionScreen } from "./features/studio/ProductionScreen";
import { PreviewScreen } from "./features/studio/PreviewScreen";
import { WelcomeScreen } from "./features/platform/WelcomeScreen";
import { RoleScreen } from "./features/platform/RoleScreen";
import { PublishedScreen } from "./features/platform/PublishedScreen";
import { createPlatformJourney, platformJourneyReducer } from "./features/platform/platformJourney";
import { visibleLearnerNavigation } from "./features/platform/learnerNavigation";

const emptyScope = { bundleId: "unpublished", sourceVersion: "draft", contractVersion: "draft", approvalFingerprint: "draft" };

function EventLedger({ events }: { events: MatterShiftEvent[] }) {
  return <aside className="platform-ledger"><div><span>Observed actions</span><strong>{events.length}</strong></div>{events.length ? <ol>{events.map((event) => <li key={event.id}><b>{event.type}</b><small>{event.metadata?.sourceVersion ? `v${event.metadata.sourceVersion}` : "draft"}</small></li>)}</ol> : <p>No actions recorded yet.</p>}</aside>;
}

interface AppProps {
  productionStepDurationMs?: number;
}

export function App({ productionStepDurationMs = 900 }: AppProps) {
  const narration = useNarration();
  const [restoredBundle] = useState(() => loadPublishedBundle());
  const [useCase, setUseCase] = useState<UseCase>(() => restoredBundle?.useCase ?? structuredClone(demoUseCase));
  const [bundle, setBundle] = useState<CompiledLawfloBundle | undefined>(restoredBundle);
  const [events, setEvents] = useState<MatterShiftEvent[]>([]);
  const [review, setReview] = useState<LearningReviewResult | undefined>(() => {
    if (!restoredBundle) return undefined;
    const restored = loadRehearsal({ bundleId: restoredBundle.manifest.bundleId, sourceVersion: restoredBundle.manifest.sourceVersion, contractVersion: restoredBundle.rehearsal.scenario.contractVersion, approvalFingerprint: restoredBundle.manifest.approvalFingerprint });
    return restored?.task === "complete" ? deriveLearningReview(restored, restoredBundle.coaching) : undefined;
  });
  const [, setDemoPack] = useState<DemoPack>();
  const [authoringStage, setAuthoringStage] = useState<"intake" | "production" | "preview">("intake");
  const [error, setError] = useState<string>();
  const [governedOpen, setGovernedOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [platform, platformDispatch] = useReducer(platformJourneyReducer, Boolean(restoredBundle), createPlatformJourney);
  const [journey, journeyDispatch] = useReducer(journeyReducer, restoredBundle, (restored) => {
    if (!restored) return createJourneyState(emptyScope);
    const scope = { bundleId: restored.manifest.bundleId, sourceVersion: restored.manifest.sourceVersion, contractVersion: restored.rehearsal.scenario.contractVersion, approvalFingerprint: restored.manifest.approvalFingerprint };
    return loadJourney(scope) ?? journeyReducer(createJourneyState(scope), { type: "BUNDLE_PUBLISHED", scope });
  });

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

  async function handleCreate(pack: DemoPack) {
    try {
      setError(undefined);
      const draft = await prepareDraftFromDemoPack(pack);
      setDemoPack(pack);
      setUseCase(draft);
      setAuthoringStage("production");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The source pack could not be prepared.");
    }
  }
  function handleApproveAndPublish() {
    try {
      setError(undefined);
      const approved = approveUseCase(useCase, "Jordan Lee (synthetic reviewer)");
      setUseCase(approved);
      recordEvent({ useCaseId: approved.id, type: "human_approved", metadata: { sourceVersion: approved.sourceVersion, approvalFingerprint: approved.approvalRecord!.contentFingerprint } }, { idempotencyKey: `approval:${approved.approvalRecord!.contentFingerprint}` });
      const nextBundle = compileApprovedTrainingModule(approved, contractTrainingContent);
      const metadata = { bundleId: nextBundle.manifest.bundleId, sourceVersion: nextBundle.manifest.sourceVersion, contractVersion: nextBundle.rehearsal.scenario.contractVersion, approvalFingerprint: nextBundle.manifest.approvalFingerprint };
      recordEvent({ useCaseId: approved.id, type: "use_case_compiled", metadata }, { idempotencyKey: `compile:${nextBundle.manifest.bundleId}` });
      recordEvent({ useCaseId: approved.id, type: "module_published", metadata }, { idempotencyKey: `publish:${nextBundle.manifest.bundleId}` });
      savePublishedBundle(nextBundle); setBundle(nextBundle); setEvents(getEvents(approved.id, approved.sourceVersion));
      journeyDispatch({ type: "BUNDLE_PUBLISHED", scope: { bundleId: nextBundle.manifest.bundleId, sourceVersion: nextBundle.manifest.sourceVersion, contractVersion: nextBundle.rehearsal.scenario.contractVersion, approvalFingerprint: nextBundle.manifest.approvalFingerprint } });
      platformDispatch({ type: "MODULE_PUBLISHED" });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Approval and publication failed safely."); }
  }
  function finishRehearsal() {
    if (!bundle) return;
    const state = loadRehearsal({ bundleId: bundle.manifest.bundleId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: bundle.rehearsal.scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint }) ?? createRehearsalState("guided");
    setReview(deriveLearningReview(state, bundle.coaching)); journeyDispatch({ type: "REHEARSAL_COMPLETED" });
  }
  function reset() {
    resetDemo(); clearJourney(); clearPublishedBundle(); if (bundle) { clearEpisode(bundle.manifest.bundleId); clearRehearsal(bundle.manifest.bundleId); }
    narration.clear(); setUseCase(structuredClone(demoUseCase)); setDemoPack(undefined); setAuthoringStage("intake"); setBundle(undefined); setReview(undefined); setEvents([]); setError(undefined); setGovernedOpen(false); setResetKey((value) => value + 1); journeyDispatch({ type: "RESET" });
    platformDispatch({ type: "RESET" });
  }

  const changedImpact = useMemo(() => {
    if (!bundle) return undefined;
    const changed = structuredClone(bundle.useCase); changed.sourceVersion = "2026.3"; changed.playbookRules[0].priority += 1;
    return assessChangeImpact(bundle.useCase, changed, bundle);
  }, [bundle]);

  const stage = bundle ? journey.stage : "studio";
  if (platform.stage === "welcome") return <WelcomeScreen onEnter={() => platformDispatch({ type: "ENTER" })} onBrowse={bundle ? () => platformDispatch({ type: "BROWSE_AS_LEARNER" }) : undefined} />;
  if (platform.stage === "role") return <RoleScreen learnerAvailable={Boolean(bundle)} onBack={() => platformDispatch({ type: "BACK_TO_WELCOME" })} onSelect={(role) => platformDispatch({ type: "SELECT_ROLE", role })} />;
  if (platform.stage === "published" && bundle) return <PublishedScreen title={bundle.episode.title} onViewAsLearner={() => platformDispatch({ type: "VIEW_AS_LEARNER" })} />;
  if (platform.stage === "studio" && authoringStage === "production") return <ProductionScreen mode="prepared" stepDurationMs={productionStepDurationMs} onComplete={() => setAuthoringStage("preview")} />;
  if (platform.stage === "studio" && authoringStage === "preview") return <PreviewScreen title={useCase.generatedModuleDraft?.title ?? useCase.title} onApprovePublish={handleApproveAndPublish} />;
  if (platform.stage === "studio") return <div className="studio-shell"><a className="skip-link" href="#main-content">Skip to content</a><nav className="studio-nav" aria-label="Legal engineer studio"><button type="button" className="entry__brand" onClick={reset}><span>LF</span><strong>LAWFLO</strong></button><span>Legal engineer</span></nav>{error ? <div className="platform-error" role="alert"><strong>LAWFLO paused safely.</strong><span>{error}</span><button type="button" onClick={() => setError(undefined)}>Dismiss</button></div> : null}<main id="main-content" className="studio-main"><DemoPackInput key={resetKey} onReady={setDemoPack} onCreate={(pack) => void handleCreate(pack)} onEvent={prePublishReporter} /></main></div>;
  return <div className="platform-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="platform-header"><button className="platform-brand" type="button" onClick={() => journeyDispatch({ type: "GO_TO", stage: "catalogue" })}><span>LF</span><span className="platform-brand__wordmark">LAWFLO<small>Workflow learning for legal teams</small></span></button><nav aria-label="Learning journey">{bundle && visibleLearnerNavigation(journey).map(({ label, stage: target }) => <button key={label} type="button" aria-current={stage === target ? "page" : undefined} onClick={() => journeyDispatch({ type: "GO_TO", stage: target })}>{label}</button>)}</nav><div className="platform-actions"><button type="button" onClick={() => setGovernedOpen((value) => !value)} disabled={!bundle}>How this is governed</button><button type="button" onClick={reset}>Reset demo</button></div></header>
    {error && <div className="platform-error" role="alert"><strong>LAWFLO paused safely.</strong><span>{error}</span><button type="button" onClick={() => setError(undefined)}>Dismiss</button></div>}

    {stage === "catalogue" && bundle && <main id="main-content" className="catalogue"><section><span>Ready to learn the workflow</span><h1>One episode.<br/>One matter.<br/>One safer habit.</h1><p>Watch Maya catch the AI’s missed liability redline, then work the same legal AI workflow yourself.</p><button type="button" onClick={() => journeyDispatch({ type: "GO_TO", stage: "episode" })}>Watch episode</button></section><article><span>LAWFLO INTERACTIVE STORY · S1:E1</span><h2>{bundle.episode.title}</h2><p>100 sec · Deterministic · Source-linked and human-approved</p><strong>Featuring Maya Tan</strong></article></main>}
    {stage === "episode" && bundle && scopedReporter && <EpisodePlayer bundle={bundle} narrationUrl={narration.url} media={preparedEpisodeMedia} onEvent={scopedReporter} onComplete={() => journeyDispatch({ type: "EPISODE_COMPLETED" })} />}
    {stage === "rehearsal" && bundle && scopedReporter && <MatterWorkspace bundle={bundle} mode="guided" onEvent={scopedReporter} onComplete={finishRehearsal} />}
    {stage === "review" && review && scopedReporter && <LearningReview result={review} onRepair={() => journeyDispatch({ type: "GO_TO", stage: "rehearsal" })} onOpenGuide={() => { journeyDispatch({ type: "REVIEW_OPENED" }); journeyDispatch({ type: "OPEN_GUIDE" }); }} onOpenSource={(sourceRefId) => scopedReporter("source_opened", { sourceRefId })} />}
    {stage === "guide" && bundle && review && scopedReporter && <WorkflowGuide bundle={bundle} review={review} onEvent={scopedReporter} onStartSoloReplay={() => journeyDispatch({ type: "START_SOLO_REPLAY" })} />}
    {stage === "solo_replay" && bundle && scopedReporter && <MatterWorkspace bundle={bundle} mode="solo" onEvent={scopedReporter} onComplete={() => journeyDispatch({ type: "REHEARSAL_COMPLETED" })} />}

    {governedOpen && bundle && <section className="governance" aria-label="How this is governed"><button type="button" onClick={() => setGovernedOpen(false)}>Close governance</button><EventLedger events={events} /><EvidenceInspector bundle={bundle} events={events} onSourceOpen={(sourceRefId) => scopedReporter?.("source_opened", { sourceRefId })} />{changedImpact && <ChangeImpactPanel result={changedImpact} />}</section>}
  </div>;
}
