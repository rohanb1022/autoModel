// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import API from "@/api/axios";
// import { toast } from "sonner";

// export default function Login() {

//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);



//   const handleLogin = async () => {
//     try {
//       setLoading(true);

//       const res = await API.post("/auth/login", {
//         email,
//         password
//       });

//       // save token
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       toast.success("Login successful!");
//       // go dashboard
//       navigate("/dashboard");

//     } catch (err) {
//       toast.error(err.response?.data?.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background grid-bg flex items-center justify-center p-6">
//       <div className="w-full max-w-sm">
//         <div className="text-center mb-8">
//           <Link to="/" className="inline-flex items-center gap-2 mb-6">
//             <Sparkles className="h-6 w-6 text-primary" />
//             <span className="text-xl font-bold tracking-tight text-foreground">AutoModel</span>
//           </Link>
//           <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
//           <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
//         </div>

//         <div className="glass rounded-xl text-white p-6 space-y-4">

//           <div className="space-y-2">
//             <Label>Email</Label>
//             <Input
//               type="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label>Password</Label>
//             <Input
//               type="password"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//           </div>

//           <Button
//             onClick={handleLogin}
//             disabled={loading}
//             className="w-full mt-2"
//           >
//             {loading ? "Signing in..." : "Sign In"}
//           </Button>

//           <p className="text-center text-xs text-muted-foreground">
//             Don't have an account?{" "}
//             <Link to="/signup" className="text-primary hover:underline">
//               Sign up
//             </Link>
//           </p>

//         </div>
//       </div>
//     </div>
//   );
// }


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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] p-6">
      {/* --- NEON AURORA BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full animate-aurora [animation-direction:reverse]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-white rounded-xl transition-transform group-hover:rotate-12">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">AutoModel</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-zinc-500 mt-2">Enter your credentials to access the engine.</p>
        </div>

        <div className="glass-card rounded-[2rem] p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 ml-1">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  className="bg-white/5 text-white  border-white/10 pl-10 h-12 rounded-xl focus:ring-purple-500 transition-all"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  className="bg-white/5 text-white  border-white/10 pl-10 h-12 rounded-xl focus:ring-purple-500 transition-all"
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
            className="w-full h-12 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-lg transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0b0b0b] px-2 text-zinc-500">Or continue with</span></div>
          </div>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-white font-bold hover:underline underline-offset-4">
              Create one for free
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}