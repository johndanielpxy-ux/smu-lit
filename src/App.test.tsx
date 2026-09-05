import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { resetDemo } from "./features/events/eventStore";

describe("App integration shell", () => {
  beforeEach(() => {
    resetDemo();
  });

  it("explains the product and exposes all four stages", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /turn pioneers into practice/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/synthetic demonstration/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /studio/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /episode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /rehearsal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /activation/i })).toBeInTheDocument();
  });

  it("compiles the canonical workflow and records a truthful event", async () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: /compile workflow/i }));

    expect(await screen.findByText("Workflow compiled")).toBeInTheDocument();
    expect(screen.getByText("use_case_compiled")).toBeInTheDocument();
  });

  it("resets observed events", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /compile workflow/i }));
    expect(await screen.findByText("use_case_compiled")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset demo/i }));
    expect(screen.queryByText("use_case_compiled")).not.toBeInTheDocument();
  });
});
