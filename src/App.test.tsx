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

  it("requires an explicit approval before generating learning artefacts", async () => {
    render(<App />);

    const generate = screen.getByRole("button", {
      name: /generate learning bundle/i,
    });
    expect(generate).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /prepare draft/i }));
    expect(await screen.findByText("Draft ready for approval")).toBeInTheDocument();
    expect(generate).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));
    expect(screen.getByText("human_approved")).toBeInTheDocument();
    expect(generate).toBeEnabled();

    fireEvent.click(generate);

    expect(screen.getByText("Learning bundle generated")).toBeInTheDocument();
    expect(screen.getByText("use_case_compiled")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /evidence chain/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bundle compilation observed/i)).toBeInTheDocument();
  });

  it("records human approval only after the named approval action", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /prepare draft/i }));
    expect(await screen.findByText("Draft ready for approval")).toBeInTheDocument();
    expect(screen.queryByText("human_approved")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));

    expect(screen.getByText("human_approved")).toBeInTheDocument();
  });

  it("resets approval, bundle and observed events", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /prepare draft/i }));
    expect(await screen.findByText("Draft ready for approval")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /approve exact version/i }));
    fireEvent.click(
      screen.getByRole("button", { name: /generate learning bundle/i }),
    );
    expect(screen.getByText("use_case_compiled")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset demo/i }));
    expect(screen.queryByText("use_case_compiled")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /evidence chain/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /generate learning bundle/i }),
    ).toBeDisabled();
  });
});
