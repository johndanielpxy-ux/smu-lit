export interface EpisodeMediaSegment {
  id: string;
  src: string;
  title: string;
}

export interface EpisodeMediaManifest {
  label: "Prepared demo render";
  segments: [EpisodeMediaSegment, EpisodeMediaSegment];
  checkpointAfterSegment: 0;
}

export const preparedEpisodeMedia: EpisodeMediaManifest = {
  label: "Prepared demo render",
  checkpointAfterSegment: 0,
  segments: [
    { id: "review-the-renewal", src: "/media/demo/lawflo-review-the-renewal.mp4", title: "Review the renewal" },
    { id: "explain-the-route", src: "/media/demo/lawflo-explain-the-route.mp4", title: "Explain the safe route" },
  ],
};
