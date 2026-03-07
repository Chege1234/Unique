import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Users,
  BarChart3,
  Ticket,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Circle,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate(createPageUrl("Home"));
  };

  const getNavigationItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: ShieldCheck },
        { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 }
      ];
    } else if (user.role === 'staff' || user.department) {
      return [
        { title: "Staff Dashboard", url: createPageUrl("StaffDashboard"), icon: Users }
      ];
    } else if (user.role === 'student') {
      return [
        { title: "My Dashboard", url: createPageUrl("StudentDashboard"), icon: LayoutGrid }
      ];
    }
    return [];
  };

  const navigationItems = getNavigationItems();

  const noLayoutPages = ["Home", "StudentEntry", "StudentTakeTicket", "StudentTicketView"];
  const isNoLayoutPage = noLayoutPages.includes(currentPageName);

  return (
    <div className="min-h-screen relative bg-background text-foreground font-['Manrope']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      {isNoLayoutPage ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-20">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 text-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] group-hover:scale-105 transition-transform">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight text-white uppercase group-hover:text-primary transition-colors">
                      SmartQueue
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">University Tech</p>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 transition-all duration-200 ${location.pathname === item.url
                        ? "text-primary font-bold"
                        : "text-slate-400 hover:text-white font-medium"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm uppercase tracking-wider">{item.title}</span>
                    </Link>
                  ))}
                </nav>

                {/* User Menu */}
                <div className="hidden md:flex items-center gap-6">
                  {!user ? (
                    <Button
                      onClick={() => navigate(createPageUrl("Login"))}
                      className="bg-primary hover:bg-primary/80 text-white rounded-xl px-8 font-bold uppercase tracking-wider text-xs h-12"
                    >
                      Login
                    </Button>
                  ) : (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-black">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-left hidden lg:block">
                          <p className="text-xs font-black text-white leading-none mb-1 truncate max-w-[100px] uppercase tracking-tighter">{user.full_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-red-400 transition-colors p-2"
                        title="Logout"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 rounded-xl text-slate-400 hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="md:hidden border-t border-white/5 bg-slate-950 overflow-hidden"
                >
                  <div className="px-6 py-8 space-y-6">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${location.pathname === item.url
                          ? "bg-primary text-white"
                          : "text-slate-400 hover:bg-white/5"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-black uppercase tracking-widest text-sm">{item.title}</span>
                      </Link>
                    ))}
                    {!user ? (
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(createPageUrl("Login"));
                        }}
                        className="w-full h-16 bg-primary text-white mt-4 rounded-2xl font-bold uppercase tracking-widest"
                      >
                        Login
                      </Button>
                    ) : (
                      <div className="pt-6 border-t border-white/5">
                        <div className="flex items-center gap-4 mb-6 px-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-black text-lg">
                              {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-black text-white uppercase tracking-tighter">{user.full_name}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">{user.role}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full h-16 justify-start text-red-500 hover:bg-red-500/10 rounded-2xl px-6 font-black uppercase tracking-widest text-xs"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5 mr-4" />
                          Terminate Session
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          {/* Main Content */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 py-12 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <span className="text-lg font-black text-white uppercase tracking-tighter">SmartQueue</span>
                </div>
                <p className="text-slate-500 text-xs font-medium max-w-xs leading-relaxed uppercase tracking-widest">
                  University administrative services optimized for digital efficiency.
                </p>
              </div>

              <div className="flex gap-12">
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">System</h4>
                  <nav className="flex flex-col gap-3">
                    <Link to="#" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Operational Status</Link>
                    <Link to="#" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Documentation</Link>
                  </nav>
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Privacy</h4>
                  <nav className="flex flex-col gap-3">
                    <Link to="#" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Data Protocol</Link>
                    <Link to="#" className="text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors">Terms of Use</Link>
                  </nav>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">
                © {new Date().getFullYear()} SMARTQUEUE. ALL RIGHTS RESERVED.
              </p>
              <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Node Operational</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}