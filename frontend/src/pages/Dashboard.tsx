import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, TrendingUp, Box, ArrowUpRight, Plus, Activity } from "lucide-react";

// --- Pure CSS/Framer Motion Background (No Three.js needed) ---
function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#020202] overflow-hidden">
      {/* Animated Glowing Blobs */}
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
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
}

export default function Dashboard() {
  const [models, setModels] = useState([]);
  const [best, setBest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const res = await API.get("/models/my-models");
      console.log("[DASHBOARD] Raw API Data:", res.data);

      const dataWithIndex = res.data.map((item: any, index: number) => {
        // Handle potential field name variations (accuracy vs score)
        const rawAcc = item.accuracy !== undefined ? item.accuracy : item.score;
        const accuracy = parseFloat(rawAcc) || 0;
        return { ...item, index: index + 1, accuracy };
      });

      console.log("[DASHBOARD] Normalized Data:", dataWithIndex);
      setModels(dataWithIndex);

      if (dataWithIndex.length > 0) {
        const bestModel = dataWithIndex.reduce((prev: any, curr: any) => curr.accuracy > prev.accuracy ? curr : prev);
        setBest(bestModel);
      }
    } catch (err) {
      console.error("[DASHBOARD] Fetch Error:", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4 } }
  };

  return (
    <DashboardLayout>
      <AmbientBackground />

      <motion.div
        className="relative z-10 py-6 md:py-10 max-w-[1600px] mx-auto space-y-8 md:space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight italic">
              AUTO<span className="text-indigo-500 text-stroke-white">model</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-sm md:text-base">Intelligence monitoring & model deployment</p>
          </motion.div>

          <motion.div variants={cardVariants} className="flex flex-wrap gap-3 md:gap-4">
            <button className="flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-xl md:rounded-2xl text-white text-sm md:text-base font-semibold hover:bg-white/10 transition-all">
              Export
            </button>
            <button
              onClick={() => navigate("/upload")}
              className="flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-indigo-600 rounded-xl md:rounded-2xl text-white text-sm md:text-base font-bold hover:bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all">
              + New Training
            </button>
          </motion.div>
        </header>

        {/* STATS BENTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Accuracy Card */}
          <motion.div
            variants={cardVariants}
            className="sm:col-span-2 lg:row-span-2 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-purple-700 p-[1px]"
          >
            <div className="bg-[#080808] w-full h-full rounded-[1.95rem] md:rounded-[2.45rem] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden group min-h-[300px] md:min-h-[400px]">
              <div className="absolute top-0 right-0 p-6 md:p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy size={120} className="rotate-12 md:scale-150" />
              </div>

              <div>
                <span className="bg-indigo-500/20 text-indigo-400 text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full border border-indigo-500/30 uppercase tracking-widest">
                  Top Performance
                </span>
                <h2 className="text-2xl md:text-4xl font-bold text-white mt-4 md:mt-6 truncate">{best ? best.datasetName : "No Data"}</h2>
                <p className="text-gray-400 mt-1 md:mt-2 text-xs md:text-sm">Based on latest validation set</p>
              </div>

              <div className="mt-8 md:mt-12">
                <div className="flex items-end gap-1 md:gap-2">
                  <span className="text-7xl md:text-9xl font-black text-white leading-none tracking-tighter">
                    {best ? (best.accuracy * 100).toFixed(1) : "00"}
                  </span>
                  <span className="text-2xl md:text-4xl font-bold text-indigo-500 mb-2 md:mb-4">%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metric 1 */}
          <motion.div variants={cardVariants} className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:bg-white/[0.08] transition-colors">
            <Box className="text-indigo-500 mb-3 md:mb-4" size={28} />
            <h3 className="text-4xl md:text-5xl font-black text-white">{models.length}</h3>
            <p className="text-gray-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-1 md:mt-2">Active Models</p>
          </motion.div>

          {/* Metric 2 */}
          <motion.div variants={cardVariants} className="bg-white/5 border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:bg-white/[0.08] transition-colors">
            <TrendingUp className="text-emerald-500 mb-3 md:mb-4" size={28} />
            <h3 className="text-4xl md:text-5xl font-black text-white">
              {models.length > 0 ? (models.reduce((a, b: any) => a + b.accuracy, 0) / models.length * 100).toFixed(0) : 0}%
            </h3>
            <p className="text-gray-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-1 md:mt-2">Avg. Precision</p>
          </motion.div>

          {/* Tiny Chart Card */}
          <motion.div variants={cardVariants} className="sm:col-span-2 bg-[#080808] border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h4 className="text-white text-sm md:text-base font-bold flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Performance Flow</h4>
              <span className="text-gray-500 text-[10px] font-mono">LIVE_SYNC</span>
            </div>
            <div className="h-32 md:h-48 w-full -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={models}>
                  <Area type="monotone" dataKey="accuracy" stroke="#6366f1" fill="rgba(99, 102, 241, 0.1)" strokeWidth={3} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}