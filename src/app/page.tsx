"use client";

import { useState } from "react";
import VideoInput from "@/components/VideoInput";
import ChatInterface from "@/components/ChatInterface";

export default function Home() {
  const [videoProcessed, setVideoProcessed] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [transcript, setTranscript] = useState<any[]>([]);

  const handleVideoProcess = (videoInfo: any, transcript: any[]) => {
    console.log("Video processed:", videoInfo);
    console.log("Transcript:", transcript);
    setVideoInfo(videoInfo);
    setTranscript(transcript);
    setVideoProcessed(true);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Video Chat</h1>
      <VideoInput onVideoProcess={handleVideoProcess} />
      {videoProcessed && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Processed Video Information</h2>
          <p>
            <strong>Title:</strong> {videoInfo?.title}
          </p>
          <p>
            <strong>Description:</strong> {videoInfo?.description}
          </p>
          <p>
            <strong>Transcript Length:</strong> {transcript.length} segments
          </p>
        </div>
      )}
      {videoProcessed && <ChatInterface />}
    </main>
  );
}
