interface PreviewScreenProps {
  title: string;
  onApprovePublish: () => void;
}

const previewScenes = ["The routine renewal", "The missed redline", "Verify and escalate"];

export function PreviewScreen({ title, onApprovePublish }: PreviewScreenProps) {
  return <main id="main-content" className="preview-screen">
    <header className="preview-screen__header"><div><p className="entry__eyebrow">Episode preview</p><h1>{title}</h1></div><button type="button" className="entry__primary" onClick={onApprovePublish}>Approve and publish</button></header>
    <section className="preview-screen__player" aria-label="Prepared episode preview">
      <div className="preview-screen__frame"><span className="preview-screen__play" aria-hidden="true">▶</span><div><span>Prepared demo render</span><strong>AI-assisted contract review</strong><small>30 seconds · interactive checkpoint included</small></div></div>
      <ol aria-label="Episode scenes">{previewScenes.map((scene, index) => <li key={scene}><span>{String(index + 1).padStart(2, "0")}</span><strong>{scene}</strong></li>)}</ol>
    </section>
    <div className="preview-screen__details"><details><summary>Review script and sources</summary><p>The narration, checkpoint and route are linked to the approved workflow and legal playbook.</p></details><details><summary>Generation details</summary><p>Prepared Runway visuals with approved narration and one learner checkpoint.</p></details></div>
  </main>;
}
