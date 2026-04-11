import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AlertCircle, CheckCircle, Info, Code, Crown, Sparkles, X, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "@/api/axios";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export default function SystemMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState<string | null>(null);
  const [selectedAdvice, setSelectedAdvice] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      setIsSubscribed(userObj.isSubscribed || false);
    }
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await API.get("/messages");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetAIAdvice = async (messageId: string) => {
    try {
      setAdviceLoading(messageId);
      const res = await API.post(`/payment/verify-payment`, {}); // Dummy to check sub if needed, but we check next
      const adviceRes = await API.post(`/api/messages/${messageId}/advice`);
      setSelectedAdvice(adviceRes.data.advice);
      setIsModalOpen(true);
      fetchMessages(); // Refresh to catch cached advice
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to get AI advice");
    } finally {
      setAdviceLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard!");
  };

  const getIcon = (type: string) => {
    if (type === "error") return <AlertCircle className="text-red-500 w-5 h-5" />;
    if (type === "success") return <CheckCircle className="text-emerald-500 w-5 h-5" />;
    return <Info className="text-blue-500 w-5 h-5" />;
  };

  const hasInconsistencies = messages.some((msg) => msg.type === "error");

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-[#00000b]">System Messages</h1>
            <p className="text-slate-500 mt-2 font-medium">Logs and Auto-Heal events from the Machine Learning Pipeline.</p>
          </div>
          {isSubscribed && (
            <div className="px-4 py-2 rounded-full bg-[#4b41e1]/5 border border-[#4b41e1]/20 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#4b41e1]" />
              <span className="text-xs font-bold text-[#4b41e1] uppercase tracking-[0.1em]">Pro Member</span>
            </div>
          )}
        </div>

        {hasInconsistencies && (
          <div className="p-6 rounded-2xl border border-[#4b41e1]/20 bg-indigo-50 shadow-[0_20px_40px_rgba(75,65,225,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full shadow-sm border border-indigo-100">
                {isSubscribed ? <Sparkles className="w-8 h-8 text-[#4b41e1]" /> : <Crown className="w-8 h-8 text-indigo-400" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#00000b] tracking-tight">
                  {isSubscribed ? "AI Helper Active" : "Data Inconsistencies Detected"}
                </h3>
                <p className="text-slate-600 mt-1 font-medium">
                  {isSubscribed 
                    ? "Your Pro subscription is active. Click 'Get Help from Model' on any error to get expert fixes."
                    : "Your data has some inconsistencies. Please purchase our subscription to continue utilizing AI Auto-Healing."}
                </p>
              </div>
            </div>
            {!isSubscribed && (
              <button
                onClick={() => navigate("/pricing")}
                className="px-6 py-3 shrink-0 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg transition-transform transform hover:-translate-y-1"
              >
                Get Pro Plan
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse text-[#4b41e1] font-bold">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-slate-100 bg-white shadow-sm">
            <p className="text-slate-500 font-medium">No system messages yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg._id} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-shadow space-y-3 relative overflow-hidden group">
                {msg.type === 'error' && isSubscribed && (
                  <div className="absolute top-0 right-0 p-4 transition-opacity opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={() => handleGetAIAdvice(msg._id)}
                      disabled={adviceLoading === msg._id}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00000b] hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-lg shadow-black/10 disabled:opacity-50"
                    >
                      {adviceLoading === msg._id ? "Analyzing..." : (
                        <><Sparkles className="w-3 h-3 text-[#e2dfff]" /> Get Help from Model</>
                      )}
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  {getIcon(msg.type)}
                  <h3 className="font-bold text-[#00000b] text-lg">{msg.title}</h3>
                  <span className="ml-auto text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-600 text-sm ml-8 font-medium">{msg.content}</p>
                <div className="ml-8 flex items-center gap-3">
                  <span className="text-xs px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-600 font-bold font-mono shadow-sm">
                    {msg.datasetName}
                  </span>
                  {msg.aiAdvice && (
                    <button 
                      onClick={() => { setSelectedAdvice(msg.aiAdvice); setIsModalOpen(true); }}
                      className="text-xs text-[#4b41e1] hover:text-indigo-700 flex items-center gap-1 font-bold underline underline-offset-4"
                    >
                      <Sparkles className="w-3 h-3" /> View AI Advice
                    </button>
                  )}
                </div>

                {msg.traceback && (
                  <div className="ml-8 mt-3 p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 font-bold font-mono overflow-auto max-h-32">
                      {msg.traceback}
                    </p>
                  </div>
                )}

                {msg.llmCode && (
                  <div className="ml-8 mt-3 p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-[#4b41e1]" />
                          <span className="text-xs font-bold text-[#4b41e1] uppercase tracking-[0.1em]">Auto-Heal Patch</span>
                       </div>
                       <button onClick={() => copyToClipboard(msg.llmCode)} className="p-1 hover:bg-white rounded border border-transparent hover:border-slate-200 relative group/copy transition-all shadow-sm">
                          <Copy className="w-3 h-3 text-slate-500 group-hover/copy:text-[#4b41e1]" />
                       </button>
                    </div>
                    <pre className="text-xs text-[#4b41e1] font-bold font-mono overflow-auto max-h-48">
                      {msg.llmCode}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[80vh] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#4b41e1]" />
                <h2 className="text-xl font-bold text-[#00000b] tracking-tight">AI Expert Analysis</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-[#00000b] border border-transparent hover:border-slate-200 transition-all shadow-sm shadow-transparent hover:shadow-sm">
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            <div className="p-8 overflow-auto flex-1 prose prose-indigo max-w-none text-slate-700">
              <ReactMarkdown>{selectedAdvice || ""}</ReactMarkdown>
            </div>
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold bg-[#00000b] text-white hover:-translate-y-0.5 active:scale-95 transition-all shadow-xl shadow-black/10">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
