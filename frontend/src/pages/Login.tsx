

"use client";

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import API from "@/api/axios";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
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
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-[#00000b] rounded-xl transition-transform group-hover:-rotate-12 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-[#00000b] uppercase">AutoModel</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-[#00000b]">Welcome Back</h1>
          <p className="text-slate-500 mt-2 font-medium">Enter your credentials to access the engine.</p>
        </div>

        <div className="rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white p-8 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-500 ml-1 font-bold text-xs uppercase tracking-widest">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  className="bg-white text-[#00000b] border-slate-200 pl-10 h-12 rounded-xl focus:ring-2 focus:ring-[#4b41e1]/30 focus:border-[#4b41e1] shadow-sm transition-all"
                  type="email"
                  placeholder="name@company.com"
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
            onClick={handleLogin}
            disabled={loading}
            className="w-full h-12 bg-[#00000b] text-white hover:bg-slate-900 rounded-xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest"><span className="bg-white px-3 text-slate-400">Or continue with</span></div>
          </div>

          <p className="text-center text-sm text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[#4b41e1] font-bold hover:text-indigo-700 underline underline-offset-4">
              Create one for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}