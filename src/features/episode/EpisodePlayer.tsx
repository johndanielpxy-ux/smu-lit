import React, { useState, useEffect, useRef, useCallback } from "react";
import type { EpisodePlayerProps, PlaybackStatus, EpisodeCheckpointOption } from "./types";
import { generateStoryboard } from "./storyboard";
import { SceneVisual } from "./components/SceneVisual";
import { CheckpointOverlay } from "./components/CheckpointOverlay";
import { PlayerControls } from "./components/PlayerControls";
import { CompletionCard } from "./components/CompletionCard";

export const EpisodePlayer: React.FC<EpisodePlayerProps> = ({
  useCase,
  onEvent,
  onComplete,
  autoplay = false,
}) => {
  const scenes = React.useMemo(() => generateStoryboard(useCase), [useCase]);
  const totalDuration = React.useMemo(
    () => scenes.reduce((acc, s) => acc + s.durationSeconds, 0),
    [scenes]
  );

  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>(
    autoplay ? "playing" : "idle"
  );
  const [sceneElapsedSeconds, setSceneElapsedSeconds] = useState(0);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [hasStartedRecorded, setHasStartedRecorded] = useState(false);
  const [checkpointPassed, setCheckpointPassed] = useState(false);

  const currentScene = scenes[currentSceneIndex];

  // Speech synthesis narration helper
  const speakNarration = useCallback(
    (text: string) => {
      if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackSpeed;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Silently ignore speech synthesis errors in test environments
      }
    },
    [isMuted, playbackSpeed]
  );

  // Record episode_started event exactly once
  const startPlayback = () => {
    if (!hasStartedRecorded) {
      setHasStartedRecorded(true);
      onEvent?.({
        useCaseId: useCase.id,
        type: "episode_started",
        metadata: {
          title: useCase.title,
          contributor: useCase.contributorName,
          totalDurationSeconds: totalDuration,
        },
      });
    }
    setPlaybackStatus("playing");
    speakNarration(currentScene.narration);
  };

  // Compute total elapsed seconds across previous scenes plus current scene
  const previousScenesDuration = scenes
    .slice(0, currentSceneIndex)
    .reduce((acc, s) => acc + s.durationSeconds, 0);
  const totalElapsedSeconds = previousScenesDuration + sceneElapsedSeconds;
  const progressPercent = (totalElapsedSeconds / totalDuration) * 100;

  // Playback timer tick
  useEffect(() => {
    if (playbackStatus !== "playing") {
      return;
    }

    const intervalMs = 1000 / playbackSpeed;
    const timer = setInterval(() => {
      setSceneElapsedSeconds((prev) => {
        const next = prev + 1;

        // Check if current scene has reached its checkpoint
        if (
          currentScene.checkpoint &&
          !checkpointPassed &&
          next >= Math.floor(currentScene.durationSeconds * 0.4)
        ) {
          setPlaybackStatus("checkpoint");
          return next;
        }

        // Advance to next scene if current scene ended
        if (next >= currentScene.durationSeconds) {
          if (currentSceneIndex < scenes.length - 1) {
            const nextIdx = currentSceneIndex + 1;
            setCurrentSceneIndex(nextIdx);
            speakNarration(scenes[nextIdx].narration);
            return 0;
          } else {
            // Completed all scenes
            setPlaybackStatus("completed");
            return currentScene.durationSeconds;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    playbackStatus,
    currentScene,
    currentSceneIndex,
    scenes,
    checkpointPassed,
    playbackSpeed,
    speakNarration,
  ]);

  // Handle checkpoint answer
  const handleCheckpointAnswer = (option: EpisodeCheckpointOption) => {
    onEvent?.({
      useCaseId: useCase.id,
      type: "checkpoint_answered",
      metadata: {
        sceneId: currentScene.id,
        optionId: option.id,
        safe: option.safe,
        explanation: option.explanation,
      },
    });

    if (option.safe) {
      setCheckpointPassed(true);
    }
  };

  const handleCheckpointContinue = () => {
    setPlaybackStatus("playing");
    speakNarration(currentScene.narration);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playbackStatus === "checkpoint") return;

      if (e.code === "Space") {
        e.preventDefault();
        setPlaybackStatus((prev) => (prev === "playing" ? "paused" : "playing"));
      } else if (e.key === "c" || e.key === "C") {
        setCaptionsEnabled((prev) => !prev);
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => {
          const next = !prev;
          if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playbackStatus]);

  const handleSeekScene = (index: number) => {
    if (index >= 0 && index < scenes.length) {
      setCurrentSceneIndex(index);
      setSceneElapsedSeconds(0);
      if (playbackStatus === "idle" || playbackStatus === "completed") {
        setPlaybackStatus("playing");
      }
      speakNarration(scenes[index].narration);
    }
  };

  const handleRewind = () => {
    setSceneElapsedSeconds((prev) => Math.max(0, prev - 5));
  };

  const handleChangeSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleReplay = () => {
    setCurrentSceneIndex(0);
    setSceneElapsedSeconds(0);
    setCheckpointPassed(false);
    setPlaybackStatus("playing");
    speakNarration(scenes[0].narration);
  };

  return (
    <div className="neuroflix-episode-player-root" data-testid="episode-player">
      {/* Top Meta Bar */}
      <header className="episode-meta-bar">
        <div className="meta-left">
          <span className="brand-tag">MATTERSHIFT CINEMATIC</span>
          <span className="meta-divider">·</span>
          <span className="meta-contributor">Lead: {useCase.contributorName}</span>
          <span className="meta-divider">·</span>
          <span className="meta-practice">{useCase.practiceGroup}</span>
        </div>
        <div className="meta-right">
          <span className="governance-badge">🔒 Governed SOP v{useCase.sourceVersion}</span>
        </div>
      </header>

      {/* Main Screen Viewport */}
      <div className="episode-screen-stage">
        {playbackStatus === "idle" && (
          <div className="episode-title-screen glass-panel-elevated" data-testid="episode-title-screen">
            <div className="title-banner-pill">FEATURED WORKFLOW EPISODE</div>
            <h1 className="title-screen-heading">{useCase.title}</h1>
            <p className="title-screen-synopsis">{useCase.problem}</p>

            <div className="title-meta-grid">
              <div className="title-meta-item">
                <span className="item-label">Legal Engineer:</span>
                <span className="item-value">{useCase.contributorName}</span>
              </div>
              <div className="title-meta-item">
                <span className="item-label">Duration:</span>
                <span className="item-value">~{Math.round(totalDuration / 60)} mins ({totalDuration}s)</span>
              </div>
              <div className="title-meta-item">
                <span className="item-label">Tools Mastered:</span>
                <span className="item-value">{useCase.approvedTools.join(", ")}</span>
              </div>
            </div>

            <button
              className="btn-primary start-episode-btn"
              onClick={startPlayback}
              data-testid="start-episode-btn"
            >
              ▶ Watch Episode ({totalDuration}s)
            </button>
          </div>
        )}

        {playbackStatus !== "idle" && playbackStatus !== "completed" && (
          <div className="active-scene-viewport">
            <div className="scene-header-overlay">
              <span className="scene-chapter-badge">
                CHAPTER {currentScene.chapterNumber}: {currentScene.chapterTitle.toUpperCase()}
              </span>
              <h2 className="scene-headline">{currentScene.headline}</h2>
              <p className="scene-subheadline">{currentScene.subheadline}</p>
            </div>

            <SceneVisual scene={currentScene} useCase={useCase} />

            {/* Subtitles & Captions Overlay */}
            {captionsEnabled && (
              <div className="captions-container" data-testid="captions-container">
                <p className="caption-text">{currentScene.caption}</p>
              </div>
            )}

            {/* In-Video Checkpoint Interruption */}
            {playbackStatus === "checkpoint" && currentScene.checkpoint && (
              <CheckpointOverlay
                checkpoint={currentScene.checkpoint}
                useCase={useCase}
                onAnswer={handleCheckpointAnswer}
                onContinue={handleCheckpointContinue}
              />
            )}
          </div>
        )}

        {playbackStatus === "completed" && (
          <CompletionCard
            useCase={useCase}
            onComplete={onComplete}
            onReplay={handleReplay}
          />
        )}
      </div>

      {/* Persistent Bottom Controls */}
      {playbackStatus !== "idle" && (
        <PlayerControls
          scenes={scenes}
          currentSceneIndex={currentSceneIndex}
          playbackStatus={playbackStatus}
          progressPercent={progressPercent}
          elapsedSeconds={totalElapsedSeconds}
          totalDurationSeconds={totalDuration}
          captionsEnabled={captionsEnabled}
          isMuted={isMuted}
          playbackSpeed={playbackSpeed}
          onTogglePlay={() =>
            setPlaybackStatus((prev) => (prev === "playing" ? "paused" : "playing"))
          }
          onSeekScene={handleSeekScene}
          onRewind={handleRewind}
          onToggleCaptions={() => setCaptionsEnabled((prev) => !prev)}
          onToggleMute={() => {
            setIsMuted((prev) => {
              const next = !prev;
              if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              return next;
            });
          }}
          onChangeSpeed={handleChangeSpeed}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
};
