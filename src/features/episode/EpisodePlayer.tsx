import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import mayaPortrait from "../../demo/assets/maya-tan.png";
import type { MatterShiftEventReporter } from "../../domain/integration";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import type { JourneyScope } from "../journey/journeyReducer";
import { createInitialEpisodeState, episodeReducer } from "./episodeReducer";
import { loadEpisode, saveEpisode } from "./episodeStorage";
import { createEpisodeTimeline } from "./timeline";
import "./episode.css";

export interface EpisodePlayerProps {
  bundle: CompiledLawfloBundle;
  onEvent: MatterShiftEventReporter;
  onComplete: () => void;
}

function scopeOf(bundle: CompiledLawfloBundle): JourneyScope {
  return { bundleId: bundle.manifest.bundleId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: bundle.rehearsal.scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint };
}

export function EpisodePlayer({ bundle, onEvent, onComplete }: EpisodePlayerProps) {
  const timeline = useMemo(() => createEpisodeTimeline(bundle), [bundle]);
  const scope = useMemo(() => scopeOf(bundle), [bundle]);
  const [state, dispatch] = useReducer((current: ReturnType<typeof createInitialEpisodeState>, action: Parameters<typeof episodeReducer>[1]) => episodeReducer(current, action, timeline), scope, (currentScope) => loadEpisode(currentScope) ?? createInitialEpisodeState());
  const [captions, setCaptions] = useState(true);
  const [drawer, setDrawer] = useState<"none" | "transcript" | "sources">("none");
  const [query, setQuery] = useState("");
  const started = useRef(false);
  const completed = useRef(false);
  const cue = timeline[state.cueIndex];

  useEffect(() => { saveEpisode(scope, state); }, [scope, state]);
  useEffect(() => {
    if (state.status !== "playing") return;
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(timer);
  }, [state.status]);
  useEffect(() => {
    if (state.status === "complete" && !completed.current) { completed.current = true; onComplete(); }
  }, [onComplete, state.status]);

  const play = () => {
    if (!started.current) {
      started.current = true;
      onEvent("episode_started", { episodeId: bundle.episode.id }, { idempotencyKey: `${bundle.episode.id}:started` });
    }
    dispatch({ type: "PLAY" });
  };
  const checkpoint = state.status === "checkpoint" ? cue.checkpoint : undefined;
  const matchingCues = timeline.filter((item) => `${item.title} ${item.narration} ${item.caption}`.toLowerCase().includes(query.toLowerCase()));
  const sourceIds = checkpoint?.sourceRefIds ?? cue.sourceRefIds;

  return <section className="episode" aria-label="LAWFLO learning episode">
    <header className="episode__header">
      <div><span className="episode__kicker">LAWFLO INTERACTIVE STORY · S1:E1</span><h1>{bundle.episode.title}</h1><p>With {bundle.useCase.contributorName}, {bundle.useCase.contributorRole}</p><small className="episode__provenance">Interactive story · deterministic fallback · source-linked and human-approved</small></div>
      <div className="episode__tools">
        <button type="button" onClick={() => setCaptions((value) => !value)} aria-pressed={captions}>CC {captions ? "On" : "Off"}</button>
        <button type="button" onClick={() => setDrawer("transcript")}>Transcript</button>
        <button type="button" onClick={() => setDrawer("sources")}>Sources</button>
      </div>
    </header>

    <div className={`episode__stage episode__stage--${cue.visual}`}>
      {checkpoint ? <div className="episode__checkpoint">
        <span className="episode__eyebrow">Decision checkpoint</span><h2>{checkpoint.prompt}</h2>
        <p>SGD 42,000 renewal · submitted liability clause changed</p>
        <div className="episode__choices">{checkpoint.choices.map((choice) => <button key={choice.id} type="button" onClick={() => { dispatch({ type: "ANSWER", choiceId: choice.id }); onEvent("checkpoint_answered", { checkpointId: checkpoint.id, choiceId: choice.id, safe: choice.safe }); }}>{choice.label}</button>)}</div>
        {state.lastAnswerSafe === false && <p className="episode__repair" role="alert">Low value never cancels a material redline. Open the clause, apply the higher-priority rule, then route to legal.</p>}
      </div> : <>
        <img className="episode__portrait" src={mayaPortrait} alt={`${bundle.useCase.contributorName}, fictional legal innovation counsel`} />
        <div className="episode__frame"><span>Chapter {cue.chapter} / {timeline.length}</span><h2>{cue.title}</h2><p>{cue.narration}</p></div>
      </>}
      {captions && <p className="episode__captions">{cue.caption}</p>}
    </div>

    <nav className="episode__chapters" aria-label="Episode chapters">{timeline.map((item, index) => <button key={item.id} type="button" className={index === state.cueIndex ? "is-current" : ""} aria-label={`Chapter ${item.chapter}: ${item.title}`} onClick={() => dispatch({ type: "SEEK", cueIndex: index })}><span>{item.chapter}</span><small>{item.title}</small></button>)}</nav>
    <div className="episode__controls">
      {state.status === "playing" ? <button type="button" onClick={() => dispatch({ type: "PAUSE" })}>Pause episode</button> : state.status === "complete" ? <button type="button" onClick={() => dispatch({ type: "REPLAY" })}>Replay episode</button> : <button type="button" onClick={play} disabled={state.status === "checkpoint"}>Play episode</button>}
      <span>{state.elapsedSeconds}s / {timeline.reduce((sum, item) => sum + item.durationSeconds, 0)}s</span>
      {state.answeredCheckpointIds.length > 0 && state.status !== "complete" && <button type="button" onClick={() => dispatch({ type: "FINISH" })}>Continue to rehearsal</button>}
    </div>

    {drawer !== "none" && <aside className="episode__drawer" aria-label={drawer === "sources" ? "Episode sources" : "Episode transcript"}>
      <button className="episode__close" type="button" onClick={() => setDrawer("none")}>Close</button>
      {drawer === "transcript" ? <><h2>Transcript</h2><input type="search" aria-label="Search transcript" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this episode" />{matchingCues.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.narration}</p></article>)}</> : <><h2>Sources for this scene</h2>{sourceIds.map((id) => { const source = bundle.useCase.sources.find((item) => item.id === id); return <button className="episode__source" key={id} type="button" aria-label={`Open source ${id.replaceAll("-", " ")}`} onClick={() => onEvent("source_opened", { sourceRefId: id })}><strong>{source?.title ?? id}</strong><span>{source?.excerpt}</span></button>; })}</>}
    </aside>}
  </section>;
}
