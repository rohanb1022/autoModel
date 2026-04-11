import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, PieChart, TrendingUp, Sparkles, Loader2, Info } from "lucide-react";
import { ML_API_URL } from "@/config/urls";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const chartConfigs = [
  { id: "correlation_heatmap", title: "Correlation Heatmap", icon: BarChart3, desc: "Feature correlations matrix" },
  { id: "feature_distributions", title: "Feature Distributions", icon: TrendingUp, desc: "Distribution of each feature" },
  { id: "target_distribution", title: "Target Distribution", icon: PieChart, desc: "Balance of target classes" },
];

export default function Visualizations() {
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});

  useEffect(() => {
    chartConfigs.forEach((chart) => {
      fetchInsight(chart.id);
    });
  }, []);

  const fetchInsight = async (chartId: string) => {
    try {
      setLoadingInsights((prev) => ({ ...prev, [chartId]: true }));
      const token = localStorage.getItem("token");
      const res = await axios.get(`${ML_API_URL}/visualization-insights/${chartId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInsights((prev) => ({ ...prev, [chartId]: res.data.insight }));
    } catch (err) {
      console.error(`Failed to fetch insight for ${chartId}:`, err);
      setInsights((prev) => ({ ...prev, [chartId]: "AI Insight unavailable." }));
    } finally {
      setLoadingInsights((prev) => ({ ...prev, [chartId]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 md:space-y-12 py-6 md:p-12 relative z-10">
        {/* Header */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-1"
          >
            <div className="h-1 w-12 bg-[#4b41e1] rounded-full" />
            <span className="text-[#4b41e1] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Gemma 4 Multimodal Analysis</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-[#00000b] tracking-tighter leading-none"
          >
            Visual<span className="text-[#4b41e1]">izations</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium max-w-2xl mt-4 text-sm md:text-lg leading-relaxed"
          >
            Real-time visual intelligence powered by Google's open weights model. 
            Gemma 4 analyzes your data distribution and feature relationships to find hidden patterns.
          </motion.p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {chartConfigs.map((c, index) => (
            <motion.div 
              key={c.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="rounded-[2.5rem] p-6 md:p-8 border border-slate-100 bg-white/60 backdrop-blur-2xl shadow-sm hover:shadow-[0_20px_50px_rgba(75,65,225,0.05)] overflow-hidden transition-all duration-500">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b41e1]/5 rounded-full blur-3xl group-hover:bg-[#4b41e1]/10 transition-colors" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#4b41e1]/5 border border-[#4b41e1]/10 group-hover:scale-110 transition-transform">
                      <c.icon className="h-6 w-6 text-[#4b41e1]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#00000b] tracking-tight text-lg md:text-xl">{c.title}</h3>
                      <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">{c.desc}</p>
                    </div>
                  </div>
                </div>

                {/* Plot Image */}
                <div className="relative aspect-video md:aspect-[16/10] rounded-3xl bg-white border border-slate-100 overflow-hidden mb-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
                  <img 
                    src={`${ML_API_URL}/outputs/${c.id}.png`}
                    alt={c.title}
                    className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/eee/888?text=Plot+Generating...";
                    }}
                  />
                </div>

                {/* AI Insight Section */}
                <div className="relative mt-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-[#4b41e1]" />
                    <span className="text-[10px] md:text-xs font-black text-[#4b41e1] uppercase tracking-[0.1em]">Gemma 4 Insight</span>
                  </div>
                  <div className="p-4 md:p-5 rounded-2xl bg-slate-50 border border-slate-100 min-h-[80px] flex items-center shadow-xs">
                    <AnimatePresence mode="wait">
                      {loadingInsights[c.id] ? (
                        <motion.div 
                          key="loader"
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-3 text-sm text-slate-400 font-medium"
                        >
                          <Loader2 className="h-4 w-4 animate-spin text-[#4b41e1]" />
                          Analyzing visual patterns...
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="content"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-sm md:text-base text-slate-700 font-medium italic leading-relaxed"
                        >
                          {insights[c.id] || "No insights available for this chart."}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]"
        >
          <Info size={14} className="text-[#4b41e1]" />
          Hardware Accelerated Inference Activated
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
