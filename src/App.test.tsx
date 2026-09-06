import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { resetDemo } from "./features/events/eventStore";

beforeEach(() => {
  vi.unstubAllGlobals();
  resetDemo();
  window.localStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});

function renderApp() {
  return render(<App productionStepDurationMs={1} />);
}

function enterStudio() {
  fireEvent.click(screen.getByRole("button", { name: /enter lawflo/i }));
  fireEvent.click(screen.getByRole("button", { name: /legal engineer/i }));
}

async function publish() {
  if (screen.queryByRole("button", { name: /enter lawflo/i })) enterStudio();
  fireEvent.click(screen.getByRole("button", { name: /use prepared source pack/i }));
  expect(await screen.findByText(/5 sources ready/i)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /create episode/i }));
  expect(await screen.findByRole("heading", { name: /creating your learning episode/i })).toBeVisible();
  fireEvent.click(await screen.findByRole("button", { name: /approve and publish/i }));
  expect(screen.getByRole("heading", { name: /your episode is ready for learners/i })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /view as learner/i }));
  expect(screen.getByText(/ready to learn the workflow/i)).toBeVisible();
}

function verifyFinding(label: string, clauseLabel: RegExp, choice: RegExp) {
  fireEvent.click(screen.getByRole("button", { name: new RegExp(`^open ${label}$`, "i") }));
  fireEvent.click(screen.getByRole("button", { name: clauseLabel }));
  fireEvent.click(screen.getByRole("button", { name: choice }));
}

describe("LAWFLO application", () => {
  it("opens with one clear action before asking the user to choose a role", () => {
    renderApp();
    expect(screen.getByRole("heading", { name: /turn firm knowledge into safer practice/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /enter lawflo/i })).toBeVisible();
    expect(screen.queryByText(/approved workflow sources/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publish learning module/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/one governed learning loop/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /enter lawflo/i }));
    expect(screen.getByRole("heading", { name: /how will you use lawflo today/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /legal engineer/i }));
    expect(screen.getByText(/legal engineer studio/i)).toBeVisible();
  });

  it("keeps generation and publication out of sight until the sources are ready", async () => {
    renderApp();
    enterStudio();
    expect(screen.getByRole("button", { name: /create episode/i })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /approve and publish/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /use prepared source pack/i }));
    expect(screen.getByRole("button", { name: /create episode/i })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: /create episode/i }));
    expect(await screen.findByRole("heading", { name: /creating your learning episode/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /approve and publish/i })).not.toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /approve and publish/i })).toBeVisible();
  });

  it("publishes and enters the complete legal AI learning journey", async () => {
    renderApp();
    expect(screen.queryByText(/Ananya|Krishiv|Su-Ann/i)).not.toBeInTheDocument();
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /watch episode/i }));
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    fireEvent.click(screen.getByRole("button", { name: /escalate to legal review/i }));
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    fireEvent.ended(screen.getByTitle(/prepared training episode/i));
    fireEvent.click(screen.getByRole("button", { name: /start guided rehearsal/i }));
    expect(screen.getByRole("heading", { level: 1, name: /northstar analytics sales renewal/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /open northstar matter/i }));
    fireEvent.click(screen.getByRole("button", { name: /run ai review/i }));
    verifyFinding("Material standard-term change", /compare liability clause/i, /material redline detected/i);
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm legal review route/i }));
    fireEvent.click(screen.getByRole("button", { name: /inspect audit trail/i }));
    expect(screen.getByRole("heading", { name: /your review, translated into practice/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /open workflow guide/i }));
    expect(screen.getByRole("heading", { name: /your sales-renewal legal ai workflow guide/i })).toBeVisible();
  });

  it("describes the complete published learning loop from the episode manifest", async () => {
    renderApp();
    await publish();

    expect(screen.getByText(/4 chapters · one decision · one guided rehearsal/i)).toBeVisible();
    expect(screen.queryByText(/two cinematic scenes/i)).not.toBeInTheDocument();
  });

  it("enforces approval before publication and fully resets", async () => {
    renderApp();
    enterStudio();
    expect(screen.getByRole("button", { name: /create episode/i })).toBeDisabled();
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /reset demo/i }));
    expect(screen.getByRole("heading", { name: /turn firm knowledge into safer practice/i })).toBeVisible();
    expect(screen.queryByRole("button", { name: /create episode/i })).not.toBeInTheDocument();
  });

  it("keeps governance evidence inspectable but subordinate", async () => {
    renderApp();
    await publish();
    expect(screen.queryByRole("heading", { name: /evidence chain/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /how this is governed/i }));
    expect(screen.getByRole("heading", { name: /evidence chain/i })).toBeVisible();
    expect(screen.getByText(/module_published/i)).toBeVisible();
  });

  it("restores a published journey after a browser refresh", async () => {
    const first = renderApp();
    await publish();
    fireEvent.click(screen.getByRole("button", { name: /watch episode/i }));
    first.unmount();

    renderApp();
    expect(screen.getByRole("button", { name: /explore learner training/i })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /explore learner training/i }));
    expect(screen.getByRole("heading", { name: /ai-assisted contract review/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /reset demo/i })).toBeVisible();
  });
});
