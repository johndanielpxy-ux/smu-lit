import workflowText from "../../demo/assets/contract-review-workflow.md?raw";
import playbookText from "../../demo/assets/contract-review-playbook.md?raw";
import templateText from "../../demo/assets/standard-sales-renewal.md?raw";
import contractText from "../../demo/assets/submitted-sales-renewal.md?raw";
import portraitUrl from "../../demo/assets/maya-tan.png";

export const DEMO_PACK_MARKERS = {
  workflow: "LAWFLO-DEMO: contract-review-workflow-v1",
  playbook: "LAWFLO-DEMO: contract-review-playbook-v2026.2",
  template: "LAWFLO-DEMO: standard-sales-renewal-v2026.2",
  contract: "LAWFLO-DEMO: submitted-sales-renewal-v1",
} as const;

export type DemoPackKind =
  | "workflow"
  | "playbook"
  | "template"
  | "contract"
  | "portrait";

export interface DemoPack {
  workflowText: string;
  playbookText: string;
  templateText: string;
  contractText: string;
  portraitUrl: string;
  portraitUrlKind: "bundled" | "object_url";
  filenames: Record<DemoPackKind, string>;
}

export interface DemoPackStatus {
  readyKinds: DemoPackKind[];
  missingKinds: DemoPackKind[];
  errors: string[];
}

export type DemoPackDraft = Partial<Omit<DemoPack, "filenames">> & {
  filenames?: Partial<Record<DemoPackKind, string>>;
};

export type DemoPackErrorCode =
  | "UNSUPPORTED_FILE"
  | "FILE_TOO_LARGE"
  | "FILE_READ_FAILED"
  | "MARKER_MISMATCH"
  | "OBJECT_URL_UNAVAILABLE";

export class DemoPackError extends Error {
  constructor(
    public readonly code: DemoPackErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DemoPackError";
  }
}

const MAX_FILE_BYTES = 2 * 1024 * 1024;
const textExtensions = new Set(["md", "txt"]);
const portraitTypes = new Set(["image/png", "image/jpeg", "image/svg+xml"]);

function extensionOf(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function assertFileSize(file: File): void {
  if (file.size > MAX_FILE_BYTES) {
    throw new DemoPackError(
      "FILE_TOO_LARGE",
      `${file.name} exceeds the 2 MB local-file limit.`,
    );
  }
}

export async function readDemoTextFile(
  file: File,
  expectedMarker: string,
): Promise<string> {
  assertFileSize(file);
  if (!textExtensions.has(extensionOf(file.name))) {
    throw new DemoPackError(
      "UNSUPPORTED_FILE",
      `${file.name} must be a Markdown or text file.`,
    );
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    throw new DemoPackError(
      "FILE_READ_FAILED",
      `${file.name} could not be read in this browser.`,
    );
  }

  if (!text.startsWith(expectedMarker)) {
    throw new DemoPackError(
      "MARKER_MISMATCH",
      `${file.name} is not the expected versioned LAWFLO demonstration file.`,
    );
  }
  return text;
}

export function createPortraitObjectUrl(file: File): string {
  assertFileSize(file);
  if (!portraitTypes.has(file.type)) {
    throw new DemoPackError(
      "UNSUPPORTED_FILE",
      `${file.name} must be a PNG, JPEG or SVG portrait.`,
    );
  }
  if (typeof URL.createObjectURL !== "function") {
    throw new DemoPackError(
      "OBJECT_URL_UNAVAILABLE",
      "This browser cannot preview a local portrait.",
    );
  }
  return URL.createObjectURL(file);
}

export function releasePortraitUrl(
  url: string | undefined,
  kind: DemoPack["portraitUrlKind"] | undefined,
): void {
  if (url && kind === "object_url" && typeof URL.revokeObjectURL === "function") {
    URL.revokeObjectURL(url);
  }
}

export function loadSyntheticDemoPack(): DemoPack {
  return {
    workflowText,
    playbookText,
    templateText,
    contractText,
    portraitUrl,
    portraitUrlKind: "bundled",
    filenames: {
      workflow: "contract-review-workflow.md",
      playbook: "contract-review-playbook.md",
      template: "standard-sales-renewal.md",
      contract: "submitted-sales-renewal.md",
      portrait: "maya-tan.png",
    },
  };
}

export function validateDemoPack(pack: DemoPack): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const checks: Array<[Exclude<DemoPackKind, "portrait">, string, string]> = [
    ["workflow", pack.workflowText, DEMO_PACK_MARKERS.workflow],
    ["playbook", pack.playbookText, DEMO_PACK_MARKERS.playbook],
    ["template", pack.templateText, DEMO_PACK_MARKERS.template],
    ["contract", pack.contractText, DEMO_PACK_MARKERS.contract],
  ];

  for (const [kind, value, marker] of checks) {
    if (!value.startsWith(marker)) {
      errors.push(
        kind === "contract"
          ? "The selected contract is not the versioned LAWFLO demonstration contract."
          : `The selected ${kind} is not the versioned LAWFLO demonstration ${kind}.`,
      );
    }
  }
  if (!pack.portraitUrl || !pack.filenames.portrait) {
    errors.push("A contributor portrait is required.");
  }

  return { valid: errors.length === 0, errors };
}

export function demoPackStatus(pack: DemoPackDraft): DemoPackStatus {
  const kinds: DemoPackKind[] = [
    "workflow",
    "playbook",
    "template",
    "contract",
    "portrait",
  ];
  const readyKinds = kinds.filter((kind) => {
    if (kind === "portrait") return Boolean(pack.portraitUrl);
    return Boolean(pack[`${kind}Text` as keyof DemoPack]);
  });
  return {
    readyKinds,
    missingKinds: kinds.filter((kind) => !readyKinds.includes(kind)),
    errors: [],
  };
}
