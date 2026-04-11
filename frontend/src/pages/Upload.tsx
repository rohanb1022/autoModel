"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileUp, Cpu, CheckCircle, ChevronRight, Zap, Database, AlertCircle, LayoutDashboard, Terminal } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/config/urls";

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

export default function Upload() {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [analysis, setAnalysis] = useState<any>(null);
  const [trainingResult, setTrainingResult] = useState<any>(null);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const token = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : null;

  // STEP 1: Upload + Analyze
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file first");
      return;
    }

    try {
      setLoading(true);
      setTrainingResult(null);
      setAnalysis(null);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${BASE_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Analysis failed");
        return;
      }

      setAnalysis(data);
      toast.success("Dataset analyzed. Please confirm target.");

    } catch (err) {
      console.error(err);
      toast.error("Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Confirm Target → Train
  const confirmTarget = async (target: string) => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_API_URL}/confirm-target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_column: target,
          dataset_name: analysis?.dataset_name
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error("Training failed: " + (data.error || "Unknown error"));
        return;
      }

      setTrainingResult(data);
      
      if (data.autoHealed) {
        toast.success("We encountered issues, but Auto-Healer fixed them! Redirecting...");
        setTimeout(() => { window.location.href = "/messages"; }, 3000);
      } else {
        toast.success("Model trained successfully!");
        setTimeout(() => { window.location.href = "/dashboard"; }, 2000);
      }

    } catch (err) {
      console.error(err);
      toast.error("Training error.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <DashboardLayout >
      <AmbientBackground />

      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 py-6 md:p-12 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-indigo-500 rounded-full" />
            <span className="text-indigo-400 font-mono text-[10px] md:text-xs uppercase tracking-widest">Pipeline Setup</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight italic uppercase">
            DATA <span className="text-indigo-500 text-stroke-white">INGESTION</span>
          </h1>
          <p className="text-gray-400 font-medium max-w-lg mt-2 text-sm md:text-base">
            Upload your dataset to start the automated machine learning pipeline. We'll handle the analysis and model selection.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analysis && !trainingResult && (
            <motion.div
              key="upload-zone"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div
                className={`group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0a0a0a] border-2 border-dashed transition-all duration-500 ${dragging ? "border-indigo-500 bg-indigo-500/5" : "border-white/10 hover:border-white/20"
                  } p-8 md:p-16 text-center`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="fileInput"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />

                <div className="relative z-10 space-y-6 md:space-y-8 flex flex-col items-center">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                  >
                    <FileUp className="text-white" size={32} md-size={40} />
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Drop your dataset here</h3>
                    <p className="text-gray-500 text-xs md:text-sm">Supported formats: CSV, TSV (Max 50MB)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => document.getElementById("fileInput")?.click()}
                      className="w-full sm:w-auto rounded-xl md:rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold h-12 md:h-14 px-6 md:px-8 text-sm md:text-base"
                    >
                      <UploadIcon className="h-4 w-4 md:h-5 md:w-5 mr-3 text-indigo-400" />
                      Browse Files
                    </Button>

                    <Button
                      size="lg"
                      onClick={handleUpload}
                      disabled={!file || loading}
                      className="w-full sm:w-auto rounded-xl md:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 md:h-14 px-8 md:px-10 disabled:opacity-30 flex items-center gap-2 md:gap-3 transition-all text-sm md:text-base"
                    >
                      {loading ? (
                        <Zap className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                      {loading ? "Analyzing..." : "Analyze Dataset"}
                    </Button>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-white/5 border border-white/10 max-w-full"
                    >
                      <Database size={14} className="text-indigo-400" />
                      <span className="text-xs md:text-sm font-mono text-gray-300 truncate max-w-[150px] md:max-w-none">{file.name}</span>
                      <CheckCircle size={14} className="text-emerald-500" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {analysis && !trainingResult && (
            <motion.div
              key="analysis-step"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/10 p-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2 md:gap-3 italic uppercase">
                        <Terminal className="text-indigo-500 h-5 w-5 md:h-6 md:w-6" />
                        Analysis Report
                      </h2>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">Foundations for your machine learning model</p>
                    </div>
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] md:text-xs font-black uppercase tracking-widest">
                      Success
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Suggested Target</p>
                      <p className="text-2xl md:text-3xl font-black text-white italic truncate">{analysis.suggested_target}</p>
                    </div>
                    <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Problem Type</p>
                      <p className="text-2xl md:text-3xl font-black text-indigo-400 italic capitalize">{analysis.problem_type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs md:text-sm text-gray-400">Does this look correct? Continue to start the heavy-duty training phase.</p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button
                        size="lg"
                        onClick={() => confirmTarget(analysis.suggested_target)}
                        disabled={loading}
                        className="flex-1 rounded-xl md:rounded-2xl bg-white text-black hover:bg-gray-200 font-black h-12 md:h-14 text-base md:text-lg transition-transform active:scale-95"
                      >
                        {loading ? "Training..." : "Start Deep Training"}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="rounded-xl md:rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 font-bold h-12 md:h-14 text-sm md:text-base"
                      >
                        Custom Target Selection
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden space-y-4 pt-4 border-t border-white/5"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-end">
                          <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase">Select Target Column</label>
                            <select
                              value={selectedTarget}
                              onChange={(e) => setSelectedTarget(e.target.value)}
                              className="w-full bg-[#151515] border border-white/10 rounded-xl p-3 md:p-4 text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none appearance-none text-sm md:text-base"
                            >
                              <option value="">Choose a column...</option>
                              {analysis.all_columns.map((col: string) => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                          </div>
                          <Button
                            disabled={!selectedTarget || loading}
                            onClick={() => confirmTarget(selectedTarget)}
                            className="w-full sm:w-auto bg-indigo-600 rounded-xl h-[52px] md:h-[58px] px-6 md:px-8 text-sm md:text-base"
                          >
                            Set & Train
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {trainingResult && (
            <motion.div
              key="results-step"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0a0a0a] border border-emerald-500/20 p-8 md:p-12 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-6 md:space-y-8 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle size={32} md-size={48} className="text-white" />
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">Deployment Ready</h2>
                  <p className="text-gray-400 text-sm md:text-base">Training cycle complete. The model is now available in your hub.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl">
                  {[
                    { label: "Best Model", value: trainingResult.best_model, icon: Cpu },
                    { label: "Accuracy", value: (trainingResult.score * 100).toFixed(1) + "%", icon: Zap },
                    { label: "Target", value: trainingResult.target_column, icon: Terminal },
                    { label: "Type", value: trainingResult.problem_type, icon: LayoutDashboard },
                  ].map((stat, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={stat.label}
                      className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/5 border border-white/5"
                    >
                      <stat.icon size={14} md-size={16} className="text-indigo-400 mb-2 mx-auto" />
                      <p className="text-[9px] md:text-[10px] uppercase font-black text-gray-500 tracking-widest">{stat.label}</p>
                      <p className="text-xs md:text-sm font-bold text-white truncate px-1 md:px-2">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-500 font-mono text-xs md:text-sm">Redirecting to Results Page...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}