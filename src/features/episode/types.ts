import type { UseCase, MatterShiftEvent } from "../../domain/mattershift";

export interface EpisodeCheckpointOption {
  id: string;
  label: string;
  safe: boolean;
  explanation: string;
  sourceRefId: string;
}

export interface EpisodeCheckpoint {
  question: string;
  subtitle: string;
  options: EpisodeCheckpointOption[];
}

export interface EpisodeScene {
  id: string;
  chapterNumber: number;
  chapterTitle: string;
  durationSeconds: number;
  narration: string;
  caption: string;
  visualType: "old_way" | "discovery" | "workflow_step" | "risk_checkpoint" | "payoff";
  headline: string;
  subheadline: string;
  sourceRefIds: string[];
  toolsInvolved: string[];
  checkpoint?: EpisodeCheckpoint;
}

export interface EpisodePlayerProps {
  useCase: UseCase;
  onEvent?: (event: Omit<MatterShiftEvent, "id" | "occurredAt">) => void;
  onComplete: () => void;
  autoplay?: boolean;
}

export type PlaybackStatus = "idle" | "playing" | "paused" | "checkpoint" | "completed";
