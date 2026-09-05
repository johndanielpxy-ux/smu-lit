import { useState } from "react";
import { demoUseCase } from "./demo/demoUseCase";
import type { MatterShiftEvent, UseCase } from "./domain/mattershift";
import {
  compileUseCase,
  type CompilerInput,
} from "./features/compiler/compiler";
import {
  getEvents,
  recordEvent,
  resetDemo,
} from "./features/events/eventStore";
import { EpisodePlayer } from "./features/episode";

type Stage = "studio" | "episode" | "rehearsal" | "activation";

const stages: Array<{ id: Stage; label: string; owner: string }> = [
  { id: "studio", label: "Studio", owner: "Ananya" },
  { id: "episode", label: "Episode", owner: "Su-Ann" },
  { id: "rehearsal", label: "Rehearsal", owner: "Krishiv" },
  { id: "activation", label: "Activation", owner: "Krishiv" },
];

const compilerInput: CompilerInput = {
  contributorName: demoUseCase.contributorName,
  contributorRole: demoUseCase.contributorRole,
  targetRole: demoUseCase.targetRole,
  practiceGroup: demoUseCase.practiceGroup,
  workTrigger: demoUseCase.workTrigger,
  problem: demoUseCase.problem,
  expectedOutcome: demoUseCase.expectedOutcome,
  consentConfirmed: demoUseCase.consentConfirmed,
  sourceText: demoUseCase.sources.map((source) => source.excerpt).join("\n"),
};

function StagePlaceholder({ stage }: { stage: "rehearsal" | "activation" }) {
  const copy = {
    rehearsal: {
      eyebrow: "Safe practice",
      title: "Make the risky choice here, not on a client matter.",
      description:
        "This mounting point receives workflow steps and guardrails from the same source-linked object.",
    },
    activation: {
      eyebrow: "Point of work",
      title: "What to do, why now and how to begin safely.",
      description:
        "This mounting point delivers the approved action card without pretending that a real enterprise integration exists.",
    },
  }[stage];

  return (
    <section className="feature-placeholder" aria-labelledby={`${stage}-title`}>
      <p className="eyebrow">{copy.eyebrow}</p>
      <h2 id={`${stage}-title`}>{copy.title}</h2>
      <p>{copy.description}</p>
      <div className="mount-contract">
        <span>Integration contract ready</span>
        <code>{`<${stage[0].toUpperCase()}${stage.slice(1)} useCase onEvent />`}</code>
      </div>
    </section>
  );
}

function EventLedger({ events }: { events: MatterShiftEvent[] }) {
  return (
    <aside className="ledger" aria-labelledby="ledger-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Evidence, not theatre</p>
          <h2 id="ledger-title">Observed event ledger</h2>
        </div>
        <span className="count" data-testid="event-count">{events.length}</span>
      </div>

      {events.length === 0 ? (
        <p className="empty-state">No prototype actions recorded yet.</p>
      ) : (
        <ol className="event-list">
          {events.map((event) => (
            <li key={event.id}>
              <span className="event-dot" aria-hidden="true" />
              <div>
                <strong>{event.type}</strong>
                <time dateTime={event.occurredAt}>
                  {new Date(event.occurredAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="future-metrics" aria-label="Future production metrics">
        <p>Requires governed integration</p>
        <span>First safe use</span>
        <span>Repeat use · 14d</span>
        <span>Outcome reported</span>
      </div>
    </aside>
  );
}

export function App() {
  const [activeStage, setActiveStage] = useState<Stage>("studio");
  const [useCase, setUseCase] = useState<UseCase>(() =>
    structuredClone(demoUseCase),
  );
  const [events, setEvents] = useState<MatterShiftEvent[]>([]);
  const [status, setStatus] = useState("Ready to compile");

  async function handleCompile() {
    setStatus("Compiling source-linked workflow…");
    const compiled = await compileUseCase(compilerInput);
    setUseCase(compiled);
    recordEvent({ useCaseId: compiled.id, type: "use_case_compiled" });
    setEvents(getEvents(compiled.id));
    setStatus("Workflow compiled");
  }

  function handleReset() {
    resetDemo();
    setUseCase(structuredClone(demoUseCase));
    setEvents([]);
    setActiveStage("studio");
    setStatus("Ready to compile");
  }

  function handleEpisodeEvent(
    eventData: Omit<MatterShiftEvent, "id" | "occurredAt">,
  ) {
    recordEvent(eventData);
    setEvents(getEvents(useCase.id));
  }

  function handleEpisodeComplete() {
    recordEvent({
      useCaseId: useCase.id,
      type: "rehearsal_passed",
      metadata: { source: "episode_completed" },
    });
    setEvents(getEvents(useCase.id));
    setActiveStage("rehearsal");
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="MatterShift home">
          <span className="brand-mark">M</span>
          <span>MatterShift</span>
        </a>
        <div className="header-actions">
          <span className="synthetic-label">
            <span className="synthetic-full">Synthetic demonstration</span>
            <span className="synthetic-short">Synthetic demo</span>
          </span>
          <button className="text-button" type="button" onClick={handleReset}>
            Reset demo
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">The legal-engineer multiplier</p>
            <h1>Turn pioneers into practice.</h1>
            <p className="hero-description">
              Compile one approved internal workflow into a source-verified peer
              story, a safe rehearsal and a point-of-work action.
            </p>
          </div>

          <div className="hero-card">
            <div className="person-avatar" aria-hidden="true">
              MT
            </div>
            <div>
              <span>Workflow contributed by</span>
              <strong>{useCase.contributorName}</strong>
              <p>{useCase.contributorRole}</p>
            </div>
            <span className={`status-pill status-${useCase.approvalStatus}`}>
              {useCase.approvalStatus.replace("_", " ")}
            </span>
          </div>
        </section>

        <nav className="stage-nav" aria-label="MatterShift stages">
          {stages.map((stage, index) => (
            <button
              className={activeStage === stage.id ? "active" : ""}
              key={stage.id}
              type="button"
              onClick={() => setActiveStage(stage.id)}
              aria-pressed={activeStage === stage.id}
              data-testid={`nav-stage-${stage.id}`}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage.label}</strong>
              <small>{stage.owner}</small>
            </button>
          ))}
        </nav>

        <div className="workspace-grid">
          <div className="workspace">
            {activeStage === "studio" && (
              <section className="studio" aria-labelledby="studio-title">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">Use-Case Compiler</p>
                    <h2 id="studio-title">{useCase.title}</h2>
                  </div>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={handleCompile}
                    data-testid="compile-workflow-btn"
                  >
                    Compile workflow
                  </button>
                </div>

                <div className="status-line" role="status">
                  <span aria-hidden="true" />
                  {status}
                </div>

                <dl className="use-case-meta">
                  <div>
                    <dt>Work trigger</dt>
                    <dd>{useCase.workTrigger}</dd>
                  </div>
                  <div>
                    <dt>Target role</dt>
                    <dd>{useCase.targetRole}</dd>
                  </div>
                  <div>
                    <dt>Practice</dt>
                    <dd>{useCase.practiceGroup}</dd>
                  </div>
                  <div>
                    <dt>Policy version</dt>
                    <dd>v{useCase.sourceVersion}</dd>
                  </div>
                </dl>

                <div className="workflow-list">
                  {useCase.steps.map((step, index) => (
                    <article key={step.id}>
                      <span className="step-number">{index + 1}</span>
                      <div>
                        <div className="step-heading">
                          <h3>{step.title}</h3>
                          <span>{step.tool}</span>
                        </div>
                        <p>{step.instruction}</p>
                        <div className="step-tags">
                          <span>{step.riskLevel} risk</span>
                          <span>{step.sourceRefIds.length} source links</span>
                          {step.humanReviewRequired && <span>human review</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {activeStage === "episode" && (
              <EpisodePlayer
                useCase={useCase}
                onEvent={handleEpisodeEvent}
                onComplete={handleEpisodeComplete}
              />
            )}

            {(activeStage === "rehearsal" || activeStage === "activation") && (
              <StagePlaceholder stage={activeStage} />
            )}
          </div>

          <EventLedger events={events} />
        </div>
      </main>
    </div>
  );
}
