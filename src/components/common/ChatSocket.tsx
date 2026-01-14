"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ChatService, getSavedResumeUrl } from "@/services/chat.service";

interface ChatURL {
  url: string;
}
export function useResumeEndpoint(enabled = true) {
  return useQuery<ChatURL>({
    queryKey: ["chat", "resume-endpoint"],
    queryFn: () => ChatService.getResumeEndpoint(),
    staleTime: Infinity,
  });
}

export default function ChatSocket({ className = "" }: { className?: string }) {
  // hook will use saved value if present and fetch otherwise
  const { data, isLoading, error } = useResumeEndpoint();

  const saved = getSavedResumeUrl();
  const url = saved ?? data?.url ?? "";

  return (
    <div
      className={`relative w-96 h-[500px] md:w-[420px] md:h-[600px] ${className}`}
    >
      <div className="bg-white rounded-xl shadow-lg w-full h-full overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center h-full text-sm">
            Loading chat…
          </div>
        )}
        {error && (
          <div className="p-4 text-sm text-red-600">
            Unable to load chat: {error.message}
          </div>
        )}
        {!isLoading && !error && url && (
          <iframe
            src={url}
            title="Chat"
            className="w-full h-full border-0"
            allow="microphone; camera"
          />
        )}
      </div>
    </div>
  );
}
