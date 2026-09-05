interface WelcomeScreenProps {
  onEnter: () => void;
  onBrowse?: () => void;
}

export function WelcomeScreen({ onEnter, onBrowse }: WelcomeScreenProps) {
  return <main id="main-content" className="entry entry--welcome">
    <nav className="entry__nav" aria-label="LAWFLO"><a href="#main-content" className="entry__brand"><span>LF</span><strong>LAWFLO</strong></a><span>Workflow learning for legal teams</span></nav>
    <section className="entry__hero">
      <div className="entry__invitation"><p className="entry__eyebrow">Firm knowledge, made practical</p><h1>Turn firm knowledge into safer practice.</h1><p>Build interactive training from the legal AI workflows your team already trusts.</p><div className="entry__actions"><button type="button" className="entry__primary" onClick={onEnter}>Enter LAWFLO</button>{onBrowse ? <button type="button" className="entry__link" onClick={onBrowse}>Explore learner training</button> : null}</div></div>
      <aside className="entry__journey" aria-label="From firm workflow to guided practice"><p>One governed learning loop</p><ol><li><span>01</span><div><strong>Approved workflow</strong><small>Firm sources and legal-engineer judgment</small></div></li><li><span>02</span><div><strong>Interactive episode</strong><small>Cinematic explanation with a decision point</small></div></li><li><span>03</span><div><strong>Guided rehearsal</strong><small>Practice the same legal AI workflow safely</small></div></li></ol></aside>
    </section>
    <p className="entry__footnote">Designed for legal teams adopting AI with human judgment intact.</p>
  </main>;
}
