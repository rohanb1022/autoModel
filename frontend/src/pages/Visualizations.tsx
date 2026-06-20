import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, PieChart, TrendingUp, Sparkles, Loader2, Info, AlertCircle, LayoutGrid, Maximize2, X } from "lucide-react";
import { BASE_API_URL } from "@/config/urls";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const chartConfigs = [
  { id: "target_distribution", title: "Target Distribution", icon: PieChart, desc: "Target column data distribution" },
  { id: "correlation_heatmap", title: "Correlation Heatmap", icon: BarChart3, desc: "Feature correlations matrix" },
  { id: "feature_distributions", title: "Feature Distributions", icon: TrendingUp, desc: "Distribution of each feature" },
  { id: "missing_values", title: "Data Completeness", icon: AlertCircle, desc: "Missing values percentage analysis" },
  { id: "outliers_boxplot", title: "Outlier Analysis", icon: LayoutGrid, desc: "Box plots for outlier detection" },
];

export default function Visualizations() {
  const [insights, setInsights] = useState<Record<string, string>>({});
  const [loadingInsights, setLoadingInsights] = useState<Record<string, boolean>>({});
  const [selectedChart, setSelectedChart] = useState<any>(null);

  useEffect(() => {
    chartConfigs.forEach((chart) => {
      fetchInsight(chart.id);
    });
  }, []);

  const fetchInsight = async (chartId: string) => {
    try {
      setLoadingInsights((prev) => ({ ...prev, [chartId]: true }));
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_API_URL}/visualizations/insight/${chartId}`, {
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
            Analyze your data distribution, missing value matrices, feature correlations, and outlier profiles.
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
              className="group relative cursor-pointer"
              onClick={() => setSelectedChart(c)}
            >
              <div className="rounded-[2.5rem] p-6 md:p-8 border border-slate-100 bg-white/60 backdrop-blur-2xl shadow-sm hover:shadow-[0_20px_50px_rgba(75,65,225,0.06)] overflow-hidden transition-all duration-500 flex flex-col h-full">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b41e1]/5 rounded-full blur-3xl group-hover:bg-[#4b41e1]/10 transition-colors" />
                
                <div className="flex flex-row items-center justify-between gap-4 mb-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-[#4b41e1]/5 border border-[#4b41e1]/10 group-hover:scale-110 transition-transform">
                      <c.icon className="h-6 w-6 text-[#4b41e1]" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#00000b] tracking-tight text-lg md:text-xl">{c.title}</h3>
                      <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">{c.desc}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-slate-100/50 hover:bg-[#4b41e1]/10 text-slate-400 hover:text-[#4b41e1] hidden sm:block">
                    <Maximize2 className="h-4 w-4" />
                  </div>
                </div>

                {/* Plot Image */}
                <div className="relative aspect-video md:aspect-[16/10] rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden mb-6 shadow-inner flex items-center justify-center p-4">
                  <img 
                    src={`${BASE_API_URL}/visualizations/plot/${c.id}.png`}
                    alt={c.title}
                    className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-700 filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/600x400/eee/888?text=Plot+Generating...";
                    }}
                  />
                  {/* Click to expand overlay */}
                  <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/5 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 text-xs font-bold bg-white/90 text-slate-800 px-4 py-2 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1.5 border border-slate-100">
                      <Maximize2 size={12} className="text-[#4b41e1]" />
                      Expand Chart
                    </span>
                  </div>
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
                          className="text-sm md:text-base text-slate-700 font-medium italic leading-relaxed text-left"
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

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedChart && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSelectedChart(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="bg-white max-w-5xl w-full rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button 
                  onClick={() => setSelectedChart(null)}
                  className="absolute top-6 right-6 z-10 p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Left Side: High-res Chart */}
                <div className="bg-slate-50/50 p-8 flex items-center justify-center md:w-[60%] min-h-[300px] md:min-h-0 border-b md:border-b-0 md:border-r border-slate-100">
                  <img 
                    src={`${BASE_API_URL}/visualizations/plot/${selectedChart.id}.png`}
                    alt={selectedChart.title}
                    className="max-h-[40vh] md:max-h-[65vh] w-full object-contain filter drop-shadow-lg"
                  />
                </div>

                {/* Right Side: Details & Insights */}
                <div className="md:w-[40%] p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-none">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#4b41e1]/10 border border-[#4b41e1]/20">
                        <selectedChart.icon className="h-5 w-5 text-[#4b41e1]" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-[#00000b] tracking-tight">{selectedChart.title}</h2>
                        <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5 font-bold">{selectedChart.desc}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#4b41e1]" />
                        <span className="text-xs font-black text-[#4b41e1] uppercase tracking-[0.1em]">Gemma 4 Visual Intelligence</span>
                      </div>
                      
                      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner min-h-[120px] flex items-start text-left">
                        {loadingInsights[selectedChart.id] ? (
                          <div className="flex items-center gap-3 text-sm text-slate-400 font-medium py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-[#4b41e1]" />
                            Generating deep insights...
                          </div>
                        ) : (
                          <p className="text-sm md:text-base text-slate-700 font-medium italic leading-relaxed">
                            {insights[selectedChart.id] || "No insights available for this chart."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                      Matplotlib HD Engine • Gemma Multi-modal v4
                    </p>
                    <button 
                      onClick={() => setSelectedChart(null)}
                      className="w-full bg-[#00000b] hover:bg-slate-900 text-white font-bold h-12 rounded-xl transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                    >
                      Close Analysis
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
