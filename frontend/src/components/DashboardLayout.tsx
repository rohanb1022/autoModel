import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  LineChart,
  Brain,
  MessageSquare,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  AlertCircle
} from "lucide-react";
import logout from "../utils/logout";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Upload Dataset", url: "/upload", icon: Upload },
  { title: "Create Model", url: "/results", icon: BarChart3 },
  { title: "Visualizations", url: "/visualizations", icon: LineChart },
  { title: "AI Insights", url: "/insights", icon: Brain },
  { title: "Chat with Data", url: "/chatbot", icon: MessageSquare },
  { title: "System Messages", url: "/messages", icon: AlertCircle },
  { title: "Settings", url: "/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-['Inter'] relative overflow-hidden">
      
      {/* Global Dashboard Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] right-[10%] w-[800px] h-[500px] bg-gradient-to-br from-[#4b41e1]/5 to-transparent blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#e2dfff]/20 blur-[120px] rounded-full"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-xl shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100">
          <Sparkles className="h-6 w-6 text-[#4b41e1]" />
          <span className="text-xl font-bold tracking-tighter text-[#00000b]">Aether Intelligence</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${active
                  ? "bg-[#4b41e1]/10 text-[#4b41e1] shadow-sm"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <item.icon className={`h-4 w-4 ${active ? "text-[#4b41e1]" : "text-slate-400"}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-slate-100">
          <Link
            to="/"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col md:hidden shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-[#4b41e1]" />
                  <span className="text-xl font-bold tracking-tighter text-[#00000b]">Aether</span>
                </div>
                <button onClick={toggleMobileMenu} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const active = location.pathname === item.url;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      onClick={toggleMobileMenu}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${active
                        ? "bg-[#4b41e1]/10 text-[#4b41e1]"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-slate-100">
                <Link
                  to="/"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden relative z-10">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-white/50 bg-white/60 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#4b41e1] md:hidden" />
              <span className="font-bold text-[#00000b] tracking-tighter md:hidden">Aether</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#4b41e1]/10 flex items-center justify-center text-[#4b41e1] text-sm font-bold border border-[#4b41e1]/20 shadow-sm cursor-pointer hover:bg-[#4b41e1]/20 transition-colors">
              U
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="p-4 md:p-6 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

