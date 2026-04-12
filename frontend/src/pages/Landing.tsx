import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import LocomotiveScroll from 'locomotive-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Target,
  ArrowRight,
  Sparkles,
  Layers,
  BrainCircuit,
  BarChart3,
  Fingerprint,
  Cpu
} from 'lucide-react';
import Hero3DModel from '../components/Hero3DModel';


const Landing = () => {
  useEffect(() => {
    const locomotiveScroll = new LocomotiveScroll();
    return () => locomotiveScroll.destroy();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <div className="bg-white text-[#1a1c1c] selection:bg-[#645efb]/30 overflow-x-hidden font-['Inter']">
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes breathe-alt {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -12px); }
        }
        @keyframes drift {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(10px, -5px) rotate(1deg); }
          66% { transform: translate(-5px, 10px) rotate(-1deg); }
        }
        @keyframes hero-mesh-float {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.1) rotate(5deg); opacity: 0.7; }
        }
        .hero-mesh { animation: hero-mesh-float 12s ease-in-out infinite; filter: blur(50px); }
        .floating-preview { animation: breathe 5s ease-in-out infinite; }
        .floating-slow { animation: breathe 8s ease-in-out infinite; }
        .floating-medium { animation: breathe 5.5s ease-in-out infinite; }
        .floating-fast { animation: breathe 4s ease-in-out infinite; }
        .floating-alt { animation: breathe-alt 6s ease-in-out infinite; }
        .floating-drift { animation: drift 10s ease-in-out infinite; }
        .reveal-item { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal-item.is-visible { opacity: 1; transform: translateY(0); }
        .glass-card { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 10px 30px -5px rgba(0,0,0,0.05); }
        .node-dot { width: 8px; height: 8px; border-radius: 999px; background: #4b41e1; box-shadow: 0 0 15px rgba(75, 65, 225, 0.5); }
      `}</style>

      {/* TopNavBar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-2xl shadow-slate-900/5"
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20">
          <div className="text-xl font-bold tracking-tighter text-slate-900">
            Aether Intelligence
          </div>
          <div className="hidden md:flex items-center space-x-10">
            <a className="text-[#4b41e1] font-bold border-b-2 border-[#4b41e1] transition-all duration-300 ease-out hover:-translate-y-0.5" href="#platform">Platform</a>
            <a className="text-slate-600 hover:text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5" href="#process">Process</a>
            <a className="text-slate-600 hover:text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5" href="#case-studies">Case Studies</a>
            <a className="text-slate-600 hover:text-slate-900 transition-all duration-300 ease-out hover:-translate-y-0.5" href="#solutions">Solutions</a>
          </div>
          <Link to={localStorage.getItem("token") ? "/dashboard" : "/signup"}>
            <button className="bg-[#00000b] text-white px-6 py-2.5 border border-[#00000b] rounded-full font-semibold hover:-translate-y-1 transition-all duration-300  shadow-black/10">
              Get Started
            </button>
          </Link>
        </div>
      </motion.nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 px-6 overflow-hidden" style={{ minHeight: '100vh' }}>
          <Hero3DModel />

          <div className="absolute top-[35%] left-[5%] floating-slow hidden xl:block">
            <div className="glass-card p-3 rounded-lg flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#4b41e1]"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Syncing...</span>
            </div>
          </div>

          <div className="absolute top-40 left-[10%] floating-slow"><div className="node-dot"></div></div>
          <div className="absolute top-60 right-[15%] floating-medium"><div className="node-dot opacity-40"></div></div>

          {/* New Aesthetic Floating Elements */}
          <div className="absolute top-[15%] right-[25%] floating-drift hidden lg:block opacity-80 z-10">
            <div className="w-24 h-24 rounded-full border border-[#4b41e1]/20 bg-gradient-to-tr from-[#4b41e1]/5 to-transparent backdrop-blur-sm"></div>
          </div>
          <div className="absolute bottom-[20%] left-[20%] floating-alt hidden md:block opacity-70">
            <div className="w-48 h-48 rounded-full bg-[#4b41e1]/10 blur-3xl"></div>
          </div>
          <div className="absolute top-[45%] right-[8%] floating-fast opacity-90 z-20">
            <div className="w-44 h-14 rounded-2xl rotate-12 border border-slate-100 bg-white/60 backdrop-blur-md shadow-2xl shadow-indigo-500/10 flex items-center justify-center text-[#4b41e1]">
              <span className="material-symbols-outlined text-xl">model_training</span>
            </div>
          </div>
          <div className="absolute bottom-[30%] right-[22%] floating-slow opacity-60">
            <div className="w-3 h-3 rounded-full bg-[#e2dfff] shadow-[0_0_20px_#4b41e1]"></div>
          </div>

          <motion.div
            className="max-w-5xl mx-auto text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100 text-[#4b41e1] text-xs font-bold tracking-widest uppercase shadow-sm">
              Revolutionizing Knowledge Retrieval
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold text-[#00000b] mb-8 max-w-4xl mx-auto leading-[1.1] tracking-tight">
              The Archive of Intelligence, <br />
              <span className="text-[#4b41e1] bg-clip-text text-transparent bg-gradient-to-r from-[#4b41e1] to-[#7f77f1]">Rendered Weightless.</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-600 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Aether transforms unstructured data into a high-performance vector gallery, delivering insights with academic precision and fluid sophistication.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
              <Link to={localStorage.getItem("token") ? "/dashboard" : "/signup"}>
                <button className="bg-[#00000b] text-white px-8 py-4 rounded-full font-bold text-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#4b41e1]/20 transition-all duration-300 shadow-xl shadow-black/10">
                  Get Started
                </button>
              </Link>
              <button className="border border-slate-200 text-[#00000b] px-8 py-4 rounded-full font-bold text-lg hover:bg-slate-50 hover:-translate-y-1.5 transition-all duration-300">
                View Documentation
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="relative max-w-6xl mx-auto">
              <div className="floating-preview">
                <div className="bg-white rounded-2xl shadow-[0_40px_100px_rgba(75,65,225,0.12)] border border-slate-100 p-2 md:p-4 overflow-hidden group">
                  <div className="relative w-full aspect-[16/10] md:aspect-[21/9] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt="Dashboard Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00000b]/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-32 bg-slate-50 relative overflow-hidden" id="platform">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-20 text-center md:text-left">
              <h2 className="text-xs font-bold text-[#4b41e1] uppercase tracking-[0.3em] mb-4">Core Platform</h2>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#00000b] tracking-tight">Built for the High-End <br />Tech Ecosystem.</h3>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: <BrainCircuit className="w-6 h-6" />,
                  title: "Dimensional Search",
                  desc: "Navigate through terabytes of data using semantic mapping that understands context, not just keywords.",
                  color: "bg-indigo-500/10 text-indigo-600"
                },
                {
                  icon: <Fingerprint className="w-6 h-6" />,
                  title: "Encrypted Latency",
                  desc: "End-to-end zero-knowledge encryption ensures your proprietary models remain private and untraceable.",
                  color: "bg-slate-900/10 text-slate-900"
                },
                {
                  icon: <Cpu className="w-6 h-6" />,
                  title: "Neural Synchrony",
                  desc: "Real-time sync between your global database and LLM endpoints with sub-10ms response cycles.",
                  color: "bg-orange-500/10 text-orange-600"
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_20px_40px_rgba(75,65,225,0.08)] transition-all duration-500 group"
                >
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-black mb-4 text-2xl tracking-tighter text-[#00000b]">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed text-lg font-medium">{feature.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-32 bg-white" id="process">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="lg:w-1/3">
                <h2 className="text-xs font-bold text-[#4b41e1] uppercase tracking-widest mb-6">Our Process</h2>
                <h3 className="text-5xl font-extrabold text-[#00000b] mb-8 leading-tight">How We <br />Orchestrate.</h3>
                <p className="text-slate-500 text-lg">We treat every integration as a curated exhibition of your data's potential.</p>
              </div>
              <motion.div
                className="lg:w-2/3 space-y-16"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {[
                  { id: '01', title: 'Ingestion & Distillation', desc: 'Raw datasets are purified and structured through our proprietary neural filters.' },
                  { id: '02', title: 'Vector Synthesis', desc: 'Information is mapped into a multi-dimensional archive where relationships are defined.' },
                  { id: '03', title: 'Infinite Deployment', desc: 'Deploy your weightless archive to any endpoint, from mobile to enterprise clusters.' }
                ].map((step, idx) => (
                  <motion.div key={idx} className="flex gap-8 group" variants={itemVariants}>
                    <span className="text-7xl md:text-8xl font-black text-slate-100 group-hover:text-[#4b41e1] transition-colors duration-500 tracking-tighter shrink-0">{step.id}</span>
                    <div className="pt-6 border-t border-slate-100 w-full">
                      <h4 className="text-2xl font-black mb-3 tracking-tight text-[#00000b]">{step.title}</h4>
                      <p className="text-slate-500 text-lg font-medium max-w-xl leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA */}
        <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto bg-[#00000b] text-white rounded-3xl p-12 md:p-24 relative overflow-hidden text-center">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-8">Ready to lighten your <br />data's load?</h2>
              <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-12">Join 200+ enterprise teams currently building on the Aether Intelligence framework.</p>
              <div className="max-w-md mx-auto">
                <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input className="flex-1 bg-white/10 border-b border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-[#4b41e1] px-4 py-4 rounded-lg" placeholder="Enter your work email" type="email" />
                  <button className="bg-[#4b41e1] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#4b41e1]/90 transition-all">Join the Archive</button>
                </form>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#4b41e1]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </section>
      </main>

      <footer className="bg-white w-full border-t border-slate-100 py-20 px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-lg font-bold text-slate-900 mb-4">Aether Intelligence</div>
          <p className="text-slate-400 text-xs tracking-widest uppercase font-semibold">© 2026 Aether Intelligence. Built for the Weightless Archive.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;