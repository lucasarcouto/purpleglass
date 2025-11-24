import { useState, useRef, useEffect } from "react";
import type { Block } from "@blocknote/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, Loader2, RotateCcw } from "lucide-react";
import type { ChatMessage } from "@/core/ai/types";
import { useAI } from "@/hooks/use-ai";
import { extractTextFromBlocks } from "@/utils/extract-text-from-blocks";

interface ChatSidebarProps {
  isOpen: boolean;
  noteId?: string | null;
  noteTitle?: string;
  noteContent?: Block[];
  onClose: () => void;
}

export function ChatSidebar({
  isOpen,
  noteId,
  noteTitle,
  noteContent,
  onClose,
}: Readonly<ChatSidebarProps>) {
  const { chat } = useAI();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  function handleRestartChat() {
    setMessages([]);
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!noteId || !inputValue.trim() || isLoading || !noteContent) return;

    const userMessage = inputValue.trim();

    setInputValue("");

    // Add user message
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const noteText = extractTextFromBlocks(noteContent);
      const response = await chat(
        userMessage,
        {
          noteId,
          noteTitle,
          noteContent: noteText,
        },
        messages
      );

      setMessages([...newMessages, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chat failed:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-background border-l shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">Chat with AI</h2>
          {noteTitle && (
            <p className="text-sm text-muted-foreground mt-1">
              About: {noteTitle}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {messages.length > 0 && (
            <Button
              onClick={handleRestartChat}
              variant="ghost"
              size="sm"
              title="Restart chat"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            title="Close chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
            <p className="text-sm">
              {noteTitle
                ? `Ask questions about "${noteTitle}"`
                : "Open a note to start chatting"}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}-${message.content.slice(0, 20)}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
