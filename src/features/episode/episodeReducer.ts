import { cueStartSeconds, type EpisodeCue } from "./timeline";

export interface EpisodeState {
  status: "idle" | "playing" | "paused" | "checkpoint" | "complete";
  cueIndex: number;
  elapsedSeconds: number;
  answeredCheckpointIds: string[];
  lastAnswerSafe?: boolean;
}

export type EpisodeAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TICK" }
  | { type: "SEEK"; cueIndex: number }
  | { type: "ANSWER"; choiceId: string }
  | { type: "REPLAY" }
  | { type: "RESET" };

export function createInitialEpisodeState(): EpisodeState {
  return { status: "idle", cueIndex: 0, elapsedSeconds: 0, answeredCheckpointIds: [] };
}

function firstUnansweredCheckpoint(cues: EpisodeCue[], answered: string[]): number {
  return cues.findIndex((cue) => cue.checkpoint && !answered.includes(cue.checkpoint.id));
}

function cueAtElapsed(cues: EpisodeCue[], elapsed: number): number {
  let boundary = 0;
  for (let index = 0; index < cues.length; index += 1) {
    boundary += cues[index].durationSeconds;
    if (elapsed < boundary) return index;
  }
  return cues.length;
}

export function episodeReducer(state: EpisodeState, action: EpisodeAction, cues: EpisodeCue[]): EpisodeState {
  if (cues.length === 0) return state;
  switch (action.type) {
    case "PLAY":
      if (state.status === "complete" || state.status === "checkpoint") return state;
      return { ...state, status: "playing" };
    case "PAUSE":
      return state.status === "playing" ? { ...state, status: "paused" } : state;
    case "TICK": { 
      if (state.status !== "playing") return state;
      const elapsedSeconds = state.elapsedSeconds + 1;
      const cueIndex = cueAtElapsed(cues, elapsedSeconds);
      if (cueIndex >= cues.length) return { ...state, elapsedSeconds, cueIndex: cues.length - 1, status: "complete" };
      const cue = cues[cueIndex];
      const blocked = cue.checkpoint && !state.answeredCheckpointIds.includes(cue.checkpoint.id);
      return { ...state, elapsedSeconds, cueIndex, status: blocked ? "checkpoint" : "playing", lastAnswerSafe: undefined };
    }
    case "SEEK": {
      const requested = Math.max(0, Math.min(action.cueIndex, cues.length - 1));
      const gate = firstUnansweredCheckpoint(cues, state.answeredCheckpointIds);
      const cueIndex = gate >= 0 && requested >= gate ? gate : requested;
      const cue = cues[cueIndex];
      const checkpoint = cue.checkpoint && !state.answeredCheckpointIds.includes(cue.checkpoint.id);
      return { ...state, cueIndex, elapsedSeconds: cueStartSeconds(cues, cueIndex), status: checkpoint ? "checkpoint" : "paused", lastAnswerSafe: undefined };
    }
    case "ANSWER": {
      const checkpoint = cues[state.cueIndex]?.checkpoint;
      if (!checkpoint || state.status !== "checkpoint") return state;
      const choice = checkpoint.choices.find((item) => item.id === action.choiceId);
      if (!choice) return state;
      if (!choice.safe) return { ...state, lastAnswerSafe: false };
      return { ...state, status: "playing", answeredCheckpointIds: [...new Set([...state.answeredCheckpointIds, checkpoint.id])], lastAnswerSafe: undefined };
    }
    case "REPLAY":
      return { ...createInitialEpisodeState(), status: "playing" };
    case "RESET":
      return createInitialEpisodeState();
  }
}
