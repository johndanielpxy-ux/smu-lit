interface WelcomeScreenProps {
  onEnter: () => void;
  onBrowse?: () => void;
}

export function WelcomeScreen({ onEnter, onBrowse }: WelcomeScreenProps) {
  return <main id="main-content" className="entry entry--welcome">
    <nav className="entry__nav" aria-label="LAWFLO"><a href="#main-content" className="entry__brand"><span>LF</span><strong>LAWFLO</strong></a><span>Workflow learning for legal teams</span></nav>
    <section className="entry__hero">
      <div className="entry__invitation"><p className="entry__eyebrow">Firm knowledge, made practical</p><h1>Turn firm knowledge into safer practice.</h1><p>Build interactive training from the legal AI workflows your team already trusts.</p><div className="entry__actions"><button type="button" className="entry__primary" onClick={onEnter}>Enter LAWFLO</button>{onBrowse ? <button type="button" className="entry__link" onClick={onBrowse}>Explore learner training</button> : null}</div></div>
    </section>
    <p className="entry__footnote">Designed for legal teams adopting AI with human judgment intact.</p>
  </main>;
}
