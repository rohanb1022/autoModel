"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload as UploadIcon, FileUp, Cpu, CheckCircle, ChevronRight, Zap, Database, AlertCircle, LayoutDashboard, Terminal } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { BASE_API_URL } from "@/config/urls";


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

      <div className="max-w-4xl mx-auto space-y-8 md:space-y-12 py-6 md:p-12 relative z-10">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-[#4b41e1] rounded-full" />
            <span className="text-[#4b41e1] font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] font-bold">Pipeline Setup</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-[#00000b] tracking-tighter">
            Data <span className="text-[#4b41e1]">Ingestion</span>
          </h1>
          <p className="text-slate-500 font-medium max-w-lg mt-2 text-sm md:text-base leading-relaxed">
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
                className={`group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white border-2 border-dashed transition-all duration-500 shadow-sm hover:shadow-[0_20px_50px_rgba(75,65,225,0.08)] ${dragging ? "border-[#4b41e1] bg-[#4b41e1]/5" : "border-slate-200 hover:border-[#4b41e1]/50"
                  } p-8 md:p-16 text-center`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
                }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#4b41e1]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

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
                    className="h-16 w-16 md:h-24 md:w-24 rounded-2xl md:rounded-3xl bg-[#4b41e1]/10 flex items-center justify-center border border-[#4b41e1]/20 shadow-inner"
                  >
                    <FileUp className="text-[#4b41e1]" size={32} md-size={40} />
                  </motion.div>

                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-[#00000b] tracking-tight">Drop your dataset here</h3>
                    <p className="text-slate-500 text-xs md:text-sm font-medium">Supported formats: CSV, TSV (Max 50MB)</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => document.getElementById("fileInput")?.click()}
                      className="w-full sm:w-auto rounded-xl md:rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 md:h-14 px-6 md:px-8 text-sm md:text-base shadow-sm"
                    >
                      <UploadIcon className="h-4 w-4 md:h-5 md:w-5 mr-3 text-[#4b41e1]" />
                      Browse Files
                    </Button>

                    <Button
                      size="lg"
                      onClick={handleUpload}
                      disabled={!file || loading}
                      className="w-full sm:w-auto rounded-xl md:rounded-2xl bg-[#00000b] hover:bg-slate-900 text-white font-bold h-12 md:h-14 px-8 md:px-10 disabled:opacity-30 flex items-center gap-2 md:gap-3 transition-all text-sm md:text-base hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10"
                    >
                      {loading ? (
                        <Zap className="h-4 w-4 md:h-5 md:w-5 animate-spin text-[#4b41e1]" />
                      ) : (
                        <Zap className="h-4 w-4 md:h-5 md:w-5 text-[#e2dfff]" />
                      )}
                      {loading ? "Analyzing..." : "Analyze Dataset"}
                    </Button>
                  </div>

                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 rounded-xl bg-green-50 border border-green-100 max-w-full shadow-sm"
                    >
                      <Database size={14} className="text-green-600" />
                      <span className="text-xs md:text-sm font-mono text-green-700 font-bold truncate max-w-[150px] md:max-w-none">{file.name}</span>
                        <CheckCircle size={14} className="text-green-600" />
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
              <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-10">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />

                <div className="relative z-10 space-y-6 md:space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-[#00000b] tracking-tight flex items-center gap-2 md:gap-3">
                        <Terminal className="text-[#4b41e1] h-5 w-5 md:h-6 md:w-6" />
                        Analysis Report
                      </h2>
                      <p className="text-slate-500 text-xs md:text-sm mt-1 font-medium">Foundations for your machine learning model</p>
                    </div>
                    <div className="px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600 text-[9px] md:text-xs font-black uppercase tracking-widest shadow-sm">
                      SUCCESS
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                      <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Suggested Target</p>
                      <p className="text-2xl md:text-3xl font-black text-[#00000b] truncate">{analysis.suggested_target}</p>
                    </div>
                    <div className="p-5 md:p-6 rounded-2xl md:rounded-3xl bg-[#4b41e1]/5 border border-[#4b41e1]/10 space-y-1">
                      <p className="text-[10px] md:text-xs font-bold text-[#4b41e1]/60 uppercase tracking-[0.1em]">Problem Type</p>
                      <p className="text-2xl md:text-3xl font-black text-[#4b41e1] capitalize">{analysis.problem_type}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs md:text-sm text-slate-500 font-medium">Does this look correct? Continue to start the heavy-duty training phase.</p>

                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                      <Button
                        size="lg"
                        onClick={() => confirmTarget(analysis.suggested_target)}
                        disabled={loading}
                        className="flex-1 rounded-xl md:rounded-2xl bg-[#00000b] text-white hover:bg-slate-900 shadow-xl shadow-black/10 font-bold h-12 md:h-14 text-base md:text-lg transition-transform active:scale-95 hover:scale-[1.02]"
                      >
                        {loading ? "Training..." : "Start Deep Training"}
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="rounded-xl md:rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold h-12 md:h-14 text-sm md:text-base border border-transparent hover:border-slate-200"
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
                        className="overflow-hidden space-y-4 pt-4 border-t border-slate-100"
                      >
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-end">
                          <div className="flex-1 w-full space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Select Target Column</label>
                            <select
                              value={selectedTarget}
                              onChange={(e) => setSelectedTarget(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 md:p-4 text-slate-900 font-bold focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] outline-none appearance-none text-sm md:text-base shadow-sm"
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
                            className="w-full sm:w-auto bg-[#4b41e1] hover:bg-indigo-700 text-white font-bold rounded-xl h-[52px] md:h-[58px] px-6 md:px-8 text-sm md:text-base shadow-lg shadow-[#4b41e1]/20"
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
            >
              <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-white border border-emerald-200 p-8 md:p-12 text-center shadow-[0_20px_50px_rgba(16,185,129,0.1)]">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-6 md:space-y-8 flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner"
                  >
                    <CheckCircle size={32} md-size={48} className="text-emerald-500" />
                  </motion.div>

                  <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl font-black text-[#00000b] tracking-tighter">Cluster Ready</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Training cycle complete. The model is now available in your hub.</p>
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
                        className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 shadow-sm"
                      >
                        <stat.icon size={14} md-size={16} className="text-[#4b41e1] mb-2 mx-auto" />
                        <p className="text-[9px] md:text-[10px] uppercase font-bold text-slate-400 tracking-widest">{stat.label}</p>
                        <p className="text-xs md:text-sm font-black text-[#00000b] truncate px-1 md:px-2">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4b41e1] animate-pulse" />
                    <span className="text-[#4b41e1] font-bold text-xs md:text-sm">Redirecting to Dashboard...</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}