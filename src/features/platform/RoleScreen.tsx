import type { PlatformRole } from "./platformJourney";

interface RoleScreenProps {
  learnerAvailable: boolean;
  onSelect: (role: PlatformRole) => void;
  onBack: () => void;
}

export function RoleScreen({ learnerAvailable, onSelect, onBack }: RoleScreenProps) {
  return <main id="main-content" className="entry entry--role">
    <button type="button" className="entry__back" onClick={onBack}>Back</button>
    <section className="role-choice">
      <p className="entry__eyebrow">Choose your workspace</p>
      <h1>How will you use LAWFLO today?</h1>
      <div className="role-choice__options">
        <button type="button" onClick={() => onSelect("legal_engineer")}><span className="role-choice__index">01</span><strong>Legal engineer</strong><small>Create training from an approved legal AI workflow.</small><span aria-hidden="true">Continue →</span></button>
        <button type="button" disabled={!learnerAvailable} onClick={() => onSelect("learner")}><span className="role-choice__index">02</span><strong>Learner</strong><small>{learnerAvailable ? "Watch and rehearse a published workflow." : "Publish an episode to open the learner view."}</small><span aria-hidden="true">{learnerAvailable ? "Continue →" : "Not available yet"}</span></button>
      </div>
    </section>
  </main>;
}
