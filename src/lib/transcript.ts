import { YoutubeTranscript } from "youtube-transcript";
import { getVideoInfo } from "./youtubeApi";

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

export async function getTranscript(
  videoId: string
): Promise<TranscriptSegment[]> {
  console.log("Fetching transcript for video ID:", videoId);
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(
      "Transcript (first 3 items):",
      JSON.stringify(transcript.slice(0, 3), null, 2),
      "..."
    );
    return transcript.map((item) => ({
      text: item.text,
      start: item.start,
      duration: item.duration,
    }));
  } catch (error) {
    console.warn("Error fetching transcript:", error);
    console.log("Falling back to video metadata...");

    // Fallback to video metadata
    const videoInfo = await getVideoInfo(videoId);
    const fallbackTranscript: TranscriptSegment[] = [
      {
        text: `Title: ${videoInfo.title}\nDescription: ${videoInfo.description}`,
        start: 0,
        duration: 0,
      },
    ];
    return fallbackTranscript;
  }
}