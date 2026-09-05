import { useCallback, useEffect, useRef, useState } from "react";

export interface NarrationRequest {
  narration: string;
  approvalFingerprint: string;
  voice: "marin" | "cedar";
  studioToken: string;
}

export async function requestNarration(
  input: NarrationRequest,
  fetcher: typeof fetch = fetch,
) {
  const response = await fetcher("/api/generation/voiceover", {
    method: "POST",
    headers: {
      authorization: `Bearer ${input.studioToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      narration: input.narration,
      approvalFingerprint: input.approvalFingerprint,
      voice: input.voice,
    }),
  });
  if (!response.ok) {
    throw new Error("Narration is unavailable. The episode will continue with captions.");
  }
  return response.blob();
}

export interface NarrationController {
  url?: string;
  busy: boolean;
  error?: string;
  generate(input: NarrationRequest): Promise<void>;
  clear(): void;
}

export function useNarration(fetcher: typeof fetch = fetch): NarrationController {
  const [url, setUrl] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const urlRef = useRef<string | undefined>(undefined);

  const generate = useCallback(async (input: NarrationRequest) => {
    setBusy(true);
    setError(undefined);
    try {
      const blob = await requestNarration(input, fetcher);
      const nextUrl = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = nextUrl;
      setUrl(nextUrl);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Narration is unavailable. The episode will continue with captions.");
    } finally {
      setBusy(false);
    }
  }, [fetcher]);

  const clear = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = undefined;
    setUrl(undefined);
    setError(undefined);
  }, []);

  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);

  return { url, busy, error, generate, clear };
}
