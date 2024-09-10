import { YoutubeTranscript } from "youtube-transcript";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export async function getTranscript(
  videoId: string,
): Promise<TranscriptSegment[]> {
  console.log("Fetching transcript for video ID:", videoId);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(
      "Transcript (first 3 items):",
      JSON.stringify(transcript.slice(0, 3), null, 2),
      "...",
    );

    if (!Array.isArray(transcript) || transcript.length === 0) {
      throw new Error("Invalid or empty transcript data received");
    }

    return transcript.map((item) => ({
      text: item.text,
      start: item.start,
      duration: item.duration,
    }));
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw new Error(
      `Failed to fetch transcript: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
