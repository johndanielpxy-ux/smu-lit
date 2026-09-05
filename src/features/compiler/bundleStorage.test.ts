import { beforeEach, describe, expect, it } from "vitest";
import { approveUseCase } from "../../domain/approval";
import { contractTrainingContent } from "../../demo/contractScenarios";
import { demoUseCase } from "../../demo/demoUseCase";
import { compileApprovedTrainingModule } from "./bundleCompiler";
import {
  clearPublishedBundle,
  loadPublishedBundle,
  savePublishedBundle,
} from "./bundleStorage";

const bundle = compileApprovedTrainingModule(
  approveUseCase(demoUseCase, "Jordan Lee", "2026-09-05T04:00:00.000Z"),
  contractTrainingContent,
);

beforeEach(() => window.localStorage.clear());

describe("published bundle storage", () => {
  it("restores the exact approved bundle", () => {
    savePublishedBundle(bundle);
    expect(loadPublishedBundle()).toEqual(bundle);
  });

  it("rejects corrupt state and clears it", () => {
    window.localStorage.setItem("lawflo.published-bundle.v1", "{\"manifest\":{}}");
    expect(loadPublishedBundle()).toBeUndefined();
    expect(window.localStorage.getItem("lawflo.published-bundle.v1")).toBeNull();
  });

  it("clears the published bundle during reset", () => {
    savePublishedBundle(bundle);
    clearPublishedBundle();
    expect(loadPublishedBundle()).toBeUndefined();
  });
});
