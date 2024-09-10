import { useState } from "react";

interface VideoInputProps {
  onVideoProcess: (videoInfo: any, transcript: any[]) => void;
}

export default function VideoInput({ onVideoProcess }: VideoInputProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoUrl) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.error) {
        throw new Error(data.error);
      }
      if (!data.videoInfo || !data.transcript) {
        throw new Error("Invalid response from server");
      }
      onVideoProcess(data.videoInfo, data.transcript);
    } catch (error) {
      console.error("Error processing video:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube video URL"
        className="w-full p-2 border rounded"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="mt-2 w-full p-2 bg-blue-500 text-white rounded"
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Process Video"}
      </button>
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </form>
  );
}
