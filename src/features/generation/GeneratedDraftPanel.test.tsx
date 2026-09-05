import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { GeneratedModuleDraft } from "../../domain/generation";
import { loadSyntheticDemoPack } from "../studio/demoPack";
import { GeneratedDraftPanel } from "./GeneratedDraftPanel";

const draft: GeneratedModuleDraft = {
  schemaVersion: "1.0",
  title: "The redline that changed the route",
  learningObjectives: ["Verify the source before routing."],
  chapters: ["intake", "review", "route"].map((id) => ({
    id,
    title: id,
    narration: `${id} narration`,
    sourceRefIds: [id === "route" ? "playbook" : "workflow"],
    shots: [1, 2, 3].map((shot) => ({ id: `${id}-${shot}`, prompt: `Shot ${shot}` })),
  })),
  checkpoint: {
    question: "Where should the matter go?",
    options: [{ id: "legal", label: "Legal review" }, { id: "business", label: "Business approval" }],
    correctOptionId: "legal",
    explanation: "The material redline controls.",
    sourceRefIds: ["playbook"],
  },
};

describe("GeneratedDraftPanel", () => {
  it("requires a prepared pack and an in-memory Studio token", () => {
    const view = render(<GeneratedDraftPanel onGenerated={vi.fn()} generate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /generate source-linked draft/i })).toBeDisabled();
    view.rerender(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} onGenerated={vi.fn()} generate={vi.fn()} />);
    expect(screen.getByRole("button", { name: /generate source-linked draft/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/studio production token/i), { target: { value: "token" } });
    expect(screen.getByRole("button", { name: /generate source-linked draft/i })).toBeEnabled();
  });

  it("prevents duplicate generation and previews cited output", async () => {
    let resolve!: (value: GeneratedModuleDraft) => void;
    const generate = vi.fn(() => new Promise<GeneratedModuleDraft>((done) => { resolve = done; }));
    const onGenerated = vi.fn();
    render(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} onGenerated={onGenerated} generate={generate} />);
    fireEvent.change(screen.getByLabelText(/studio production token/i), { target: { value: "token" } });
    fireEvent.click(screen.getByRole("button", { name: /generate source-linked draft/i }));
    expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled();
    resolve(draft);
    expect(await screen.findByRole("heading", { name: draft.title })).toBeVisible();
    expect(screen.getByText("route narration")).toBeVisible();
    expect(screen.getAllByText("playbook").length).toBeGreaterThan(0);
    expect(onGenerated).toHaveBeenCalledWith(draft);
  });

  it("shows a recoverable error and forgets the token after unmount", async () => {
    const generate = vi.fn(async () => { throw new Error("Generation timed out. Your approved module is unchanged."); });
    const first = render(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} onGenerated={vi.fn()} generate={generate} />);
    fireEvent.change(screen.getByLabelText(/studio production token/i), { target: { value: "temporary-token" } });
    fireEvent.click(screen.getByRole("button", { name: /generate source-linked draft/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/approved module is unchanged/i);
    first.unmount();
    render(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} onGenerated={vi.fn()} generate={generate} />);
    expect(screen.getByLabelText(/studio production token/i)).toHaveValue("");
  });

  it("offers narration only after exact human approval and discloses the AI voice", async () => {
    const narration = {
      url: "blob:narration",
      busy: false,
      error: undefined,
      generate: vi.fn(async () => undefined),
      clear: vi.fn(),
    };
    const view = render(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} draft={draft} onGenerated={vi.fn()} generate={vi.fn()} narration={narration} />);
    expect(screen.queryByRole("button", { name: /generate approved narration/i })).not.toBeInTheDocument();
    view.rerender(<GeneratedDraftPanel pack={loadSyntheticDemoPack()} draft={draft} approvalFingerprint="msc-abcd1234" onGenerated={vi.fn()} generate={vi.fn()} narration={narration} />);
    fireEvent.change(screen.getByLabelText(/studio production token/i), { target: { value: "token" } });
    fireEvent.click(screen.getByRole("button", { name: /generate approved narration/i }));
    expect(narration.generate).toHaveBeenCalledWith(expect.objectContaining({
      narration: "intake narration\n\nreview narration\n\nroute narration",
      approvalFingerprint: "msc-abcd1234",
      studioToken: "token",
    }));
    expect(screen.getByText(/ai-generated voice/i)).toBeVisible();
    expect(screen.getByTitle(/approved ai narration/i)).toHaveAttribute("src", "blob:narration");
  });
});
