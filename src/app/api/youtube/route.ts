import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json(
      { error: "Video ID is required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key is not configured" },
      { status: 500 },
    );
  }

  try {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

    const response = await fetch(apiUrl, {
      headers: {
        Referer: "http://localhost:3000",
      },
    });

    if (!response.ok) {
      throw new Error(`YouTube API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const title = data.items[0].snippet.title;
      return NextResponse.json({ title });
    } else {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch video details",
        message: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
