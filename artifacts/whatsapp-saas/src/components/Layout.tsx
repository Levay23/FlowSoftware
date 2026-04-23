import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Smartphone,
  Users,
  Bot,
  Brain,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  Zap,
  ShieldCheck,
  X,
  User,
} from "lucide-react";
import Logo from "./Logo";

const navItems = [
  { path: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { path: "/whatsapp", label: "WhatsApp", icon: Smartphone },
  { path: "/contacts", label: "Contactos", icon: Users },
  { path: "/chatbot", label: "Asistente Virtual", icon: Bot },
  { path: "/training", label: "Conocimiento", icon: Brain },
  { path: "/chat", label: "Mensajería", icon: MessageCircle },
  { path: "/settings", label: "Configuración", icon: Settings },
];

const adminNavItems = [
  { path: "/admin/users", label: "Administración", icon: ShieldCheck },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoExpiresAt = user?.isDemo && user.demoExpiresAt ? new Date(user.demoExpiresAt) : null;
  const allNavItems = [...navItems, ...(user?.role === "admin" || user?.role === "moderator" ? adminNavItems : [])];

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const renderNav = () => (
    <div className="space-y-1.5">
      {demoExpiresAt && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3"
        >
          <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Demo Expira</span>
          </div>
          <div className="text-sm font-black text-yellow-200">
            {demoExpiresAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
          </div>
        </motion.div>
      )}
      
      {allNavItems.map(({ path, label, icon: Icon }) => {
        const isActive = location === path || (path !== "/" && location.startsWith(path + "/"));
        return (
          <Link key={path} href={path}>
            <div
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer overflow-hidden ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-glow"
                  className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none"
                />
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-nav-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_#00ff88]"
                />
              )}
              
              <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-primary drop-shadow-[0_0_8px_#00ff88]" : ""}`} />
              <span className="relative z-10">{label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row lg:h-screen lg:overflow-hidden selection:bg-primary/30">
      {/* Static Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_at_0%_0%,rgba(0,255,136,0.03)_0%,transparent_50%),radial-gradient(circle_at_100%_100%,rgba(123,97,255,0.03)_0%,transparent_50%)]" />

      {/* Mobile Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/5 lg:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground hover:bg-white/10 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-white/5 bg-background/95 backdrop-blur-xl px-6 py-6 overflow-hidden"
            >
              <nav className="space-y-2">{renderNav()}</nav>
              <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-black text-foreground">{user?.name}</div>
                    <div className="text-xs text-muted-foreground">{user?.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-destructive/10 text-destructive text-sm font-bold hover:bg-destructive/20 transition-all border border-destructive/20"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesion
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 flex-shrink-0 relative z-10">
        <div className="sidebar-float flex flex-col w-full overflow-hidden">
          <div className="px-8 py-10">
            <Logo size="md" />
          </div>

          <nav className="flex-1 px-4 overflow-y-auto scrollbar-hide">
            {renderNav()}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-foreground truncate uppercase tracking-tighter">{user?.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate opacity-70 italic">{user?.role}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/5 text-muted-foreground text-[11px] font-bold hover:bg-destructive/10 hover:text-destructive transition-all border border-white/5 hover:border-destructive/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 lg:overflow-y-auto">
        <div className="max-w-[1600px] mx-auto min-h-full px-6 py-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
