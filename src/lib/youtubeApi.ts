import { google } from "googleapis";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function getVideoInfo(videoId: string) {
  console.log("Fetching video info for ID:", videoId);
  try {
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [videoId],
    });

    console.log(
      "YouTube API response:",
      JSON.stringify(response.data, null, 2),
    );

    const videoInfo = response.data.items?.[0];
    if (!videoInfo) {
      throw new Error("Video not found");
    }

    return {
      title: videoInfo.snippet?.title,
      description: videoInfo.snippet?.description,
      duration: videoInfo.contentDetails?.duration,
    };
  } catch (error) {
    console.error("Error fetching video info:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to fetch video info: ${error.message}`);
    }
    throw new Error("Failed to fetch video info");
  }
}

export function getVideoIdFromUrl(url: string): string {
  console.log("Extracting video ID from URL:", url);
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/;
  const match = url.match(regex);
  if (match && match[1]) {
    console.log("Extracted video ID:", match[1]);
    return match[1];
  }
  throw new Error("Invalid YouTube URL");
}
