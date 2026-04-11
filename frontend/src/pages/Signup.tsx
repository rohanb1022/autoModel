

"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, User, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "@/api/axios";
import { toast } from "sonner";

export default function Signup() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Account activated!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-50 p-6">
      {/* --- AETHER BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-[#4b41e1]/10 blur-[120px] rounded-full mix-blend-multiply opacity-70 animate-breathe" />
        <div className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-purple-500/10 blur-[120px] rounded-full mix-blend-multiply opacity-50 animate-breathe" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 bg-[#eef2f6]/40 backdrop-blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-[#00000b] rounded-xl transition-all group-hover:scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#00000b] uppercase">AutoModel</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-[#00000b]">Join the Future</h1>
          <p className="text-slate-500 mt-2 font-medium">Start building ML models in seconds.</p>
        </div>

        <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white p-8 space-y-5 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="bg-white text-[#00000b] border-slate-200 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm transition-all"
                  placeholder="Rohan Bhangale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="bg-white text-[#00000b] border-slate-200 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm transition-all"
                  type="email"
                  placeholder="rohan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="bg-white text-[#00000b] border-slate-200 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm transition-all"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            onClick={handleSignup}
            disabled={loading}
            className="w-full h-14 bg-[#00000b] text-white hover:bg-slate-900 rounded-xl font-bold text-lg shadow-xl shadow-black/10 transition-all active:scale-95 group"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : (
              <span className="flex items-center gap-2">
                Launch Account <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-slate-500 font-medium">
            Already a member?{" "}
            <Link to="/login" className="text-[#4b41e1] font-bold hover:text-indigo-700 underline underline-offset-4">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}