import DashboardLayout from "@/components/DashboardLayout";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ML_API_URL } from "@/config/urls";

interface Message {
  role: "bot" | "user";
  text: string;
}

const initialMessages: Message[] = [
  { role: "bot", text: "Hi! I'm your data assistant. Ask me anything about your dataset." },
];

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("You must be logged in to chat.");
        return;
      }

      const response = await axios.post(
        `${ML_API_URL}/chat`,
        { question: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = { role: "bot" as const, text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from the bot.");
      // Optionally remove the user message if it failed, or verify if the user wants to see it.
      // For now, keeping the user message but not adding a bot response is better UI than deleting user input.
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)]">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl text-blue-500 font-bold tracking-tight italic uppercase">Chat with your Dataset</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Ask questions in natural language.</p>
        </div>

        <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden border border-white/10 bg-[#0a0a0a]/50 backdrop-blur-xl">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 md:gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "bot" && (
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-md rounded-2xl px-4 py-3 text-sm md:text-base ${m.role === "user"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "bg-secondary/50 text-foreground border border-white/5"
                    }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 border border-white/5">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div className="bg-secondary/50 text-foreground rounded-2xl px-4 py-3 flex items-center border border-white/5">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-white/5 p-3 md:p-4 flex gap-2 md:gap-3 bg-black/20">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your dataset..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-xl md:h-12"
              disabled={loading}
            />
            <Button size="icon" className="shrink-0 h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
