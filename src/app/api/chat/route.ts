import { NextRequest, NextResponse } from "next/server";
import { getVideoInfo, getVideoIdFromUrl } from "@/lib/youtubeApi";
import { getTranscript } from "@/lib/transcript";
import { RagChatService } from "@/lib/rag-chat";

const ragChatService = new RagChatService();

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    if (body.videoUrl) {
      const videoId = getVideoIdFromUrl(body.videoUrl);
      const [videoInfo, transcript] = await Promise.all([
        getVideoInfo(videoId),
        getTranscript(videoId),
      ]);

      const summary = await ragChatService.addContext(videoId, videoInfo, transcript);

      return NextResponse.json({
        message: "Video processed successfully",
        videoInfo: { ...videoInfo, id: videoId },
        transcript: transcript.slice(0, 5), // Sending only a preview
        summary,
      });
    } else if (body.message && body.videoId) {
      const response = await ragChatService.chat(body.message, body.videoId);
      return NextResponse.json({ response: response.output });
    } else {
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