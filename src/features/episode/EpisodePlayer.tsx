import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import mayaPortrait from "../../demo/assets/maya-tan.png";
import type { MatterShiftEventReporter } from "../../domain/integration";
import type { CompiledLawfloBundle } from "../compiler/bundleCompiler";
import type { JourneyScope } from "../journey/journeyReducer";
import type { EpisodeMediaManifest } from "./episodeMedia";
import { InstructionalOverlay } from "./InstructionalOverlay";
import { createInitialEpisodeState, episodeReducer } from "./episodeReducer";
import { loadEpisode, saveEpisode } from "./episodeStorage";
import { createEpisodeTimeline } from "./timeline";
import "./episode.css";

export interface EpisodePlayerProps {
  bundle: CompiledLawfloBundle;
  portraitUrl?: string;
  narrationUrl?: string;
  media?: EpisodeMediaManifest;
  onEvent: MatterShiftEventReporter;
  onComplete: () => void;
}

function scopeOf(bundle: CompiledLawfloBundle): JourneyScope {
  return { bundleId: bundle.manifest.bundleId, sourceVersion: bundle.manifest.sourceVersion, contractVersion: bundle.rehearsal.scenario.contractVersion, approvalFingerprint: bundle.manifest.approvalFingerprint };
}

export function EpisodePlayer({ bundle, portraitUrl, narrationUrl, media, onEvent, onComplete }: EpisodePlayerProps) {
  const timeline = useMemo(() => createEpisodeTimeline(bundle), [bundle]);
  const scope = useMemo(() => scopeOf(bundle), [bundle]);
  const [state, dispatch] = useReducer((current: ReturnType<typeof createInitialEpisodeState>, action: Parameters<typeof episodeReducer>[1]) => episodeReducer(current, action, timeline), scope, (currentScope) => loadEpisode(currentScope) ?? createInitialEpisodeState());
  const [captions, setCaptions] = useState(false);
  const [drawer, setDrawer] = useState<"none" | "transcript" | "sources">("none");
  const [audioUnavailable, setAudioUnavailable] = useState(false);
  const [mediaUnavailable, setMediaUnavailable] = useState(false);
  const [mediaSegmentIndex, setMediaSegmentIndex] = useState(0);
  const [videoTime, setVideoTime] = useState(0);
  const [query, setQuery] = useState("");
  const started = useRef(false);
  const completed = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasPreparedVideo = Boolean(media && !mediaUnavailable);
  const stateCue = timeline[state.cueIndex];
  const cue = stateCue;
  const mediaSegment = hasPreparedVideo ? media!.segments[mediaSegmentIndex] : undefined;
  const overlay = mediaSegment?.overlayBeats.reduce<NonNullable<typeof mediaSegment>["overlayBeats"][number]["overlay"] | undefined>((current, beat) => beat.atSeconds <= videoTime ? beat.overlay : current, undefined);

  useEffect(() => { saveEpisode(scope, state); }, [scope, state]);
  useEffect(() => {
    if (state.status !== "playing" || hasPreparedVideo) return;
    const timer = window.setInterval(() => dispatch({ type: "TICK" }), 1000);
    return () => window.clearInterval(timer);
  }, [hasPreparedVideo, state.status]);
  useEffect(() => { setAudioUnavailable(false); }, [narrationUrl]);
  useEffect(() => { setAudioUnavailable(false); setVideoTime(0); }, [mediaSegmentIndex]);

  const reportStart = () => {
    if (started.current) return;
    started.current = true;
    onEvent("episode_started", { episodeId: bundle.episode.id }, { idempotencyKey: `${bundle.episode.id}:started` });
  };
  const play = () => {
    reportStart();
    dispatch({ type: "PLAY" });
    if (hasPreparedVideo) {
      if (audioRef.current && videoRef.current) audioRef.current.currentTime = videoRef.current.currentTime;
      void videoRef.current?.play().catch(() => setMediaUnavailable(true));
      if (!audioUnavailable) void audioRef.current?.play().catch(() => setAudioUnavailable(true));
    }
  };
  const pause = () => {
    dispatch({ type: "PAUSE" });
    videoRef.current?.pause();
    audioRef.current?.pause();
  };
  const handleAudioUnavailable = () => {
    setAudioUnavailable(true);
    setCaptions(true);
  };
  const handleMediaEnded = () => {
    audioRef.current?.pause();
    if (!media) return;
    if (mediaSegmentIndex === media.checkpointAfterSegment) {
      const checkpointIndex = timeline.findIndex((item) => item.checkpoint);
      if (checkpointIndex >= 0) dispatch({ type: "SEEK", cueIndex: checkpointIndex });
      return;
    }
    if (mediaSegmentIndex < media.segments.length - 1) {
      setMediaSegmentIndex((index) => index + 1);
      dispatch({ type: "PAUSE" });
      return;
    }
    dispatch({ type: "FINISH" });
  };
  const selectMediaSegment = (index: number) => {
    const checkpointAnswered = state.answeredCheckpointIds.length > 0;
    if (!media || (index > media.checkpointAfterSegment && !checkpointAnswered)) return;
    videoRef.current?.pause();
    audioRef.current?.pause();
    setMediaSegmentIndex(index);
    setVideoTime(0);
    dispatch({ type: "PAUSE" });
  };
  const checkpoint = state.status === "checkpoint" ? stateCue.checkpoint : undefined;
  const matchingCues = timeline.filter((item) => `${item.title} ${item.narration} ${item.caption}`.toLowerCase().includes(query.toLowerCase()));
  const sourceIds = checkpoint?.sourceRefIds ?? mediaSegment?.sourceRefIds ?? cue.sourceRefIds;

  return <section id="main-content" className="episode" aria-label="LAWFLO learning episode">
    <header className="episode__header">
      <div><span className="episode__kicker">LAWFLO INTERACTIVE STORY · S1:E1</span><h1>{bundle.episode.title}</h1><p>With {bundle.useCase.contributorName}, {bundle.useCase.contributorRole}</p><small className="episode__provenance">{hasPreparedVideo ? "Prepared demo render · AI-generated visuals · narrated · source-linked" : "Interactive story · deterministic fallback · source-linked and human-approved"}</small>{narrationUrl && !audioUnavailable ? <div className="episode__narration"><span>AI-generated voice · approved narration</span><audio title="Approved AI narration" controls src={narrationUrl} onError={handleAudioUnavailable} /></div> : null}{audioUnavailable ? <p className="episode__audio-status" role="status">Narration unavailable. Captions are now on.</p> : null}</div>
      <div className="episode__tools"><button type="button" onClick={() => setCaptions((value) => !value)} aria-pressed={captions}>CC {captions ? "On" : "Off"}</button><button type="button" onClick={() => setDrawer("transcript")}>Transcript</button><button type="button" onClick={() => setDrawer("sources")}>Sources</button></div>
    </header>

    <div className={`episode__stage episode__stage--${cue.visual} ${hasPreparedVideo ? "episode__stage--video" : ""} ${overlay ? "episode__stage--overlay" : ""}`}>
      {state.status === "complete" ? <div className="episode__transition"><span className="episode__eyebrow">Episode complete</span><h2>You caught the AI’s miss.</h2><p>Now apply the same workflow to a realistic renewal matter with guidance at each step.</p><button type="button" onClick={() => { if (!completed.current) { completed.current = true; onComplete(); } }}>Start guided rehearsal</button></div> : checkpoint ? <div className="episode__checkpoint">
        <span className="episode__eyebrow">Decision checkpoint</span><h2>{checkpoint.prompt}</h2><p>SGD 42,000 renewal · submitted liability clause changed</p>
        <div className="episode__choices">{checkpoint.choices.map((choice) => <button key={choice.id} type="button" onClick={() => { dispatch({ type: "ANSWER", choiceId: choice.id }); if (choice.safe && hasPreparedVideo) { setMediaSegmentIndex(media!.checkpointAfterSegment + 1); dispatch({ type: "PAUSE" }); } onEvent("checkpoint_answered", { checkpointId: checkpoint.id, choiceId: choice.id, safe: choice.safe }); }}>{choice.label}</button>)}</div>
        {state.lastAnswerSafe === false && <p className="episode__repair" role="alert">Low value never cancels a material redline. Open the clause, apply the higher-priority rule, then route to legal.</p>}
      </div> : hasPreparedVideo ? <><video key={mediaSegment!.id} ref={videoRef} className="episode__video" aria-label="Prepared training episode" src={mediaSegment!.videoSrc} playsInline preload="auto" onTimeUpdate={(event) => setVideoTime(event.currentTarget.currentTime)} onEnded={handleMediaEnded} onError={() => setMediaUnavailable(true)} /><audio key={`${mediaSegment!.id}-audio`} ref={audioRef} className="episode__audio" aria-label="Episode narration" preload="auto" src={mediaSegment!.audioSrc} onError={handleAudioUnavailable} />{overlay ? <InstructionalOverlay overlay={overlay} /> : null}<div className="episode__video-label"><span>{media!.label}</span><strong>{mediaSegment!.title}</strong></div>{state.status !== "playing" && <button type="button" className="episode__center-play" aria-label={mediaSegmentIndex === 0 ? "Play episode video" : "Continue episode video"} onClick={play}><span aria-hidden="true">▶</span></button>}</> : <><img className="episode__portrait" src={portraitUrl ?? mayaPortrait} alt={`${bundle.useCase.contributorName}, fictional legal innovation counsel`} /><div className="episode__frame"><span>Chapter {cue.chapter} / {timeline.length}</span><h2>{cue.title}</h2><p>{cue.narration}</p></div></>}
      {captions && state.status !== "complete" && <p className="episode__captions">{mediaSegment?.caption ?? cue.caption}</p>}
    </div>

    {hasPreparedVideo ? <nav className="episode__segments" aria-label="Episode segments">{media!.segments.map((segment, index) => { const locked = index > media!.checkpointAfterSegment && state.answeredCheckpointIds.length === 0; return <button key={segment.id} type="button" disabled={locked} className={index === mediaSegmentIndex ? "is-current" : index < mediaSegmentIndex ? "is-complete" : ""} aria-label={`Chapter ${index + 1}: ${segment.title}`} onClick={() => selectMediaSegment(index)}><span>{index + 1}</span>{segment.title}</button>; })}</nav> : <nav className="episode__chapters" aria-label="Episode chapters">{timeline.map((item, index) => <button key={item.id} type="button" className={index === state.cueIndex ? "is-current" : ""} aria-label={`Chapter ${item.chapter}: ${item.title}`} onClick={() => dispatch({ type: "SEEK", cueIndex: index })}><span>{item.chapter}</span><small>{item.title}</small></button>)}</nav>}
    <div className="episode__controls">
      {state.status === "playing" ? <button type="button" onClick={pause}>Pause episode</button> : state.status === "complete" ? <button type="button" onClick={() => { setMediaSegmentIndex(0); completed.current = false; dispatch({ type: "REPLAY" }); }}>Replay episode</button> : <button type="button" onClick={play} disabled={state.status === "checkpoint"}>{hasPreparedVideo && mediaSegmentIndex === 1 ? "Continue episode" : "Play episode"}</button>}
      <span>{hasPreparedVideo ? `Part ${mediaSegmentIndex + 1} / ${media!.segments.length}` : `${state.elapsedSeconds}s / ${timeline.reduce((sum, item) => sum + item.durationSeconds, 0)}s`}</span>
      {hasPreparedVideo && state.status !== "checkpoint" && state.status !== "complete" ? <button type="button" onClick={handleMediaEnded}>{mediaSegmentIndex === media!.checkpointAfterSegment ? "Continue to decision" : mediaSegmentIndex === media!.segments.length - 1 ? "Finish episode" : "Next chapter"}</button> : null}
      {!hasPreparedVideo && state.answeredCheckpointIds.length > 0 && state.status !== "complete" && <button type="button" onClick={() => dispatch({ type: "FINISH" })}>Continue to rehearsal</button>}
    </div>

    {drawer !== "none" && <aside className="episode__drawer" aria-label={drawer === "sources" ? "Episode sources" : "Episode transcript"}><button className="episode__close" type="button" onClick={() => setDrawer("none")}>Close</button>{drawer === "transcript" ? <><h2>Transcript</h2><input type="search" aria-label="Search transcript" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this episode" />{matchingCues.map((item) => <article key={item.id}><strong>{item.title}</strong><p>{item.narration}</p></article>)}</> : <><h2>Sources for this scene</h2>{sourceIds.map((id) => { const source = bundle.useCase.sources.find((item) => item.id === id); return <button className="episode__source" key={id} type="button" aria-label={`Open source ${id.replaceAll("-", " ")}`} onClick={() => onEvent("source_opened", { sourceRefId: id })}><strong>{source?.title ?? id}</strong><span>{source?.excerpt}</span></button>; })}</>}</aside>}
  </section>;
}
