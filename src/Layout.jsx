import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Ticket,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Circle
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

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getNavigationItems = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { title: "Admin Dashboard", url: createPageUrl("AdminDashboard"), icon: ShieldCheck },
        { title: "Analytics", url: createPageUrl("Analytics"), icon: BarChart3 }
      ];
    } else if (user.department) {
      return [
        { title: "Staff Dashboard", url: createPageUrl("StaffDashboard"), icon: Users }
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
        <div className="relative z-10">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 sm:h-20">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:bg-accent transition-colors duration-300">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
                      Smart Queue
                    </h1>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide uppercase">University Services</p>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link to="#" className="nav-link">How It Works</Link>
                  <Link to="#" className="nav-link">Services</Link>
                  <Link to="#" className="nav-link">About</Link>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${location.pathname === item.url
                        ? "text-accent font-bold"
                        : "text-slate-600 hover:text-slate-900 font-medium"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  ))}
                </nav>

                {/* User Menu */}
                <div className="hidden md:flex items-center gap-4">
                  {!user ? (
                    <Button
                      onClick={() => navigate(createPageUrl("Login"))}
                      className="bg-primary text-white hover:bg-slate-800 rounded-lg px-6 font-semibold"
                    >
                      Login
                    </Button>
                  ) : (
                    <>
                      <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-left hidden lg:block">
                          <p className="text-sm font-bold text-slate-900 max-w-[120px] truncate leading-none mb-0.5">{user.full_name}</p>
                          <p className="text-[10px] text-accent font-semibold uppercase tracking-wider">{user.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-gray-200 bg-white">
                <div className="px-4 py-4 space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${location.pathname === item.url
                        ? "bg-[#0d6cf2] text-white"
                        : "text-gray-300 hover:bg-white/5"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  ))}
                  {user && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3 px-4 py-2 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name}</p>
                          <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-600 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[calc(100vh-160px)]">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold text-primary">Smart Queue</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs">
                  Redefining university administration through efficient digital queue management.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Platform</h4>
                  <nav className="flex flex-col gap-2">
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">Services</Link>
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">How it Works</Link>
                  </nav>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Company</h4>
                  <nav className="flex flex-col gap-2">
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">About</Link>
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">Contact</Link>
                  </nav>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-primary text-sm uppercase tracking-wider">Legal</h4>
                  <nav className="flex flex-col gap-2">
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">Privacy Policy</Link>
                    <Link to="#" className="text-slate-500 hover:text-primary text-sm">Terms</Link>
                  </nav>
                </div>
              </div>
            </div>
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-slate-400 text-xs">
                © {new Date().getFullYear()} Smart Queue. All rights reserved.
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                  <span className="text-[10px] font-bold text-slate-500">SYSTEM OPERATIONAL</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}