import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { MatterShiftEventReporter } from "../../domain/integration";
import {
  createPortraitObjectUrl,
  DEMO_PACK_MARKERS,
  demoPackStatus,
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
  onEvent: MatterShiftEventReporter;
}

type PartialDemoPack = Partial<Omit<DemoPack, "filenames">> & {
  filenames: Partial<Record<DemoPackKind, string>>;
};

const textKinds = ["workflow", "playbook", "template", "contract"] as const;
type TextKind = (typeof textKinds)[number];

const labels: Record<DemoPackKind, string> = {
  workflow: "Workflow document",
  playbook: "Legal playbook",
  template: "Approved contract template",
  contract: "Submitted renewal contract",
  portrait: "Contributor portrait",
};

function completePack(value: PartialDemoPack): DemoPack | null {
  if (
    !value.workflowText ||
    !value.playbookText ||
    !value.templateText ||
    !value.contractText ||
    !value.portraitUrl ||
    !value.portraitUrlKind ||
    textKinds.some((kind) => !value.filenames[kind]) ||
    !value.filenames.portrait
  ) {
    return null;
  }

  return {
    workflowText: value.workflowText,
    playbookText: value.playbookText,
    templateText: value.templateText,
    contractText: value.contractText,
    portraitUrl: value.portraitUrl,
    portraitUrlKind: value.portraitUrlKind,
    filenames: value.filenames as Record<DemoPackKind, string>,
  };
}

export function DemoPackInput({ onReady, onEvent }: DemoPackInputProps) {
  const [draft, setDraft] = useState<PartialDemoPack>({ filenames: {} });
  const [error, setError] = useState<string>();
  const draftRef = useRef(draft);

  function replaceDraft(next: PartialDemoPack, source: "bundled" | "uploaded") {
    draftRef.current = next;
    setDraft(next);
    setError(undefined);
    const complete = completePack(next);
    if (!complete) return;

    const validation = validateDemoPack(complete);
    if (!validation.valid) {
      setError(validation.errors.join(" "));
      return;
    }
    onReady(complete);
    onEvent("demo_pack_loaded", { source, inputCount: 5 });
  }

  function loadBundledPack() {
    releasePortraitUrl(draftRef.current.portraitUrl, draftRef.current.portraitUrlKind);
    replaceDraft(loadSyntheticDemoPack(), "bundled");
  }

  async function selectTextFile(kind: TextKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await readDemoTextFile(file, DEMO_PACK_MARKERS[kind]);
      const next: PartialDemoPack = {
        ...draftRef.current,
        [`${kind}Text`]: text,
        filenames: { ...draftRef.current.filenames, [kind]: file.name },
      };
      replaceDraft(next, "uploaded");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${file.name} could not be read.`);
    }
  }

  function selectPortrait(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const nextUrl = createPortraitObjectUrl(file);
      releasePortraitUrl(
        draftRef.current.portraitUrl,
        draftRef.current.portraitUrlKind,
      );
      replaceDraft(
        {
          ...draftRef.current,
          portraitUrl: nextUrl,
          portraitUrlKind: "object_url",
          filenames: { ...draftRef.current.filenames, portrait: file.name },
        },
        "uploaded",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${file.name} is not supported.`);
    }
  }

  useEffect(
    () => () => {
      releasePortraitUrl(
        draftRef.current.portraitUrl,
        draftRef.current.portraitUrlKind,
      );
    },
    [],
  );

  const status = demoPackStatus(draft);

  return (
    <section className="demo-pack" aria-labelledby="demo-pack-title">
      <div className="demo-pack__heading">
        <div>
          <p className="eyebrow">Legal engineer studio</p>
          <h2 id="demo-pack-title">Build from five governed inputs</h2>
          <p>Files stay in this browser. Only the marked synthetic pack is accepted.</p>
        </div>
        <button type="button" className="primary-button" onClick={loadBundledPack}>
          Load synthetic demo pack
        </button>
      </div>

      <div className="demo-pack__grid">
        {textKinds.map((kind) => (
          <label className="demo-file" key={kind}>
            <span>{labels[kind]}</span>
            <strong>{draft.filenames[kind] ?? "Not selected"}</strong>
            <small>{draft.filenames[kind] ? "Ready · local only" : "Markdown or text · 2 MB max"}</small>
            <input
              type="file"
              accept=".md,.txt,text/markdown,text/plain"
              aria-label={`Select ${labels[kind].toLowerCase()}`}
              onChange={(event) => void selectTextFile(kind, event)}
            />
          </label>
        ))}
        <label className="demo-file demo-file--portrait">
          <span>{labels.portrait}</span>
          <strong>{draft.filenames.portrait ?? "Not selected"}</strong>
          <small>{draft.filenames.portrait ? "Ready · local only" : "PNG, JPEG or SVG · 2 MB max"}</small>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            aria-label="Select contributor portrait"
            onChange={selectPortrait}
          />
          {draft.portraitUrl ? (
            <img src={draft.portraitUrl} alt="Synthetic contributor preview" />
          ) : null}
        </label>
      </div>

      <div className="demo-pack__status" role="status">
        {status.readyKinds.length === 5
          ? "Five inputs ready"
          : `${status.readyKinds.length} of 5 inputs ready`}
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}
