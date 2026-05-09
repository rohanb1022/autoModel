import DashboardLayout from "@/components/DashboardLayout";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { BASE_API_URL } from "@/config/urls";

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
        `${BASE_API_URL}/chat`,
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
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 w-12 bg-[#4b41e1] rounded-full" />
            <span className="text-[#4b41e1] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Machine Learning Assistant</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-5xl text-[#00000b] font-black tracking-tighter">Chat with <span className="text-[#4b41e1]">Dataset</span></h1>
          <p className="text-sm md:text-base text-slate-500 mt-2 font-medium">Ask questions in natural language and receive AI-driven insights.</p>
        </div>

        <div className="flex-1 rounded-[2.5rem] flex flex-col overflow-hidden border border-slate-100 bg-white/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 md:gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                {m.role === "bot" && (
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-2xl bg-[#4b41e1]/10 flex items-center justify-center shrink-0 border border-[#4b41e1]/20 shadow-sm">
                    <Bot className="h-4 w-4 md:h-5 md:w-5 text-[#4b41e1]" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] md:max-w-md rounded-2xl px-5 py-3.5 text-sm md:text-base font-medium shadow-sm ${m.role === "user"
                    ? "bg-[#00000b] text-white shadow-lg shadow-black/5"
                    : "bg-slate-50 text-slate-700 border border-slate-100"
                    }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{m.text}</div>
                </div>
                {m.role === "user" && (
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 md:gap-3">
                <div className="h-8 w-8 md:h-10 md:w-10 rounded-2xl bg-[#4b41e1]/10 flex items-center justify-center shrink-0 border border-[#4b41e1]/20 shadow-sm">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-[#4b41e1]" />
                </div>
                <div className="bg-slate-50 text-slate-700 rounded-2xl px-5 py-3.5 flex items-center border border-slate-100 shadow-sm">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin text-[#4b41e1]" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-slate-100 p-4 md:p-6 flex gap-3 md:gap-4 bg-white/50 backdrop-blur-md">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your dataset..."
              className="flex-1 bg-slate-50/50 border-slate-200 text-[#00000b] placeholder:text-slate-400 rounded-xl md:rounded-2xl md:h-14 font-medium px-6 focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm transition-all"
              disabled={loading}
            />
            <Button size="icon" className="shrink-0 h-10 w-10 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-[#4b41e1] hover:bg-indigo-700 hover:-translate-y-0.5 active:scale-95 shadow-lg shadow-[#4b41e1]/30 transition-all text-white" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4 md:h-5 md:w-5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
