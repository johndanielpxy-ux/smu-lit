import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { resetDemo } from "./features/events/eventStore";

beforeEach(() => { vi.unstubAllGlobals(); resetDemo(); window.localStorage.clear(); });

async function publish() {
  fireEvent.click(screen.getByRole("button", { name: /load synthetic demo pack/i }));
  expect(await screen.findByText(/draft ready for named approval/i)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));
  fireEvent.click(screen.getByRole("button", { name: /publish learning module/i }));
  expect(screen.getByText(/ready to learn the workflow/i)).toBeVisible();
}

function verifyFinding(label: string, clauseLabel: RegExp, value: string) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^open ${label}$`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: clauseLabel }));
  fireEvent.change(screen.getByRole("textbox", { name: new RegExp(`verified value for ${label}`, "i") }), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`submit verified value for ${label}`, "i") }));
}

describe("LAWFLO application", () => {
  it("treats a generated episode as a new draft that requires fresh approval", async () => {
    const generated = {
      schemaVersion: "1.0",
      title: "Generated redline episode",
      learningObjectives: ["Verify AI findings."],
      chapters: ["intake", "review", "route"].map((id) => ({
        id,
        title: id,
        narration: `${id} narration`,
        sourceRefIds: [id === "route" ? "playbook" : "workflow"],
        shots: [1, 2, 3].map((shot) => ({ id: `${id}-${shot}`, prompt: `Shot ${shot}` })),
      })),
      checkpoint: {
        question: "Where should it go?",
        options: [{ id: "legal", label: "Legal" }, { id: "business", label: "Business" }],
        correctOptionId: "legal",
        explanation: "The playbook controls.",
        sourceRefIds: ["playbook"],
      },
    };
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ draft: generated })));
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /load synthetic demo pack/i }));
    expect(await screen.findByText(/draft ready for named approval/i)).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));
    expect(screen.getByRole("button", { name: /approve exact version/i })).toBeDisabled();
    fireEvent.change(screen.getByLabelText(/studio production token/i), { target: { value: "token" } });
    fireEvent.click(screen.getByRole("button", { name: /generate source-linked draft/i }));
    expect(await screen.findByRole("heading", { level: 3, name: "Generated redline episode" })).toBeVisible();
    expect(screen.getByText(/generated draft ready for human approval/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /approve exact version/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /publish learning module/i })).toBeDisabled();
  });

  it("publishes and enters the complete legal AI learning journey", async () => {
    render(<App />);
    expect(screen.queryByText(/Ananya|Krishiv|Su-Ann/i)).not.toBeInTheDocument();
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /watch episode/i }));
    fireEvent.click(screen.getByRole("button", { name: /chapter 6/i }));
    fireEvent.click(screen.getByRole("button", { name: /escalate to legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue to rehearsal/i }));
    expect(screen.getByRole("heading", { level: 1, name: /northstar analytics sales renewal/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /open northstar matter/i }));
    fireEvent.click(screen.getByRole("button", { name: /run ai review/i }));
    verifyFinding("Contract value", /compare commercial terms clause/i, "42000");
    verifyFinding("Template version", /compare commercial terms clause/i, "2026.2");
    verifyFinding("Personal data processing", /compare commercial terms clause/i, "false");
    verifyFinding("Governing law", /compare governing law clause/i, "Singapore");
    verifyFinding("Material standard-term change", /compare liability clause/i, "true");
    fireEvent.click(screen.getByRole("button", { name: /compare liability clause/i }));
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose legal review/i }));
    fireEvent.change(screen.getByRole("textbox", { name: /explain your route/i }), { target: { value: "The liability cap was removed, so the material-redline rule requires legal review." } });
    fireEvent.click(screen.getByRole("button", { name: /submit route/i }));
    fireEvent.click(screen.getByRole("button", { name: /inspect audit trail/i }));
    expect(screen.getByRole("heading", { name: /your review, translated into practice/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /open workflow guide/i }));
    expect(screen.getByRole("heading", { name: /your sales-renewal legal ai workflow guide/i })).toBeVisible();
  });

  it("enforces approval before publication and fully resets", async () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /publish learning module/i })).toBeDisabled();
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /reset demo/i }));
    expect(screen.getByRole("heading", { name: /turn legal ai pioneers into everyday practice/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /publish learning module/i })).toBeDisabled();
  });

  it("keeps governance evidence inspectable but subordinate", async () => {
    render(<App />);
    await publish();
    expect(screen.queryByRole("heading", { name: /evidence chain/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /how this is governed/i }));
    expect(screen.getByRole("heading", { name: /evidence chain/i })).toBeVisible();
    expect(screen.getByText(/module_published/i)).toBeVisible();
  });

  it("restores a published journey after a browser refresh", async () => {
    const first = render(<App />);
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /watch episode/i }));
    first.unmount();

    render(<App />);
    expect(screen.getByRole("heading", { name: /ai-assisted contract review/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /reset demo/i })).toBeVisible();
  });
});
