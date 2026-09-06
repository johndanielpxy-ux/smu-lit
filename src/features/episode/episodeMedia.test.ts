import { describe, expect, it } from "vitest";
import { preparedEpisodeMedia } from "./episodeMedia";

describe("prepared episode media manifest", () => {
  it("uses four source-linked instructional chapters with the checkpoint after evidence verification", () => {
    expect(preparedEpisodeMedia.segments.map((segment) => segment.id)).toEqual([
      "ai-review",
      "verify-evidence",
      "learner-decision",
      "safe-route",
    ]);
    expect(preparedEpisodeMedia.segments).toHaveLength(4);
    expect(preparedEpisodeMedia.checkpointAfterSegment).toBe(1);
    expect(preparedEpisodeMedia.segments.reduce((total, segment) => total + segment.durationSeconds, 0)).toBe(60);
    for (const segment of preparedEpisodeMedia.segments) {
      expect(segment.videoSrc).toMatch(/^\/media\/demo\/[^/]+\.mp4$/);
      expect(segment.audioSrc).toMatch(/^\/media\/demo\/[^/]+\.mp3$/);
      expect(segment.sourceRefIds.length).toBeGreaterThan(0);
      expect(segment.overlayBeats[0]?.atSeconds).toBe(0);
    }
  });
});
