import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Zap, 
  TrendingUp, 
  Box, 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  Settings2, 
  BarChart2, 
  Lightbulb, 
  Database,
  ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const res = await API.get("/models/my-models");
      console.log("[DASHBOARD] Raw API Data:", res.data);

      const dataWithIndex = res.data.map((item: any, index: number) => {
        const rawAcc = item.accuracy !== undefined ? item.accuracy : item.score;
        const accuracy = parseFloat(rawAcc) || 0;
        return { ...item, index: index + 1, accuracy };
      });

      console.log("[DASHBOARD] Normalized Data:", dataWithIndex);
      setModels(dataWithIndex);

      if (dataWithIndex.length > 0) {
        setSelectedModel(dataWithIndex[0]); // default to latest run
      }
    } catch (err) {
      console.error("[DASHBOARD] Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (model: any) => {
    if (!model || !model.profileReport) return 100;
    const report = model.profileReport;
    const missingCount = Object.keys(report.missing_values || {}).length;
    const dupCount = report.duplicates || 0;
    const warnCount = (report.warnings || []).length;
    
    // Simple penalty model
    let score = 100 - (missingCount * 4) - (dupCount > 0 ? 10 : 0) - (warnCount * 5);
    return Math.max(0, Math.min(100, score));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.3 } }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <Zap className="text-[#4b41e1] animate-spin" size={48} />
            <p className="text-slate-400 font-mono tracking-widest uppercase text-xs font-bold">Assembling Control Room...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const best = models.length > 0 
    ? models.reduce((prev: any, curr: any) => curr.accuracy > prev.accuracy ? curr : prev)
    : null;

  return (
    <DashboardLayout>
      <motion.div
        className="relative z-10 py-6 md:py-8 max-w-[1600px] mx-auto space-y-8 md:space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 border-b border-slate-100 pb-6">
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl md:text-5xl font-black text-[#00000b] tracking-tighter">
              Aether<span className="text-[#4b41e1]">Intelligence</span> Control Room
            </h1>
            <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">Monitor dataset health, model competition progress, and hyperparameter tuning live.</p>
          </motion.div>

          <motion.div variants={cardVariants} className="flex flex-wrap gap-3 md:gap-4 items-center">
            {models.length > 0 && (
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2.5 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Run:</span>
                <select
                  value={selectedModel ? selectedModel._id : ""}
                  onChange={(e) => {
                    const found = models.find(m => m._id === e.target.value);
                    if (found) setSelectedModel(found);
                  }}
                  className="bg-transparent text-sm font-bold text-[#00000b] focus:outline-none cursor-pointer"
                >
                  {models.map(m => (
                    <option key={m._id} value={m._id}>
                      {m.datasetName} ({new Date(m.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => navigate("/upload")}
              className="px-6 py-2.5 bg-[#4b41e1] rounded-full text-white text-sm font-bold hover:bg-indigo-700 hover:-translate-y-0.5 shadow-lg shadow-[#4b41e1]/20 transition-all duration-300">
              + New AutoML Run
            </button>
          </motion.div>
        </header>

        {models.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <div className="p-6 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
              <LayoutDashboard className="text-slate-400" size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#00000b]">No Models Trained Yet</h2>
              <p className="text-slate-500 mt-2 font-medium">To view the dashboard, upload a dataset and train your first AutoML model.</p>
            </div>
            <button
              onClick={() => navigate("/upload")}
              className="px-8 py-3 bg-[#00000b] rounded-xl text-white font-bold hover:bg-slate-900 shadow-xl shadow-black/10 transition-all hover:scale-105"
            >
              Get Started
            </button>
          </div>
        ) : (
          <>
            {/* OVERVIEW STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Best Overall Model */}
              <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Top Performance</p>
                  <h3 className="text-2xl font-black text-[#00000b] tracking-tight truncate max-w-[180px]">
                    {best ? best.datasetName : "N/A"}
                  </h3>
                  <p className="text-xs text-[#4b41e1] font-bold">{best ? best.bestModel : ""}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-[#4b41e1] tracking-tighter">
                    {best ? (best.problemType === "clustering" ? best.accuracy.toFixed(3) : `${(best.accuracy * 100).toFixed(1)}%`) : "0%"}
                  </div>
                  <p className="text-[9px] font-mono text-slate-400 uppercase">max score</p>
                </div>
              </motion.div>

              {/* Stat 2: Active Models Count */}
              <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Runs</p>
                  <h3 className="text-3xl font-black text-[#00000b] tracking-tighter">{models.length}</h3>
                  <p className="text-xs text-slate-500 font-semibold">Trained databases</p>
                </div>
                <div className="h-12 w-12 bg-[#4b41e1]/10 rounded-2xl flex items-center justify-center text-[#4b41e1]">
                  <Box size={24} />
                </div>
              </motion.div>

              {/* Stat 3: Avg Accuracy */}
              <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Precision</p>
                  <h3 className="text-3xl font-black text-[#00000b] tracking-tighter">
                    {(models.reduce((a, b) => a + b.accuracy, 0) / models.length * (selectedModel?.problemType === "clustering" ? 1 : 100)).toFixed(selectedModel?.problemType === "clustering" ? 3 : 1)}
                    {selectedModel?.problemType !== "clustering" && "%"}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Across all iterations</p>
                </div>
                <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <TrendingUp size={24} />
                </div>
              </motion.div>

              {/* Stat 4: Dynamic Performance Flow Area Chart */}
              <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Performance Flow</span>
                  <span className="text-[9px] font-mono font-bold text-[#4b41e1] bg-[#4b41e1]/10 px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="h-14 w-full mt-2 -mb-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={models}>
                      <Area type="monotone" dataKey="accuracy" stroke="#4b41e1" fill="rgba(75, 65, 225, 0.05)" strokeWidth={2.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* DETAILED AutoML ACTIVE RUN CONTROL ROOM */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* LEFT & CENTER PANELS: TRAINING RESULTS, TUNING & INTERPRETATION */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* CARD 1: MODEL COMPETITION LEADERBOARD */}
                <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-y-1">
                      <h3 className="font-black text-[#00000b] tracking-tight text-xl flex items-center gap-2">
                        <BarChart2 className="text-[#4b41e1]" size={20} />
                        AutoML Competition Leaderboard
                      </h3>
                      <p className="text-xs text-slate-500">Trained and compared models automatically</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {selectedModel.leaderboard && selectedModel.leaderboard.length > 0 ? (
                      selectedModel.leaderboard.map((item: any, idx: number) => {
                        const scorePct = selectedModel.problemType === "clustering" 
                          ? (item.score + 1) / 2 * 100 // Silhouette goes -1 to 1, normalize to 0-100
                          : item.score * 100;
                        const isBest = item.model === selectedModel.bestModel;
                        
                        return (
                          <div key={item.model} className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-semibold">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-mono">#{idx+1}</span>
                                <span className={isBest ? "text-[#4b41e1] font-black" : "text-slate-700"}>{item.model}</span>
                                {isBest && (
                                  <span className="bg-[#4b41e1]/10 border border-[#4b41e1]/20 text-[9px] font-black text-[#4b41e1] px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Best Model
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-slate-400">
                                  {selectedModel.problemType === "clustering" 
                                    ? `Silhouette: ${item.score.toFixed(3)}` 
                                    : `Acc: ${(item.score * 100).toFixed(1)}%`}
                                </span>
                              </div>
                            </div>
                            <div className="w-full h-2.5 rounded-full bg-slate-50 border border-slate-100 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${isBest ? "bg-[#4b41e1]" : "bg-slate-300"}`} 
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>
                            
                            {/* Rich metrics breakdown */}
                            {isBest && item.metrics && Object.keys(item.metrics).length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                {Object.entries(item.metrics).map(([key, val]: [string, any]) => (
                                  <div key={key} className="bg-slate-50 border border-slate-100 rounded-lg p-2 text-center">
                                    <p className="text-[8px] uppercase font-bold text-slate-400 tracking-wider">{key}</p>
                                    <p className="text-xs font-mono font-bold text-slate-800">
                                      {typeof val === 'number' && key !== 'silhouette' && key !== 'rmse' && key !== 'mae'
                                        ? `${(val * 100).toFixed(1)}%` 
                                        : typeof val === 'number' ? val.toFixed(3) : val}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      // Fallback for older entries
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-semibold">
                          <span className="text-[#4b41e1] font-black">{selectedModel.bestModel} (Ad Adopted Model)</span>
                          <span className="text-xs font-mono text-slate-500">
                            {selectedModel.problemType === "clustering" 
                              ? `Silhouette: ${selectedModel.accuracy.toFixed(3)}` 
                              : `Acc: ${(selectedModel.accuracy * 100).toFixed(1)}%`}
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#4b41e1]" />
                      </div>
                    )}
                  </div>
                </motion.div>
                
                {/* CARD 2: OPTUNA HYPERPARAMETER TUNING */}
                <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div className="space-y-1">
                      <h3 className="font-black text-[#00000b] tracking-tight text-xl flex items-center gap-2">
                        <Settings2 className="text-[#4b41e1]" size={20} />
                        Optuna Hyperparameter Optimization
                      </h3>
                      <p className="text-xs text-slate-500">Auto-tuned search space parameters and trial statistics</p>
                    </div>
                    {selectedModel.optunaResults?.run && (
                      <span className="bg-[#4b41e1]/10 border border-[#4b41e1]/20 text-[9px] font-black text-[#4b41e1] px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Optimized
                      </span>
                    )}
                  </div>

                  {selectedModel.optunaResults?.run ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Tune Score */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col justify-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Best CV Score</p>
                        <h4 className="text-3xl font-black text-[#4b41e1] tracking-tighter">
                          {selectedModel.problemType === "clustering" 
                            ? selectedModel.optunaResults.best_score.toFixed(3) 
                            : `${(selectedModel.optunaResults.best_score * 100).toFixed(1)}%`}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1">
                          over {selectedModel.optunaResults.n_trials} cross-validation trials
                        </p>
                      </div>
                      
                      {/* Best Parameters */}
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 md:col-span-2 text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tuned Parameters</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(selectedModel.optunaResults.best_params || {}).map(([key, val]: [string, any]) => (
                            <div key={key} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm text-xs flex items-center gap-2">
                              <span className="font-mono text-[#4b41e1] font-bold">{key}:</span>
                              <span className="font-bold text-slate-700">{typeof val === 'number' && val % 1 !== 0 ? val.toFixed(4) : String(val)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-sm font-semibold">
                      Optuna Hyperparameter Tuning was not run for this model (clustering baseline or failed trial).
                    </div>
                  )}
                </motion.div>

                {/* CARD 3: FEATURE IMPORTANCE */}
                <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
                  <div className="space-y-1 mb-6">
                    <h3 className="font-black text-[#00000b] tracking-tight text-xl flex items-center gap-2">
                      <BarChart2 className="text-[#4b41e1]" size={20} />
                      Feature Importance
                    </h3>
                    <p className="text-xs text-slate-500">Key features driving the best model's predictions</p>
                  </div>

                  <div className="space-y-4">
                    {selectedModel.topFeatures && selectedModel.topFeatures.length > 0 ? (
                      selectedModel.topFeatures.map((feat: any) => {
                        const importancePct = (feat.importance * 100).toFixed(1);
                        return (
                          <div key={feat.feature} className="flex items-center gap-4">
                            <span className="text-xs font-bold text-slate-700 w-32 truncate text-left">{feat.feature}</span>
                            <div className="flex-1 h-3 rounded-full bg-slate-50 border border-slate-100 overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-[#4b41e1] to-indigo-500 transition-all duration-1000" 
                                style={{ width: `${feat.importance * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-slate-500 w-12 text-right">{importancePct}%</span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 text-sm font-semibold">
                        Feature importances are not available for this model.
                      </div>
                    )}
                  </div>
                </motion.div>
                
              </div>
              
              {/* RIGHT SIDE: DATASET HEALTH & AI INSIGHTS */}
              <div className="space-y-8">
                
                {/* DATASET HEALTH INSPECTOR */}
                <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b41e1]/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />
                  
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2.5 rounded-xl bg-[#4b41e1]/5 border border-[#4b41e1]/10">
                      <Database className="text-[#4b41e1]" size={18} />
                    </div>
                    <div>
                      <h3 className="font-black text-[#00000b] tracking-tight text-lg">Dataset Health</h3>
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Data Quality Assessment</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center py-4 border-b border-slate-100">
                    <div className="relative flex items-center justify-center">
                      {/* Health Radial Gauge Placeholder with text */}
                      <div className="h-28 w-28 rounded-full border-8 border-slate-50 flex flex-col items-center justify-center relative shadow-inner">
                        <div className="absolute inset-0 rounded-full border-8 border-t-[#4b41e1] border-r-[#4b41e1] rotate-45 pointer-events-none" />
                        <span className="text-3xl font-black text-[#00000b] leading-none">
                          {calculateHealthScore(selectedModel)}
                        </span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Health Score</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full mt-6 text-center text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Rows</span>
                        <span className="text-slate-800 font-black text-sm">{selectedModel.rows || "N/A"}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Columns</span>
                        <span className="text-slate-800 font-black text-sm">{selectedModel.columns || "N/A"}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2">
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Duplicates</span>
                        <span className="text-slate-800 font-black text-sm">{selectedModel.profileReport?.duplicates ?? "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Warnings List */}
                  <div className="mt-6 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality Warnings ({selectedModel.profileReport?.warnings?.length || 0})</p>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedModel.profileReport?.warnings && selectedModel.profileReport.warnings.length > 0 ? (
                        selectedModel.profileReport.warnings.map((warn: string, idx: number) => (
                          <div key={idx} className="flex gap-2.5 p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-left">
                            <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                            <span className="text-xs text-amber-900 font-medium leading-relaxed">{warn}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-left">
                          <ShieldCheck size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-xs text-emerald-900 font-medium leading-relaxed">No data quality issues detected! Dataset is completely clean.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                {/* AI INSIGHTS PANEL */}
                <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#4b41e1]/5 rounded-full blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#4b41e1]/5 border border-[#4b41e1]/10">
                        <Lightbulb className="text-[#4b41e1]" size={18} />
                      </div>
                      <div>
                        <h3 className="font-black text-[#00000b] tracking-tight text-lg">AI Insights</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Aether Analytics</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-slate-700 text-xs md:text-sm font-medium leading-relaxed text-left selection:bg-[#4b41e1]/10 select-text">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                        li: ({ children }) => <li className="mb-2 marker:text-[#4b41e1] pl-1 list-disc">{children}</li>,
                        strong: ({ children }) => <strong className="text-[#00000b] font-black tracking-tighter">{children}</strong>,
                      }}
                    >
                      {selectedModel.insights || "Generating insights..."}
                    </ReactMarkdown>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => navigate("/insights")}
                      className="w-full h-11 bg-slate-50 border border-slate-200 hover:border-[#4b41e1]/30 rounded-xl text-xs font-bold text-slate-600 hover:text-[#4b41e1] flex items-center justify-center gap-2 transition-all"
                    >
                      Open Deep-Dive Insights Page
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </motion.div>
                
              </div>
              
            </div>
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
}