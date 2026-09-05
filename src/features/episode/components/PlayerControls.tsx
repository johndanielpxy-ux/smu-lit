import React from "react";
import type { EpisodeScene, PlaybackStatus } from "../types";

interface PlayerControlsProps {
  scenes: EpisodeScene[];
  currentSceneIndex: number;
  playbackStatus: PlaybackStatus;
  progressPercent: number;
  elapsedSeconds: number;
  totalDurationSeconds: number;
  captionsEnabled: boolean;
  isMuted: boolean;
  playbackSpeed: number;
  onTogglePlay: () => void;
  onSeekScene: (index: number) => void;
  onRewind: () => void;
  onToggleCaptions: () => void;
  onToggleMute: () => void;
  onChangeSpeed: () => void;
  onReplay: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  scenes,
  currentSceneIndex,
  playbackStatus,
  progressPercent,
  elapsedSeconds,
  totalDurationSeconds,
  captionsEnabled,
  isMuted,
  playbackSpeed,
  onTogglePlay,
  onSeekScene,
  onRewind,
  onToggleCaptions,
  onToggleMute,
  onChangeSpeed,
  onReplay,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const isPlaying = playbackStatus === "playing";

  return (
    <div className="player-controls-container" data-testid="player-controls">
      {/* Chapter Pills Header */}
      <div className="chapter-pills-bar">
        {scenes.map((scene, idx) => {
          const isActive = idx === currentSceneIndex;
          const isPassed = idx < currentSceneIndex;
          return (
            <button
              key={scene.id}
              className={`chapter-pill-btn ${isActive ? "active-pill" : ""} ${isPassed ? "passed-pill" : ""}`}
              onClick={() => onSeekScene(idx)}
              title={`Jump to Chapter ${scene.chapterNumber}: ${scene.chapterTitle}`}
              data-testid={`chapter-pill-${idx}`}
            >
              <span className="pill-dot"></span>
              <span className="pill-label">Ch {scene.chapterNumber}: {scene.chapterTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Progress Scrubber */}
      <div className="timeline-scrubber-wrapper">
        <div className="timeline-track">
          <div
            className="timeline-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            data-testid="timeline-progress-fill"
          ></div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="controls-action-row">
        <div className="left-controls">
          <button
            className="control-icon-btn main-play-btn"
            onClick={playbackStatus === "completed" ? onReplay : onTogglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            data-testid="play-pause-btn"
          >
            {isPlaying ? "⏸️" : playbackStatus === "completed" ? "🔄" : "▶️"}
          </button>

          <button
            className="control-icon-btn"
            onClick={onRewind}
            aria-label="Rewind 5 seconds"
            title="Rewind 5s"
            data-testid="rewind-btn"
          >
            ⏪ 5s
          </button>

          <div className="time-display" data-testid="time-display">
            <span className="time-current">{formatTime(elapsedSeconds)}</span>
            <span className="time-divider">/</span>
            <span className="time-total">{formatTime(totalDurationSeconds)}</span>
          </div>
        </div>

        <div className="right-controls">
          <button
            className={`control-text-btn ${captionsEnabled ? "active-setting" : ""}`}
            onClick={onToggleCaptions}
            aria-label="Toggle Subtitles and Captions"
            title="Captions (C)"
            data-testid="captions-toggle-btn"
          >
            💬 CC {captionsEnabled ? "ON" : "OFF"}
          </button>

          <button
            className={`control-icon-btn ${isMuted ? "muted-active" : ""}`}
            onClick={onToggleMute}
            aria-label={isMuted ? "Unmute Narration" : "Mute Narration"}
            title="Voice Narration (M)"
            data-testid="mute-toggle-btn"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          <button
            className="control-text-btn speed-btn"
            onClick={onChangeSpeed}
            aria-label={`Playback speed ${playbackSpeed}x`}
            title="Change Playback Speed"
            data-testid="speed-toggle-btn"
          >
            ⚡ {playbackSpeed}x
          </button>
        </div>
      </div>
    </div>
  );
};
