import { useState } from "react";
import type { GeneratedModuleDraft } from "../../domain/generation";
import type { DemoPack } from "../studio/demoPack";
import { requestGeneratedModule } from "./generationClient";

interface GeneratedDraftPanelProps {
  pack?: DemoPack;
  onGenerated: (draft: GeneratedModuleDraft) => void;
  generate?: typeof requestGeneratedModule;
}

export function GeneratedDraftPanel({
  pack,
  onGenerated,
  generate = requestGeneratedModule,
}: GeneratedDraftPanelProps) {
  const [token, setToken] = useState("");
  const [draft, setDraft] = useState<GeneratedModuleDraft>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function generateDraft() {
    if (!pack || !token.trim() || busy) return;
    setBusy(true);
    setError(undefined);
    try {
      const next = await generate(pack, token.trim());
      setDraft(next);
      onGenerated(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The draft could not be generated safely.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="generated-draft" aria-labelledby="generated-draft-title">
      <div className="generated-draft__controls">
        <div>
          <p className="eyebrow">Protected production</p>
          <h2 id="generated-draft-title">Generate the source-linked episode draft</h2>
          <p>The token stays in memory. The portrait stays in this browser.</p>
        </div>
        <label>
          <span>Studio production token</span>
          <input
            type="password"
            autoComplete="off"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="primary-button"
          disabled={!pack || !token.trim() || busy}
          onClick={() => void generateDraft()}
        >
          {busy ? "Generating…" : "Generate source-linked draft"}
        </button>
      </div>

      {error ? <p className="generated-draft__error" role="alert">{error}</p> : null}
      {draft ? (
        <article className="generated-draft__preview">
          <div><span>AI draft · human approval required</span><h3>{draft.title}</h3></div>
          <ol>
            {draft.chapters.map((chapter) => (
              <li key={chapter.id}>
                <strong>{chapter.title}</strong>
                <p>{chapter.narration}</p>
                <small>{chapter.shots.length} shots · Sources: {chapter.sourceRefIds.map((id) => <code key={id}>{id}</code>)}</small>
              </li>
            ))}
          </ol>
          <section>
            <span>Decision checkpoint</span>
            <strong>{draft.checkpoint.question}</strong>
            <p>{draft.checkpoint.explanation}</p>
            <small>Sources: {draft.checkpoint.sourceRefIds.map((id) => <code key={id}>{id}</code>)}</small>
          </section>
        </article>
      ) : null}
    </section>
  );
}
