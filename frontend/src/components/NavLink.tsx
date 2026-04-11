"use client";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Process", href: "#how" },
  { name: "Testimonials", href: "#Testimonials" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 inset-x-0 z-[100] flex justify-center p-6 pointer-events-none">
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-5xl h-16 pointer-events-auto relative group"
      >
        {/* Animated Border Gradient - The "Glow" */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative h-full w-full bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-6 flex items-center justify-between">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group/logo">
            <div className="relative h-8 w-8 bg-white rounded-lg flex items-center justify-center transition-transform group-hover/logo:rotate-[15deg]">
              <Sparkles className="h-5 w-5 text-black" />
            </div>
            <span className="font-black text-sm uppercase tracking-[0.2em] hidden sm:block">
              AutoModel
            </span>
          </Link>

          {/* Center Links - Desktop */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors relative group/link"
              >
                {link.name}
                <motion.div className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity -z-10" />
              </a>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {localStorage.getItem("token") ? (
              <Link to="/dashboard">
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 h-10 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" className="text-zinc-400 hover:text-white text-[11px] uppercase font-bold tracking-widest">
                    Login
                  </Button>
                </Link>

                <Link to="/signup">
                  <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-10 text-[11px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-white"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-20 inset-x-0 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-black uppercase tracking-tighter hover:text-zinc-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </motion.div>
    </nav>
  );
}