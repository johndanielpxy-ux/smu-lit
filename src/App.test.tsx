import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { resetDemo } from "./features/events/eventStore";

beforeEach(() => { resetDemo(); window.localStorage.clear(); });

async function publish() {
  fireEvent.click(screen.getByRole("button", { name: /load synthetic demo pack/i }));
  expect(await screen.findByText(/draft ready for named approval/i)).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));
  fireEvent.click(screen.getByRole("button", { name: /publish learning module/i }));
  expect(screen.getByText(/ready to learn the workflow/i)).toBeVisible();
}

describe("LAWFLO application", () => {
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
    for (const label of ["Contract value", "Template version", "Personal data processing", "Governing law"]) {
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^open ${label}$`, "i") }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^confirm ${label}$`, "i") }));
    }
    fireEvent.click(screen.getByRole("button", { name: /^open material standard-term change$/i }));
    fireEvent.click(screen.getByRole("button", { name: /^correct material standard-term change$/i }));
    fireEvent.click(screen.getByRole("button", { name: /compare liability clause/i }));
    fireEvent.click(screen.getByRole("button", { name: /open material standard-term changes require legal review/i }));
    fireEvent.click(screen.getByRole("button", { name: /choose legal review/i }));
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
});
