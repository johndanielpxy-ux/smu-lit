export interface EpisodeMediaSegment {
  id: string;
  src: string;
  title: string;
  narration: string;
  caption: string;
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
    { id: "review-the-renewal", src: "/media/demo/lawflo-review-the-renewal.mp4", title: "Review the renewal", narration: "Legal AI extracts the renewal value and reports no material redline. But its output is only a draft. Open the submitted liability clause and compare it with the approved standard before routing the matter.", caption: "AI says no material redline. Maya checks the liability clause before relying on it." },
    { id: "explain-the-route", src: "/media/demo/lawflo-explain-the-route.mp4", title: "Explain the safe route", narration: "The liability cap has been replaced with unlimited liability. That material change overrides the low-value shortcut, so Maya routes the renewal to legal review with the supporting rule attached.", caption: "Unlimited liability is a material change. Route to legal review with the rule attached." },
  ],
};
