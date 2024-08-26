"use client";

import React, { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Form from "@/components/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  text: string;
  isUser: boolean;
}

const YouTubeChat: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [videoTitle, setVideoTitle] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const videoId = useRef<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (youtubeRegex.test(videoUrl)) {
      const extractedId = extractVideoId(videoUrl);
      if (extractedId) {
        videoId.current = extractedId;
        await fetchVideoDetails(extractedId);
        setIsChatOpen(true);
      } else {
        alert("Invalid YouTube URL. Please try again.");
      }
    } else {
      alert("Please enter a valid YouTube URL.");
    }
  };

  const extractVideoId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const fetchVideoDetails = async (videoId: string) => {
    try {
      const response = await fetch(`/api/youtube?videoId=${videoId}`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVideoTitle(data.title || "Unable to fetch video title");
      setSummary(data.summary || "Summary not available");
      setTranscript(data.transcript || "Transcript not available");
    } catch (error) {
      setVideoTitle("Unable to fetch video details");
      setSummary("Summary not available");
      setTranscript("Transcript not available");
    }
  };

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, isUser: true }]);
      setInputMessage("");
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            text: "What would you like to know about this video?",
            isUser: false,
          },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <header className="text-center py-4">
        <h1 className="text-4xl font-bold mb-4">AI YouTube Summarizer</h1>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 mb-8 mt-4">
          <Form
            onSubmit={handleSubmit}
            inputProps={{
              value: videoUrl,
              onChange: (e) => setVideoUrl(e.target.value),
              placeholder: "Enter YouTube video URL",
            }}
            buttonProps={{}}
          />
        </div>
        {!isChatOpen ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-card text-card-foreground rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-semibold mb-4 text-center">
                Welcome to AI YouTube Summarizer
              </h2>
              <p className="text-xl mb-6 text-center">
                Enter a YouTube URL above to get started with AI-powered video
                summarization and analysis.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden p-4 bg-card rounded-t-3xl">
            <h2 className="text-2xl w-full font-bold mb-4">{videoTitle}</h2>
            <div className="flex flex-row flex-1 mb-4 space-x-4 overflow-hidden">
              <div className="w-2/5 h-full">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId.current}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full rounded-lg shadow-lg"
                ></iframe>
              </div>
              <div className="w-3/5 flex flex-col overflow-hidden">
                <Tabs
                  defaultValue="chat"
                  className="w-full h-full flex flex-col"
                >
                  <TabsList className="mb-4">
                    <TabsTrigger value="summarize">Summarize</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-hidden">
                    <TabsContent
                      value="summarize"
                      className="h-full overflow-y-auto bg-muted rounded-lg p-4 shadow-inner"
                    >
                      <p>{summary}</p>
                    </TabsContent>
                    <TabsContent
                      value="transcript"
                      className="h-full overflow-y-auto bg-muted rounded-lg p-4 shadow-inner"
                    >
                      <p>{transcript}</p>
                    </TabsContent>
                    <TabsContent value="chat" className="h-full flex flex-col">
                      <div className="flex-1 overflow-y-auto mb-4 bg-muted rounded-lg p-4 shadow-inner">
                        <div className="space-y-4">
                          {messages.map((msg, index) => (
                            <Alert
                              key={index}
                              className={`${
                                msg.isUser
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-secondary text-secondary-foreground"
                              } shadow-sm`}
                            >
                              <AlertDescription>{msg.text}</AlertDescription>
                            </Alert>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                      <div className="m-4">
                        <Form
                          onSubmit={handleChatSubmit}
                          inputProps={{
                            value: inputMessage,
                            onChange: (e) => setInputMessage(e.target.value),
                            placeholder: "Type your message...",
                          }}
                          buttonProps={{
                            className:
                              "bg-primary text-primary-foreground hover:bg-primary/90 w-10 h-10 flex items-center justify-center ring-offset-background p-2",
                          }}
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default YouTubeChat;
