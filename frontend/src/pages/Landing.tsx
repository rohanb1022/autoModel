// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Sparkles,
//   ArrowRight,
//   Zap,
//   Brain,
//   BarChart3,
//   MessageSquare,
//   Upload,
//   Shield,
//   Github,
//   Linkedin,
//   Mail,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import HowItWorks from "@/components/steps";
// import Testimonials from "@/components/testimonials";
// import Footer from "@/components/Footer";
// import CTA from "@/components/CTA";


// const fadeUp = {
//   hidden: { opacity: 0, y: 24 },
//   visible: (i: number) => ({
//     opacity: 1,
//     y: 0,
//     transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const },
//   }),
// };

// const features = [
//   { icon: Zap, title: "Auto ML Training", desc: "Upload data and let AI train, compare, and select the best model automatically." },
//   { icon: Brain, title: "AI-Powered Insights", desc: "Get intelligent summaries, key findings, and actionable recommendations." },
//   { icon: Shield, title: "Data Cleaning", desc: "Automated preprocessing: handle missing values, outliers, and encoding." },
//   { icon: BarChart3, title: "Interactive Dashboard", desc: "Visualize distributions, correlations, and model performance in real-time." },
//   { icon: MessageSquare, title: "Chat with Data", desc: "Ask questions about your dataset in natural language and get instant answers." },
//   { icon: Upload, title: "One-Click Upload", desc: "Drag & drop your CSV and start building models in seconds." },
// ];

// const steps = [
//   { num: "01", title: "Upload Dataset", desc: "Drag and drop your CSV file — we handle the rest." },
//   { num: "02", title: "AI Trains Models", desc: "AutoModel cleans data, engineers features, and trains multiple models." },
//   { num: "03", title: "Get Insights", desc: "View accuracy scores, charts, AI insights, and chat with your data." },
// ];

// const testimonials = [
//   { name: "Sarah Chen", role: "ML Engineer at Stripe", text: "AutoModel Builder cut our prototyping time by 80%. The automated feature engineering is genuinely impressive." },
//   { name: "Marcus Johnson", role: "Startup Founder", text: "I'm not a data scientist, but AutoModel let me build predictive models for our product in minutes. Game changer." },
//   { name: "Priya Sharma", role: "Data Analyst", text: "The chat-with-data feature is incredible. I ask questions in plain English and get instant, accurate answers." },
// ];

// export default function Landing() {
//   return (
//     <div className="min-h-screen bg-background text-foreground">

//       {/* Nav */}
//       <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
//         <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
//           <div className="flex items-center gap-2">
//             <Sparkles className="h-5 w-5 text-primary" />
//             <span className="font-bold text-lg tracking-tight">AutoModel Builder</span>
//           </div>
//           <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
//             <a href="#features" className="hover:text-foreground transition-colors">Features</a>
//             <a href="#how" className="hover:text-foreground transition-colors">How It Works</a>
//             <a href="#Testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
//           </div>
//           <div className="flex items-center gap-3">
//             <Link to="/login">
//               <Button variant="ghost" size="sm">Log in</Button>
//             </Link>
//             <Link to="/signup">
//               <Button size="sm">Get Started</Button>
//             </Link>
//           </div>
//         </div>
//       </nav>


//       {/* Hero section */}
//       <section className="h-screen flex items-center justify-center">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-center mb-16">
//             <h2 className="text-6xl md:text-6xl font-bold tracking-tight mb-4">
//               Everything you need to build ML models
//             </h2>
//             <p className="text-muted-foreground max-w-xl mx-auto text-2xl">
//               From data upload to production-ready insights — AutoModel handles the entire pipeline.
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Spacer for fixed nav */}
//       <div className="pt-20" />

//       {/* Features */}
//       <section id="features" className="py-24 px-6 ">
//         <div className="max-w-6xl mx-auto">
//           {/* <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
//               Everything you need to build ML models
//             </h2>
//             <p className="text-muted-foreground max-w-xl mx-auto">
//               From data upload to production-ready insights — AutoModel handles the entire pipeline.
//             </p>
//           </div> */}
//           <div className="text-center mb-16">
//             <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
//               Features
//             </h2>
//             <p className="text-muted-foreground max-w-xl mx-auto">
//               From data upload to production-ready insights — AutoModel handles the entire pipeline.
//             </p>
//           </div>
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {features.map((f, i) => (
//               <motion.div
//                 key={f.title}
//                 initial="hidden"
//                 whileInView="visible"
//                 viewport={{ once: true }}
//                 variants={fadeUp}
//                 custom={i}
//                 className="glass rounded-xl p-6 hover:border-primary/30 transition-colors group"
//               >
//                 <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
//                   <f.icon className="h-5 w-5 text-primary" />
//                 </div>
//                 <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
//                 <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>


//       <HowItWorks />

//       <Testimonials />

//       <CTA />

//       {/* Footer */}
//       <Footer />
//     </div>
//   );
// }


"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Github, Linkedin, Mail, Twitter, Zap, Brain, Shield, BarChart3, MessageSquare, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import HowItWorks from "@/components/steps";
import Testimonials from "@/components/testimonials";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Navbar from "@/components/NavLink";

// High-end animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0, filter: "blur(10px)" },
  visible: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

export default function Landing() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Springy scale for the background reveal
  const scale = useSpring(useTransform(scrollYProgress, [0, 0.2], [1, 0.95]), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#050505] text-white selection:bg-white selection:text-black overflow-hidden">

      {/* --- MOUSE SPOTLIGHT (Optional: Requires a simple hook or CSS) --- */}
      <div className="pointer-events-none fixed inset-0 z-30 transition duration-300 lg:bg-[radial-gradient(600px_at_50%_50%,rgba(255,255,255,0.03),transparent)]" />

      {/* --- NAV --- */}
      {/* <nav className="fixed top-0 w-full z-[100] border-b border-white/5 bg-black/50 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="p-2 bg-white rounded-lg">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">AutoModel</span>
          </motion.div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            {["features", "how", "testimonials"].map((item) => (
              <a key={item} href={`#${item}`} className="hover:text-white transition-all duration-300">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-zinc-400 hover:text-white">Login</Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Launch App
              </Button>
            </Link>
          </div>
        </div>
      </nav> */}
      <Navbar />

      {/* --- HERO SECTION --- */}
      <motion.section
        style={{ scale }}
        className="relative h-screen flex flex-col items-center justify-center pt-20"
      >
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/5 to-transparent blur-[120px] -z-10" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center px-6 max-w-5xl"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Next-Gen AutoML Platform
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-8xl lg:text-[110px] font-black tracking-tight leading-[0.9] mb-6 md:mb-8">
            PREDICTIVE AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20">
              FOR EVERYONE.
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-zinc-500 text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-4">
            Turn messy datasets into production-ready machine learning models in minutes. No code, just performance.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {localStorage.getItem("token") ? (
              <Link to="/dashboard">
                <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black text-lg font-bold hover:scale-105 transition-transform">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="h-16 px-10 rounded-full bg-white text-black text-lg font-bold hover:scale-105 transition-transform">
                    Start Building <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full border-white/10 hover:bg-white/5 text-lg">
                  View Demo
                </Button>
              </>
            )}
          </motion.div>
        </motion.div>
      </motion.section>

      {/* --- FEATURES (BENTO GRID) --- */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">CORE POWER.</h2>
            <p className="text-zinc-500 mt-4 text-lg">The engine under the hood of AutoModel Builder.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
            {/* Feature 1 - Large Bento */}
            <BentoCard
              className="md:col-span-6 lg:col-span-8 bg-zinc-900/50"
              icon={<Zap className="text-white" />}
              title="Auto ML Training"
              desc="Our engine evaluates 50+ algorithms simultaneously to pick the absolute best model for your specific data."
            />
            {/* Feature 2 - Small Bento */}
            <BentoCard
              className="md:col-span-6 lg:col-span-4 bg-white text-black"
              icon={<Brain className="text-black" />}
              title="AI Insights"
              desc="Natural language explanations for complex model weights."
              light
            />
            {/* Feature 3 - Small Bento */}
            <BentoCard
              className="md:col-span-3 lg:col-span-4 border border-white/10"
              icon={<Shield className="text-white" />}
              title="Data Guard"
              desc="Automated outlier detection and PII scrubbing."
            />
            {/* Feature 4 - Small Bento */}
            <BentoCard
              className="md:col-span-3 lg:col-span-4 border border-white/10"
              icon={<MessageSquare className="text-white" />}
              title="Chat with Data"
              desc="Query your CSV files using plain English."
            />
            {/* Feature 5 - Mid Bento */}
            <BentoCard
              className="md:col-span-6 lg:col-span-4 bg-zinc-900/50"
              icon={<BarChart3 className="text-white" />}
              title="Interactive UI"
              desc="Real-time visualization of model convergence."
            />
          </div>
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

// Custom Bento Card Component
function BentoCard({ icon, title, desc, className, light = false }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-[2rem] p-8 flex flex-col justify-between min-h-[300px] transition-colors ${className}`}
    >
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${light ? 'bg-black/5' : 'bg-white/5 border border-white/10'}`}>
        {icon}
      </div>
      <div>
        <h3 className={`text-2xl font-black tracking-tight mb-2 ${light ? 'text-black' : 'text-white'}`}>{title}</h3>
        <p className={`text-sm leading-relaxed ${light ? 'text-black/60' : 'text-zinc-500'}`}>{desc}</p>
      </div>
    </motion.div>
  );
}