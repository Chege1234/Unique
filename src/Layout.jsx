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
    <div className="min-h-screen relative bg-[#030014] overflow-hidden text-white font-['Manrope']">
      {/* Background Glows */}
      <div className="fixed inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-900/40 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-blue-900/40 rounded-full blur-[120px]"
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
      `}</style>

      {isNoLayoutPage ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <div className="relative z-10">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16 sm:h-20">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Ticket className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-white">
                      Smart<span className="text-purple-400">Queue</span>
                    </h1>
                    <p className="text-[10px] sm:text-xs text-blue-300/60 font-medium tracking-wide uppercase">University Services</p>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${location.pathname === item.url
                        ? "bg-white/10 text-white border border-white/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-semibold text-sm">{item.title}</span>
                    </Link>
                  ))}
                </nav>

                {/* User Menu */}
                <div className="hidden md:flex items-center gap-3 lg:gap-4">
                  {user && (
                    <>
                      <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-inner">
                          <span className="text-white text-xs font-bold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-left hidden lg:block">
                          <p className="text-sm font-bold text-white max-w-[120px] truncate leading-none mb-0.5">{user.full_name}</p>
                          <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-wider">{user.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50 hidden lg:flex"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLogout}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50 lg:hidden"
                        title="Logout"
                      >
                        <LogOut className="w-4 h-4" />
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
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-blue-50"
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
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
        </div>
      )}
    </div>
  );
}