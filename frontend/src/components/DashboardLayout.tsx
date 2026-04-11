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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-sidebar shrink-0">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">AutoModel</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <Link
            to="/"
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold tracking-tight">AutoModel</span>
                </div>
                <button onClick={toggleMobileMenu} className="p-1 rounded-lg hover:bg-secondary transition-colors">
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-3 py-4 border-t border-border">
                <Link
                  to="/"
                  onClick={() => {
                    logout();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Toggle Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary md:hidden" />
              <span className="font-bold text-foreground md:hidden">AutoModel</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold border border-primary/20">
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

