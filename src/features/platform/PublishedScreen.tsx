interface PublishedScreenProps {
  title: string;
  onViewAsLearner: () => void;
}

export function PublishedScreen({ title, onViewAsLearner }: PublishedScreenProps) {
  return <main id="main-content" className="entry entry--published">
    <section className="publish-success">
      <span className="publish-success__mark" aria-hidden="true">✓</span>
      <p className="entry__eyebrow">Published</p>
      <h1>Your episode is ready for learners.</h1>
      <p><strong>{title}</strong> is now available as an interactive episode and guided rehearsal.</p>
      <button type="button" className="entry__primary" onClick={onViewAsLearner}>View as learner</button>
    </section>
  </main>;
}
