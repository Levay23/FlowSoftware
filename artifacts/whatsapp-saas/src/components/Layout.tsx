import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/whatsapp", label: "WhatsApp", icon: Smartphone },
  { path: "/contacts", label: "Contactos", icon: Users },
  { path: "/chatbot", label: "Chatbot IA", icon: Bot },
  { path: "/training", label: "Entrenamiento", icon: Brain },
  { path: "/chat", label: "Chat en vivo", icon: MessageCircle },
  { path: "/settings", label: "Configuracion", icon: Settings },
];

const adminNavItems = [
  { path: "/admin/users", label: "Administracion", icon: ShieldCheck },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const demoExpiresAt = user?.isDemo && user.demoExpiresAt ? new Date(user.demoExpiresAt) : null;
  const allNavItems = [...navItems, ...(user?.role === "admin" ? adminNavItems : [])];
  const currentPage = allNavItems.find((item) => location === item.path || location.startsWith(item.path));

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const renderNav = () => (
    <>
      {demoExpiresAt && (
        <div className="mb-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200">
          Demo activo hasta {demoExpiresAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
      {allNavItems.map(({ path, label, icon: Icon }) => {
        const isActive = location === path || location.startsWith(path);
        return (
          <Link key={path} href={path}>
            <div
              data-testid={`nav-${label.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-primary/10 text-primary glow-green-sm border border-primary/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : ""}`} />
              {label}
            </div>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background lg:flex lg:h-screen lg:overflow-hidden">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-foreground">FlowSoftware</div>
              <div className="text-xs text-muted-foreground truncate">{currentPage?.label ?? "Panel"}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center text-foreground"
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-card px-3 py-3 shadow-2xl">
            <nav className="space-y-1 max-h-[60vh] overflow-y-auto">{renderNav()}</nav>
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                </div>
              </div>
              <button
                data-testid="btn-logout-mobile"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-2 rounded hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesion
              </button>
            </div>
          </div>
        )}
      </header>

      <aside className="hidden w-64 flex-shrink-0 border-r border-border lg:flex flex-col" style={{ background: "hsl(var(--sidebar))" }}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold text-sm text-foreground">FlowSoftware</div>
            <div className="text-xs text-muted-foreground">SaaS Platform</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {renderNav()}
        </nav>

        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <button
            data-testid="btn-logout"
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full px-2 py-1.5 rounded hover:bg-destructive/10"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="min-h-[calc(100vh-65px)] lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
