import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import API from "@/api/axios";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Zap, TrendingUp, Box, ArrowUpRight, Plus, Activity } from "lucide-react";

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

      <motion.div
        className="relative z-10 py-6 md:py-10 max-w-[1600px] mx-auto space-y-8 md:space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* TOP BAR */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
          <motion.div variants={cardVariants}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#00000b] tracking-tighter">
              Aether<span className="text-[#4b41e1]">Intelligence</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Global intelligence monitoring & model deployment</p>
          </motion.div>

          <motion.div variants={cardVariants} className="flex flex-wrap gap-3 md:gap-4">
            <button className="flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-white border border-slate-200 rounded-full text-slate-600 text-sm md:text-base font-bold hover:bg-slate-50 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              Export Report
            </button>
            <button
              onClick={() => navigate("/upload")}
              className="flex-1 md:flex-none px-5 md:px-6 py-2.5 md:py-3 bg-[#00000b] rounded-full text-white text-sm md:text-base font-bold hover:-translate-y-1 shadow-xl shadow-black/10 transition-all duration-300">
              + New Training
            </button>
          </motion.div>
        </header>

        {/* STATS BENTO GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Accuracy Card */}
          <motion.div
            variants={cardVariants}
            className="sm:col-span-2 lg:row-span-2 rounded-[2rem] md:rounded-[2.5rem] bg-white p-[1px] shadow-[0_20px_50px_rgba(75,65,225,0.05)] border border-slate-100 group"
          >
            <div className="w-full h-full rounded-[1.95rem] md:rounded-[2.45rem] p-6 md:p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white to-slate-50 min-h-[300px] md:min-h-[400px]">
              <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={120} className="rotate-12 md:scale-150 text-[#00000b]" />
              </div>

              <div>
                <span className="bg-[#4b41e1]/10 text-[#4b41e1] text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full border border-[#4b41e1]/20 uppercase tracking-[0.2em]">
                  Top Performance
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-[#00000b] mt-6 truncate tracking-tight">{best ? best.datasetName : "No Data"}</h2>
                <p className="text-slate-500 mt-2 text-xs md:text-sm font-medium">Based on latest validation set</p>
              </div>

              <div className="mt-8 md:mt-12 group-hover:scale-[1.02] transition-transform origin-bottom-left duration-500">
                <div className="flex items-end gap-1 md:gap-2">
                  <span className="text-7xl md:text-[8rem] font-black text-[#00000b] leading-none tracking-tighter">
                    {best ? (best.accuracy * 100).toFixed(1) : "00"}
                  </span>
                  <span className="text-2xl md:text-4xl font-bold text-[#4b41e1] mb-2 md:mb-5">%</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metric 1 */}
          <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4b41e1]/5 transition-all duration-300 shadow-sm">
            <div className="w-12 h-12 bg-[#4b41e1]/10 rounded-2xl flex items-center justify-center text-[#4b41e1] mb-6">
              <Box size={24} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-[#00000b] tracking-tighter">{models.length}</h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-2">Active Models</p>
          </motion.div>

          {/* Metric 2 */}
          <motion.div variants={cardVariants} className="bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 shadow-sm">
             <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-[#00000b] tracking-tighter">
              {models.length > 0 ? (models.reduce((a, b: any) => a + b.accuracy, 0) / models.length * 100).toFixed(0) : 0}%
            </h3>
            <p className="text-slate-500 font-bold uppercase text-[10px] md:text-xs tracking-widest mt-2">Avg. Precision</p>
          </motion.div>

          {/* Tiny Chart Card */}
          <motion.div variants={cardVariants} className="sm:col-span-2 bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.03)] transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[#00000b] text-sm md:text-base font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"><Zap size={14} /></div>
                 Performance Flow
              </h4>
              <span className="text-[#4b41e1] bg-[#4b41e1]/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest">LIVE_SYNC</span>
            </div>
            <div className="h-32 md:h-48 w-full -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={models}>
                  <Area type="monotone" dataKey="accuracy" stroke="#4b41e1" fill="rgba(75, 65, 225, 0.05)" strokeWidth={4} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    itemStyle={{ color: '#00000b', fontWeight: 'bold' }}
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