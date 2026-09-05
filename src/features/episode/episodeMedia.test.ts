import { describe, expect, it } from "vitest";
import { preparedEpisodeMedia } from "./episodeMedia";

describe("prepared episode media manifest", () => {
  it("uses two durable local segments with the learner checkpoint between them", () => {
    expect(preparedEpisodeMedia.segments).toHaveLength(2);
    expect(preparedEpisodeMedia.checkpointAfterSegment).toBe(0);
    for (const segment of preparedEpisodeMedia.segments) {
      expect(segment.src).toMatch(/^\/media\/demo\/[^/]+\.mp4$/);
      expect(segment.src).not.toMatch(/^https?:/);
    }
  });
});
