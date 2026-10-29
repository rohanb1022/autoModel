import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Cpu, Copy, CheckCircle, Terminal, Code2, Zap, LayoutDashboard, Download, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
        accuracy: latestModel.accuracy,
        targetColumn: latestModel.targetColumn,
        datasetId: latestModel.datasetId || latestModel._id
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

  const handleDownloadNotebook = () => {
    if (!generatedCode || !latestModel) return;

    const notebook = {
      nbformat: 4,
      nbformat_minor: 2,
      metadata: {
        language_info: { name: "python" },
        colab: { name: `${latestModel.datasetName}_model.ipynb`, provenance: [] }
      },
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# ${latestModel.bestModel} Training & Inference Notebook\n`,
            `- **Dataset:** \`${latestModel.datasetName}\`\n`,
            `- **Target Column:** \`${latestModel.targetColumn || "target"}\`\n`,
            `- **Problem Type:** \`${latestModel.problemType}\`\n`,
            `*Generated and verified via AutoModel Sandbox*`
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [
            "# Step 1: Install & import required libraries\n",
            "!pip install -q pandas numpy scikit-learn xgboost\n",
            "# Optional: If running in Google Colab, upload your CSV file:\n",
            "# from google.colab import files\n",
            "# uploaded = files.upload()\n"
          ]
        },
        {
          cell_type: "code",
          execution_count: null,
          metadata: {},
          outputs: [],
          source: [generatedCode]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const cleanName = (latestModel.datasetName || "model").replace(/\.[^/.]+$/, "");
    a.download = `${cleanName}_training.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
          <div className="p-6 rounded-full bg-slate-50 border border-slate-100 shadow-sm">
            <LayoutDashboard className="text-slate-400" size={48} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#00000b]">No Models Found</h2>
            <p className="text-slate-500 mt-2 font-medium">Train your first model to see deployment results.</p>
          </div>
          <button
            onClick={() => navigate("/upload")}
            className="px-8 py-3 bg-[#00000b] rounded-xl text-white font-bold hover:bg-slate-900 shadow-xl shadow-black/10 transition-all hover:scale-105 active:scale-95"
          >
            Train a Model
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6 md:space-y-8"
      >
        {/* HEADER SECTION */}
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-[#00000b] tracking-tight">Deployment & Code</h1>
          <p className="text-slate-500 font-medium text-xs md:text-sm">
            Production-ready script for your trained <span className="text-[#4b41e1] font-semibold">{latestModel.bestModel}</span>.
          </p>
        </motion.div>

        {/* METRICS ROW */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Dataset</p>
            <p className="text-lg md:text-xl font-black text-[#00000b] truncate" title={latestModel.datasetName}>
              {latestModel.datasetName}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#4b41e1]" />
              Target: <span className="text-[#00000b] font-bold">{latestModel.targetColumn || "Auto-detected"}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Optimal Model Architecture</p>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[#4b41e1]">
                <Cpu size={24} />
              </div>
              <div>
                <p className="text-lg md:text-xl font-black text-[#00000b]">{latestModel.bestModel}</p>
                <p className="text-xs text-slate-400 font-medium capitalize">{latestModel.problemType} task</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#4b41e1]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {latestModel.problemType === "clustering" ? "Silhouette Score" : "Accuracy Score"}
              </p>
              <div className="text-4xl md:text-5xl font-black text-[#00000b] tracking-tighter">
                {latestModel.problemType === "clustering" ? (
                  latestModel.accuracy.toFixed(3)
                ) : (
                  <>
                    {(latestModel.accuracy * 100).toFixed(1)}
                    <span className="text-[#4b41e1] text-2xl md:text-3xl">%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* GENERATOR SECTION */}
        <motion.div variants={itemVariants} className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-bold text-[#00000b] flex items-center gap-2">
              <Terminal size={18} className="text-[#4b41e1]" />
              Inference Code <span className="text-slate-400 font-medium text-xs md:text-sm ml-2">Python (scikit-learn)</span>
            </h2>
            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00000b] text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-bold hover:-translate-y-0.5 shadow-xl shadow-black/10 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? <Zap size={18} className="animate-spin text-[#4b41e1]" /> : <Code2 size={18} />}
              {loading ? "Verifying in Sandbox..." : "Generate & Verify Code"}
            </button>
          </div>

          <AnimatePresence>
            {generatedCode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      Sandbox Verified
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDownloadNotebook}
                      title="Download as Jupyter Notebook for Google Colab"
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#4b41e1] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Download size={14} className="text-[#4b41e1]" />
                      <span>Download .ipynb (Colab)</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#4b41e1] transition-colors"
                    >
                      {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span className="hidden xs:inline">{copied ? "Copied" : "Copy Source"}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-6 overflow-x-auto scrollbar-hide">
                  <pre className="font-mono text-xs md:text-sm leading-relaxed">
                    <code className="text-slate-700">
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
