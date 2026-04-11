// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import API from "@/api/axios";
// import { toast } from "sonner";

// export default function Signup() {

//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSignup = async () => {
//     try {
//       setLoading(true);

//       const res = await API.post("/auth/register", {
//         name,
//         email,
//         password
//       });

//       // save token
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));

//       toast.success("Account created!");
//       navigate("/dashboard");

//     } catch (err) {
//       toast.error(err.response?.data?.message || "Signup failed");
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
//           <h1 className="text-2xl font-bold tracking-tight text-foreground">Create your account</h1>
//           <p className="text-sm text-muted-foreground mt-1">
//             Start building ML models in seconds
//           </p>
//         </div>

//         <div className="glass rounded-xl text-white p-6 space-y-4">

//           <div className="space-y-2">
//             <Label>Name</Label>
//             <Input
//               placeholder="Your name"
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//             />
//           </div>

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
//             onClick={handleSignup}
//             disabled={loading}
//             className="w-full mt-2"
//           >
//             {loading ? "Creating..." : "Create Account"}
//           </Button>

//           <p className="text-center text-xs text-muted-foreground">
//             Already have an account?{" "}
//             <Link to="/login" className="text-primary hover:underline">
//               Sign in
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030303] p-6">
      {/* --- NEON AURORA BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full animate-aurora" />
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] bg-purple-500/10 blur-[150px] rounded-full animate-aurora" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="p-2 bg-white rounded-xl transition-all group-hover:scale-110">
              <Sparkles className="h-6 w-6 text-black" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white uppercase">AutoModel</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Join the Future</h1>
          <p className="text-zinc-500 mt-2">Start building ML models in seconds.</p>
        </div>

        <div className="glass-card rounded-[2.5rem] p-8 space-y-5">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 ml-1">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  className="bg-white/5 text-white border-white/10 pl-10 h-12 rounded-xl focus:border-cyan-500 transition-all"
                  placeholder="Rohan Bhangale"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  className="bg-white/5 text-white border-white/10 pl-10 h-12 rounded-xl focus:border-cyan-500 transition-all"
                  type="email"
                  placeholder="rohan@example.com"
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
                  className="bg-white/5 text-white border-white/10 pl-10 h-12 rounded-xl focus:border-cyan-500 transition-all"
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
            className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <span className="flex items-center gap-2">
                Launch Account <Rocket className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            )}
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Already a member?{" "}
            <Link to="/login" className="text-cyan-400 font-bold hover:text-cyan-300">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}