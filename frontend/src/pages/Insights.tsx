import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Brain, Lightbulb, FileText, Cpu, Target, LayoutDashboard, Zap, Terminal, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";


export default function Insights() {
  const [latestModel, setLatestModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await API.get("/models/my-models");
      if (res.data.length > 0) {
        setLatestModel(res.data[0]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Zap className="text-[#4b41e1] animate-pulse" size={48} />
            <p className="text-slate-400 font-mono tracking-widest uppercase text-xs font-bold">Retrieving Intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!latestModel) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <LayoutDashboard className="text-slate-400" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00000b] tracking-tight">No Intelligence Found</h2>
            <p className="text-slate-500 mt-2 font-medium">Train a model to see AI-driven dataset insights.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <motion.div
        className="max-w-5xl mx-auto space-y-6 md:space-y-8 py-6 md:p-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-[#4b41e1] rounded-full" />
            <span className="text-[#4b41e1] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Model Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-[#00000b] tracking-tighter">
            AI <span className="text-[#4b41e1]">Insights</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mt-2 text-sm md:text-base leading-relaxed">
            Deep-dive into your model's performance with automated intelligence generated from your training results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* STATS PANEL */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-100 p-6 md:p-8 shadow-sm hover:shadow-[0_10px_30px_rgba(0,0,0,0.03)] transition-shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b41e1]/5 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#4b41e1]/10 border border-[#4b41e1]/20">
                    <FileText className="h-5 w-5 text-[#4b41e1]" />
                  </div>
                  <h2 className="font-bold text-[#00000b] text-lg tracking-tight">Context</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                  {[
                    { label: "Dataset", value: latestModel.datasetName, icon: Database },
                    { label: "Pipeline", value: latestModel.problemType, icon: Target },
                    { label: "Engine", value: latestModel.bestModel, icon: Cpu },
                    { label: "Accuracy", value: (latestModel.accuracy * 100).toFixed(1) + "%", icon: Zap },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-[#4b41e1]/30 transition-colors overflow-hidden shadow-sm">
                      <item.icon className="h-4 w-4 text-slate-400 mt-1 shrink-0" />
                      <div className="truncate text-left w-full">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-[0.1em] mb-0.5">{item.label}</p>
                        <p className="text-xs md:text-sm font-black text-[#00000b] truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-[#4b41e1]/5 border border-[#4b41e1]/10 p-6 md:p-8 shadow-sm">
              <div className="relative z-10 space-y-3 md:space-y-4 text-center">
                <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-white flex items-center justify-center shadow-sm border border-[#4b41e1]/20">
                  <Lightbulb className="text-[#4b41e1]" size={20} />
                </div>
                <h3 className="font-bold text-[#00000b] text-sm md:text-base uppercase tracking-tight">Suggestions</h3>
                <p className="text-[11px] md:text-xs text-slate-600 leading-relaxed font-medium">
                  Focus on **Feature Engineering** and **Hyperparameter Tuning** to push past the current benchmark.
                </p>
              </div>
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 p-6 md:p-10 min-h-[400px] md:min-h-[500px] group hover:shadow-[0_20px_50px_rgba(75,65,225,0.06)] transition-all duration-500 shadow-sm">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4b41e1]/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-[#4b41e1]/10 transition-all" />

              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-[#4b41e1]/10 flex items-center justify-center border border-[#4b41e1]/20 shadow-inner group-hover:scale-105 transition-transform">
                      <Brain className="text-[#4b41e1]" size={24} md-size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-[#00000b] tracking-tight">Intelligence Output</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Gemini 1.5 Flash Active</p>
                      </div>
                    </div>
                  </div>
                  <Terminal size={20} className="text-slate-300 hidden sm:block" />
                </div>

                <div className="text-slate-700 prose prose-indigo prose-sm md:prose-base max-w-none leading-relaxed font-medium selection:bg-[#4b41e1]/20 selection:text-[#00000b]">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4 md:mb-6 last:mb-0">{children}</p>,
                      li: ({ children }) => <li className="mb-2 md:mb-3 marker:text-[#4b41e1]">{children}</li>,
                      strong: ({ children }) => <strong className="text-[#00000b] font-black tracking-tighter">{children}</strong>,
                    }}
                  >
                    {latestModel.insights}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}

