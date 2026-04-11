// import DashboardLayout from "@/components/DashboardLayout";
// import { Target, Cpu, Database, CheckCircle } from "lucide-react";

// const results = [
//   { label: "Target Column", value: "churn", icon: Target },
//   { label: "Problem Type", value: "Binary Classification", icon: Database },
//   { label: "Best Model", value: "Random Forest", icon: Cpu },
//   { label: "Accuracy Score", value: "94.7%", icon: CheckCircle },
// ];

// export default function Results() {
//   return (
//     <DashboardLayout>
//       <div className="space-y-8">
//         <div>
//           <h1 className="text-2xl font-bold text-white tracking-tight">Model Results</h1>
//           <p className="text-sm text-muted-foreground mt-1">Performance summary of the best trained model.</p>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white">
//           {results.map((r) => (
//             <div key={r.label} className="glass rounded-xl p-6 flex items-start gap-4">
//               <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//                 <r.icon className="h-5 w-5 text-primary" />
//               </div>
//               <div>
//                 <p className="text-xs text-muted-foreground font-medium">{r.label}</p>
//                 <p className="text-xl font-bold mt-1">{r.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//         <div className="glass rounded-xl text-white p-6">
//           <h2 className="font-semibold mb-4">Model Comparison</h2>
//           <div className="space-y-3">
//             {[
//               { name: "Random Forest", acc: 94.7 },
//               { name: "XGBoost", acc: 93.2 },
//               { name: "Logistic Regression", acc: 88.5 },
//               { name: "SVM", acc: 86.1 },
//             ].map((m) => (
//               <div key={m.name} className="flex items-center gap-4">
//                 <span className="text-sm w-40 text-muted-foreground">{m.name}</span>
//                 <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
//                   <div className="h-full rounded-full bg-primary" style={{ width: `${m.acc}%` }} />
//                 </div>
//                 <span className="text-sm font-medium w-14 text-right">{m.acc}%</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// }



import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Cpu, Copy, CheckCircle, Terminal, Code2, Zap, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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

export default function Results() {
  const [latestModel, setLatestModel] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLatestModel();
  }, []);

  const fetchLatestModel = async () => {
    try {
      const res = await API.get("/models/my-models");
      if (res.data.length > 0) {
        const item = res.data[0];
        const rawAcc = item.accuracy !== undefined ? item.accuracy : item.score;
        const accuracy = parseFloat(rawAcc) || 0;
        setLatestModel({ ...item, accuracy });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleGenerateCode = async () => {
    if (!latestModel) return;

    try {
      setLoading(true);
      const res = await API.post("/models/generate-code", {
        datasetName: latestModel.datasetName,
        problemType: latestModel.problemType,
        bestModel: latestModel.bestModel,
        accuracy: latestModel.accuracy
      });
      setGeneratedCode(res.data.code);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (!latestModel) {
    return (
      <DashboardLayout>
        <AmbientBackground />
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-white/5 border border-white/10">
            <LayoutDashboard className="text-gray-500" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">No Models Found</h2>
            <p className="text-gray-400 mt-2">Train your first model to see deployment results.</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="px-8 py-3 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-500 transition-all"
          >
            Start Training
          </button>
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
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500 font-mono text-[10px] md:text-xs tracking-widest uppercase">System Ready</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tight italic uppercase">
              DEPLOYMENT <span className="text-indigo-500 text-stroke-white">HUB</span>
            </h1>
            <p className="text-gray-400 font-medium mt-2 max-w-lg text-sm md:text-base">
              Generate production-ready inference code for your optimized, high-performance models.
            </p>
          </div>
        </motion.div>

        {/* MODEL CARD */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/10 p-6 md:p-8 group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 shrink-0">
              <Cpu className="text-white" size={32} md-size={40} />
            </div>

            <div className="flex-1 text-center md:text-left overflow-hidden w-full">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2 truncate">{latestModel.datasetName}</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3">
                <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300">
                  {latestModel.problemType}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                  {latestModel.bestModel}
                </span>
              </div>
            </div>

            <div className="text-center bg-white/5 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none w-full md:w-auto border border-white/5 md:border-none">
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-1">Accuracy Score</p>
              <div className="text-4xl md:text-5xl font-black text-white">
                {(latestModel.accuracy * 100).toFixed(1)}<span className="text-indigo-500 text-2xl md:text-3xl">%</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* GENERATOR SECTION */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <Terminal size={18} md-size={20} className="text-indigo-500" />
              Inference Code <span className="text-gray-500 font-normal text-xs md:text-sm ml-2">Python (scikit-learn)</span>
            </h2>
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Zap size={18} className="animate-spin" /> : <Code2 size={18} />}
              {loading ? "Compiling..." : "Generate Code"}
            </button>
          </div>

          <AnimatePresence>
            {generatedCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    <span className="hidden xs:inline">{copied ? "Copied" : "Copy Source"}</span>
                  </button>
                </div>

                <div className="p-4 md:p-6 overflow-x-auto scrollbar-hide">
                  <pre className="font-mono text-xs md:text-sm leading-relaxed">
                    <code className="text-gray-300">
                      {generatedCode}
                    </code>
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
