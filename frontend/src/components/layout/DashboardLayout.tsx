import React, { ReactNode, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, BarChart3, Users, LogOut, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import ghostImg from "../../../assets/ghost.png";

interface DashboardLayoutProps {
  pageTitle: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
  children: ReactNode;
  showGhost?: boolean;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/records", icon: FileText, label: "Records" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/users", icon: Users, label: "Users" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardLayout({ pageTitle, userName, userRole, onLogout, children, showGhost = false }: DashboardLayoutProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen gradient-bg bg-background">
      {/* Ambient Orbs */}
      <div className="orb orb-orange" style={{ width: 400, height: 400, top: '10%', left: '20%' }} />
      <div className="orb orb-indigo" style={{ width: 300, height: 300, bottom: '20%', right: '15%', animationDelay: '-5s' }} />
      <div className="orb orb-emerald" style={{ width: 250, height: 250, top: '60%', left: '50%', animationDelay: '-10s' }} />

      {/* Compact Icon Sidebar */}
      <aside className="w-[72px] flex flex-col fixed h-screen z-20 sidebar-bg">
        {/* Logo */}
        <div className="flex items-center justify-center py-6">
          <motion.div 
            className="w-10 h-10 rounded-xl flex items-center justify-center pulse-glow overflow-hidden"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(24 90% 40%))' }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-lg font-extrabold" style={{ color: "white" }}>F</span>
          </motion.div>
        </div>

        {/* Nav Icons */}
        <nav className="flex-1 flex flex-col items-center gap-2 py-4 px-2">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <NavLink key={item.to} to={item.to} className="group relative">
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center nav-item ${active ? 'nav-item-active' : ''}`}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--foreground) / 0.35)" }}
                >
                  <item.icon size={20} />
                </motion.div>
                {/* Tooltip */}
                <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 translate-x-[-4px] group-hover:translate-x-0 tooltip-popup">
                  {item.label}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* User Avatar + Logout */}
        <div className="flex flex-col items-center gap-3 py-4 px-2">
          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center theme-toggle-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          <motion.div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(24 90% 40%))',
              color: 'white',
              boxShadow: '0 2px 10px hsl(var(--primary) / 0.3)'
            }}
            whileHover={{ scale: 1.1 }}
          >
            {userName.charAt(0).toUpperCase()}
          </motion.div>
          <motion.button
            onClick={onLogout}
            className="w-10 h-10 rounded-xl flex items-center justify-center logout-btn"
            whileHover={{ scale: 1.08 }}
          >
            <LogOut size={18} />
          </motion.button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[72px] p-8 relative z-10">
        <motion.div 
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
            <div className="relative">
            <div className="relative inline-block overflow-visible">
              <h1 className="text-2xl font-bold text-foreground">
                {pageTitle === "Dashboard" ? `${getGreeting()}, ${userName} 👋` : pageTitle}
              </h1>
              {/* Ghost mascot sliding across the heading text */}
              {showGhost && (
                <img
                  src={ghostImg}
                  alt="Finlyo mascot"
                  className="ghost-slide w-7 h-7 pointer-events-none z-10"
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pageTitle === "Dashboard" ? "Here's your financial overview" : `Welcome back, ${userName}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="brand-name-cool text-sm font-extrabold tracking-widest uppercase">
              <span className="brand-letter" style={{ animationDelay: '0s' }}>F</span>
              <span className="brand-letter" style={{ animationDelay: '0.05s' }}>i</span>
              <span className="brand-letter" style={{ animationDelay: '0.1s' }}>n</span>
              <span className="brand-letter" style={{ animationDelay: '0.15s' }}>l</span>
              <span className="brand-letter" style={{ animationDelay: '0.2s' }}>y</span>
              <span className="brand-letter" style={{ animationDelay: '0.25s' }}>o</span>
            </span>
            <span className="text-xs px-3 py-1.5 rounded-full role-badge">
              {userRole}
            </span>
          </div>
        </motion.div>
        <div className="animate-page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
