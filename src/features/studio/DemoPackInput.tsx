import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { MatterShiftEventReporter } from "../../domain/integration";
import {
  createPortraitObjectUrl,
  DEMO_PACK_MARKERS,
  loadSyntheticDemoPack,
  readDemoTextFile,
  releasePortraitUrl,
  validateDemoPack,
  type DemoPack,
  type DemoPackKind,
} from "./demoPack";
import "./studio.css";

interface DemoPackInputProps {
  onReady: (pack: DemoPack) => void;
  onCreate: (pack: DemoPack) => void;
  onEvent: MatterShiftEventReporter;
}

type PartialDemoPack = Partial<Omit<DemoPack, "filenames">> & {
  filenames: Partial<Record<DemoPackKind, string>>;
};

const textKinds = ["workflow", "playbook", "template", "contract"] as const;
type TextKind = (typeof textKinds)[number];

const labels: Record<DemoPackKind, string> = {
  workflow: "Workflow instructions",
  playbook: "Legal playbook",
  template: "Approved template",
  contract: "Example matter",
  portrait: "Contributor portrait",
};

function completePack(value: PartialDemoPack): DemoPack | null {
  if (!value.workflowText || !value.playbookText || !value.templateText || !value.contractText || !value.portraitUrl || !value.portraitUrlKind || textKinds.some((kind) => !value.filenames[kind]) || !value.filenames.portrait) return null;
  return { workflowText: value.workflowText, playbookText: value.playbookText, templateText: value.templateText, contractText: value.contractText, portraitUrl: value.portraitUrl, portraitUrlKind: value.portraitUrlKind, filenames: value.filenames as Record<DemoPackKind, string> };
}

function kindFor(file: File, draft: PartialDemoPack): TextKind | "portrait" | undefined {
  if (file.type.startsWith("image/")) return "portrait";
  const name = file.name.toLowerCase();
  if (name.includes("workflow")) return "workflow";
  if (name.includes("playbook") || name.includes("policy")) return "playbook";
  if (name.includes("template") || name.includes("standard")) return "template";
  if (name.includes("contract") || name.includes("agreement") || name.includes("renewal")) return "contract";
  return textKinds.find((kind) => !draft.filenames[kind]);
}

export function DemoPackInput({ onReady, onCreate, onEvent }: DemoPackInputProps) {
  const [draft, setDraft] = useState<PartialDemoPack>({ filenames: {} });
  const [error, setError] = useState<string>();
  const draftRef = useRef(draft);
  const transferredRef = useRef(false);
  const workflowInputRef = useRef<HTMLInputElement>(null);

  function replaceDraft(next: PartialDemoPack, source: "bundled" | "uploaded") {
    draftRef.current = next;
    setDraft(next);
    setError(undefined);
    const complete = completePack(next);
    if (!complete) return;
    const validation = validateDemoPack(complete);
    if (!validation.valid) { setError(validation.errors.join(" ")); return; }
    onReady(complete);
    onEvent("demo_pack_loaded", { source, inputCount: 5 });
  }

  function loadPreparedPack() {
    releasePortraitUrl(draftRef.current.portraitUrl, draftRef.current.portraitUrlKind);
    replaceDraft(loadSyntheticDemoPack(), "bundled");
  }

  async function selectResources(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const next: PartialDemoPack = { ...draftRef.current, filenames: { ...draftRef.current.filenames } };
    try {
      for (const file of files) {
        const kind = kindFor(file, next);
        if (!kind) throw new Error(`${file.name} could not be matched to a workflow source.`);
        if (kind === "portrait") {
          const nextUrl = createPortraitObjectUrl(file);
          releasePortraitUrl(next.portraitUrl, next.portraitUrlKind);
          next.portraitUrl = nextUrl;
          next.portraitUrlKind = "object_url";
          next.filenames.portrait = file.name;
        } else {
          next[`${kind}Text`] = await readDemoTextFile(file, DEMO_PACK_MARKERS[kind]);
          next.filenames[kind] = file.name;
        }
      }
      replaceDraft(next, "uploaded");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The selected resources could not be read.");
    }
  }

  function selectPortrait(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const nextUrl = createPortraitObjectUrl(file);
      releasePortraitUrl(draftRef.current.portraitUrl, draftRef.current.portraitUrlKind);
      replaceDraft({ ...draftRef.current, portraitUrl: nextUrl, portraitUrlKind: "object_url", filenames: { ...draftRef.current.filenames, portrait: file.name } }, "uploaded");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${file.name} is not supported.`);
    }
  }

  useEffect(() => () => { if (!transferredRef.current) releasePortraitUrl(draftRef.current.portraitUrl, draftRef.current.portraitUrlKind); }, []);

  const complete = completePack(draft);
  const readyKinds = (Object.keys(labels) as DemoPackKind[]).filter((kind) => draft.filenames[kind]);

  return <section className="source-intake" aria-labelledby="demo-pack-title">
    <header className="source-intake__header"><p className="entry__eyebrow">Legal engineer studio</p><h1 id="demo-pack-title">Create training from your workflow.</h1><p>Add the instructions and examples your team already uses. LAWFLO will turn them into a short episode and guided rehearsal.</p></header>
    {readyKinds.length ? <section className="source-complete" aria-label="Uploaded workflow resources">
      <header><div><span className="source-complete__check" aria-hidden="true">✓</span><div><strong>{readyKinds.length} workflow resources uploaded</strong><small>Ready to turn into a learning episode</small></div></div><button type="button" onClick={() => workflowInputRef.current?.click()}>Replace workflow files</button></header>
      <input ref={workflowInputRef} className="source-complete__input" type="file" multiple accept=".md,.txt,text/markdown,text/plain,image/png,image/jpeg,image/svg+xml" aria-label="Replace workflow files input" onChange={(event) => void selectResources(event)} />
      <ul className="source-list">{readyKinds.map((kind) => <li key={kind}><span aria-hidden="true">✓</span><div><strong>{labels[kind]}</strong><small>{draft.filenames[kind]}</small></div></li>)}</ul>
    </section> : <>
      <label className="source-dropzone">
        <span className="source-dropzone__mark" aria-hidden="true">＋</span>
        <strong>Upload workflow resources</strong>
        <small>Workflow, playbook, approved template and a synthetic example matter</small>
        <input type="file" multiple accept=".md,.txt,text/markdown,text/plain,image/png,image/jpeg,image/svg+xml" aria-label="Upload workflow resources" onChange={(event) => void selectResources(event)} />
      </label>
      <div className="source-intake__or"><span>or</span></div>
      <button type="button" className="source-intake__prepared" onClick={loadPreparedPack}>Use prepared source pack</button>
    </>}
    <section className="source-presenter" aria-labelledby="presenter-title"><div>{draft.portraitUrl ? <img src={draft.portraitUrl} alt="Selected episode presenter" /> : <span aria-hidden="true">JT</span>}<div><p className="entry__eyebrow">Episode presenter</p><h2 id="presenter-title">Choose who presents the episode.</h2><small>Use a synthetic or consented portrait. It stays in this browser.</small></div></div><label>Upload contributor portrait<input type="file" accept="image/png,image/jpeg,image/svg+xml" aria-label="Upload contributor portrait" onChange={selectPortrait} /></label></section>
    <details className="source-settings"><summary>Source settings</summary><p>The prepared demo validates and compiles its synthetic sources locally. A protected server endpoint handles live generation deployments; the portrait remains in this browser.</p></details>
    <footer className="source-intake__footer"><span role="status">{readyKinds.length} sources ready</span><button type="button" className="entry__primary" disabled={!complete} onClick={() => { if (complete) { transferredRef.current = true; onCreate(complete); } }}>Create episode</button></footer>
    {error ? <p className="source-intake__error" role="alert">{error}</p> : null}
  </section>;
}
