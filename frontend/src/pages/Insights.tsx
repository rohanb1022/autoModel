import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Brain, Lightbulb, FileText, Cpu, Target, LayoutDashboard, Zap, Terminal, Database } from "lucide-react";
import ReactMarkdown from "react-markdown";

// --- Pure CSS/Framer Motion Background ---
function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020202] overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -100, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[40%] -right-[10%] w-[35%] h-[50%] rounded-full bg-purple-600/10 blur-[120px]"
      />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
    </div>
  );
}

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
        <AmbientBackground />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Zap className="text-indigo-500 animate-pulse" size={48} />
            <p className="text-gray-400 font-mono tracking-widest uppercase text-xs">Retrieving Intelligence...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!latestModel) {
    return (
      <DashboardLayout>
        <AmbientBackground />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-white/5 border border-white/10">
            <LayoutDashboard className="text-gray-500" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">No Intelligence Found</h2>
            <p className="text-gray-400 mt-2">Train a model to see AI-driven dataset insights.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <AmbientBackground />

      <motion.div
        className="max-w-5xl mx-auto space-y-6 md:space-y-8 py-6 md:p-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-indigo-500 rounded-full" />
            <span className="text-indigo-400 font-mono text-[10px] md:text-xs uppercase tracking-widest">Model Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight italic uppercase">
            AI <span className="text-indigo-500 text-stroke-white">INSIGHTS</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg mt-2 text-sm md:text-base">
            Deep-dive into your model's performance with automated intelligence generated from your training results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* STATS PANEL */}
          <motion.div variants={itemVariants} className="lg:col-span-1 space-y-4 md:space-y-6">
            <div className="relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-6 md:p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <FileText className="h-5 w-5 text-indigo-400" />
                  </div>
                  <h2 className="font-bold text-white text-lg tracking-tight italic uppercase">Context</h2>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
                  {[
                    { label: "Dataset", value: latestModel.datasetName, icon: Database },
                    { label: "Pipeline", value: latestModel.problemType, icon: Target },
                    { label: "Engine", value: latestModel.bestModel, icon: Cpu },
                    { label: "Accuracy", value: (latestModel.accuracy * 100).toFixed(1) + "%", icon: Zap },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-colors overflow-hidden">
                      <item.icon className="h-4 w-4 text-gray-500 mt-1 shrink-0" />
                      <div className="truncate">
                        <p className="text-[9px] uppercase font-black text-gray-600 tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-xs md:text-sm font-bold text-white opacity-90 truncate">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] bg-indigo-600/10 border border-indigo-500/20 p-6 md:p-8">
              <div className="relative z-10 space-y-3 md:space-y-4 text-center">
                <div className="mx-auto h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                  <Lightbulb className="text-indigo-400" size={20} />
                </div>
                <h3 className="font-bold text-white italic text-sm md:text-base uppercase tracking-tight">Suggestions</h3>
                <p className="text-[11px] md:text-xs text-indigo-300 leading-relaxed font-medium">
                  Focus on **Feature Engineering** and **Hyperparameter Tuning** to push past the current benchmark.
                </p>
              </div>
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 p-6 md:p-10 min-h-[400px] md:min-h-[500px] group hover:border-indigo-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none group-hover:bg-indigo-600/10 transition-all" />

              <div className="relative z-10 space-y-6 md:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Brain className="text-white" size={24} md-size={28} />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white italic tracking-tight uppercase">Intelligence Output</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-[9px] md:text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">Gemini 1.5 Flash Active</p>
                      </div>
                    </div>
                  </div>
                  <Terminal size={20} className="text-gray-700 hidden sm:block" />
                </div>

                <div className="text-gray-300 prose prose-invert prose-sm md:prose-base max-w-none leading-relaxed font-medium selection:bg-indigo-500 selection:text-white">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4 md:mb-6 last:mb-0">{children}</p>,
                      li: ({ children }) => <li className="mb-2 md:mb-3 marker:text-indigo-500">{children}</li>,
                      strong: ({ children }) => <strong className="text-indigo-400 font-black tracking-tight">{children}</strong>,
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

