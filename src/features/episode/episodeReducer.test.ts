import { describe, expect, it } from "vitest";
import type { EpisodeCue } from "./timeline";
import { createInitialEpisodeState, episodeReducer, type EpisodeState } from "./episodeReducer";

const cues: EpisodeCue[] = [
  { id: "one", chapter: 1, title: "One", durationSeconds: 2, narration: "", caption: "", visual: "portrait", sourceRefIds: ["s1"] },
  {
    id: "gate", chapter: 2, title: "Gate", durationSeconds: 2, narration: "", caption: "", visual: "routing", sourceRefIds: ["s2"],
    checkpoint: { id: "gate-check", prompt: "Route?", safeChoiceId: "safe", sourceRefIds: ["s2"], choices: [{ id: "unsafe", label: "Business", safe: false }, { id: "safe", label: "Legal", safe: true }] },
  },
  { id: "end", chapter: 3, title: "End", durationSeconds: 1, narration: "", caption: "", visual: "contract", sourceRefIds: ["s3"] },
];

describe("episodeReducer", () => {
  it("plays, pauses and enters an unanswered checkpoint", () => {
    let state = episodeReducer(createInitialEpisodeState(), { type: "PLAY" }, cues);
    state = episodeReducer(state, { type: "TICK" }, cues);
    state = episodeReducer(state, { type: "PAUSE" }, cues);
    expect(state.status).toBe("paused");
    state = episodeReducer(state, { type: "PLAY" }, cues);
    state = episodeReducer(state, { type: "TICK" }, cues);
    expect(state).toMatchObject({ status: "checkpoint", cueIndex: 1, elapsedSeconds: 2 });
  });

  it("blocks seek past a checkpoint and requires a safe repair", () => {
    let state = episodeReducer(createInitialEpisodeState(), { type: "SEEK", cueIndex: 2 }, cues);
    expect(state).toMatchObject({ status: "checkpoint", cueIndex: 1 });
    state = episodeReducer(state, { type: "ANSWER", choiceId: "unsafe" }, cues);
    expect(state.answeredCheckpointIds).toEqual([]);
    expect(state.lastAnswerSafe).toBe(false);
    state = episodeReducer(state, { type: "ANSWER", choiceId: "safe" }, cues);
    expect(state.answeredCheckpointIds).toEqual(["gate-check"]);
    expect(state.status).toBe("playing");
  });

  it("completes and can replay from the beginning", () => {
    let state: EpisodeState = { ...createInitialEpisodeState(), status: "playing", cueIndex: 2, elapsedSeconds: 4, answeredCheckpointIds: ["gate-check"] };
    state = episodeReducer(state, { type: "TICK" }, cues);
    expect(state.status).toBe("complete");
    state = episodeReducer(state, { type: "REPLAY" }, cues);
    expect(state).toMatchObject({ status: "playing", cueIndex: 0, elapsedSeconds: 0, answeredCheckpointIds: [] });
  });
});
