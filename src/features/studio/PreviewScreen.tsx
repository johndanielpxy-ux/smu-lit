import { useRef, useState } from "react";
import { preparedEpisodeMedia } from "../episode/episodeMedia";

interface PreviewScreenProps {
  title: string;
  onApprovePublish: () => void;
}

export function PreviewScreen({ title, onApprovePublish }: PreviewScreenProps) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const scene = preparedEpisodeMedia.segments[sceneIndex];
  return <main id="main-content" className="preview-screen">
    <header className="preview-screen__header"><div><p className="entry__eyebrow">Episode preview</p><h1>{title}</h1></div><button type="button" className="entry__primary" onClick={onApprovePublish}>Approve and publish</button></header>
    <section className="preview-screen__player" aria-label="Prepared episode preview">
      <div className="preview-screen__frame"><video key={scene.id} title="Episode preview video" controls playsInline preload="metadata" src={scene.videoSrc} onPlay={(event) => { if (audioRef.current) audioRef.current.currentTime = event.currentTarget.currentTime; void audioRef.current?.play(); }} onPause={() => audioRef.current?.pause()} onEnded={() => setSceneIndex((index) => Math.min(index + 1, preparedEpisodeMedia.segments.length - 1))} /><audio key={`${scene.id}-audio`} ref={audioRef} title="Episode preview narration" controls preload="metadata" src={scene.audioSrc} /><div className="preview-screen__video-copy"><span>Prepared instructional episode</span><strong>{scene.title}</strong><small>Preview scene {sceneIndex + 1} of {preparedEpisodeMedia.segments.length} · interactive checkpoint included</small></div></div>
      <ol aria-label="Episode scenes">{preparedEpisodeMedia.segments.map((item, index) => <li key={item.id} className={index === sceneIndex ? "is-current" : ""}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong></li>)}</ol>
    </section>
    <div className="preview-screen__details"><details><summary>Review script and sources</summary><p>The narration, checkpoint and route are linked to the approved workflow and legal playbook.</p></details><details><summary>Generation details</summary><p>Prepared Runway visuals with approved narration and one learner checkpoint.</p></details></div>
  </main>;
}
