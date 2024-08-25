"use client";

import React, { useState, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface Message {
  text: string;
  isUser: boolean;
}

const Form: React.FC<{
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}> = ({ onSubmit, inputProps, buttonProps }) => {
  return (
    <form
      onSubmit={onSubmit}
      className="relative m-auto flex items-center gap-4 justify-center w-full max-w-md"
    >
      <input
        {...inputProps}
        className={cn(
          "transition h-10 md:h-12 pl-4 pr-12 flex-1 rounded-xl",
          "border border-gray-400 text-base",
          "disabled:bg-gray-100",
          inputProps.className,
        )}
        type="text"
      />
      <button
        {...buttonProps}
        type="submit"
        tabIndex={-1}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2",
          "opacity-50 hover:opacity-100 transition-opacity",
          buttonProps.className,
        )}
      >
        {buttonProps.children || (
          <ArrowRight className="transform rotate-180" />
        )}
      </button>
    </form>
  );
};

const YouTubeChat: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const videoId = useRef<string>("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (youtubeRegex.test(videoUrl)) {
      const extractedId = extractVideoId(videoUrl);
      if (extractedId) {
        videoId.current = extractedId;
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

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      setMessages([...messages, { text: inputMessage, isUser: true }]);
      setInputMessage("");
      // Here we simulate an AI response. In a real application, AI integration would go here.
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
    <div className="flex flex-col h-screen">
      <div
        className={`transition-all duration-300 ${
          isChatOpen ? "h-16" : "h-screen"
        } flex items-center justify-center p-4`}
      >
        <Form
          onSubmit={handleSubmit}
          inputProps={{
            value: videoUrl,
            onChange: (e) => setVideoUrl(e.target.value),
            placeholder: "Enter YouTube video URL",
          }}
          buttonProps={{
            children: "Send",
          }}
        />
      </div>

      {isChatOpen && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${videoId.current}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <Alert
                  key={index}
                  className={msg.isUser ? "bg-blue-100" : "bg-gray-100"}
                >
                  <AlertDescription>{msg.text}</AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
          <div className="p-4 bg-white border-t">
            <Form
              onSubmit={handleChatSubmit}
              inputProps={{
                value: inputMessage,
                onChange: (e) => setInputMessage(e.target.value),
                placeholder: "Type your message...",
              }}
              buttonProps={{}}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeChat;
