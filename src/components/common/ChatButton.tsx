"use client";
import React, { useState } from "react";
import { MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatSocket from "@/components/common/ChatSocket";

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <>
      <div className="fixed right-6 bottom-6 z-50">
        <Button
          onClick={toggle}
          aria-label="Open chat"
          className="fixed right-5 bottom-5 z-50 w-[50px] h-[50px] p-0 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <MessageCircleMore className="!w-[24px] !h-[24px]" />
        </Button>
      </div>

      {/* Popup container */}
      {isOpen && (
        <div className="fixed right-6 bottom-24 z-50">
          <ChatSocket />
        </div>
      )}
    </>
  );
}
