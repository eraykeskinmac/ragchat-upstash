import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo, getVideoIdFromUrl } from "@/lib/youtubeApi";
import { getTranscript } from "@/lib/transcript";
import { RagChatService } from "@/lib/rag-chat";

const ragChatService = new RagChatService();

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    if (body.videoUrl) {
      console.log("Processing video URL:", body.videoUrl);
      const videoId = getVideoIdFromUrl(body.videoUrl);
      console.log("Extracted Video ID:", videoId);

      const [videoInfo, transcript] = await Promise.all([
        getVideoInfo(videoId),
        getTranscript(videoId),
      ]);
      console.log("Video Info:", JSON.stringify(videoInfo, null, 2));
      console.log(
        "Transcript (first 3 items):",
        JSON.stringify(transcript.slice(0, 3), null, 2),
      );

      await ragChatService.addContext(videoId, videoInfo, transcript);
      console.log("Context added to RAGChat successfully");

      return NextResponse.json({
        message: "Video processed successfully",
        videoInfo,
        transcript: transcript.slice(0, 5),
      });
    } else if (body.message) {
      console.log("Received chat message:", body.message);
      const response = await ragChatService.chat(body.message);
      console.log("Chat response:", response);
      return NextResponse.json({ response: response.output });
    } else {
      console.error("Invalid request body:", body);
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
  } catch (error) {
    console.error("Unhandled error in API route:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
