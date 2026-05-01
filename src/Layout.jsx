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
  LayoutGrid
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const [userLoading, setUserLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUser = async () => {
      setUserLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setUserLoading(false);
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

  const noLayoutPages = ["Home", "StudentTakeTicket", "StudentTicketView"];
  const isNoLayoutPage = noLayoutPages.includes(currentPageName);

  return (
    <div className="min-h-screen relative bg-background text-foreground font-['Manrope']">
      {isNoLayoutPage ? (
        <div className="relative z-10">{children}</div>
      ) : (
        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-18 py-3">
                <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-primary/40 text-primary bg-primary/10 transition-transform group-hover:scale-105">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      SmartQueue
                    </h1>
                    <p className="text-[11px] text-muted-foreground font-medium tracking-wide">University Queue System</p>
                  </div>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex items-center gap-2 text-sm transition-all duration-200 ${
                        location.pathname === item.url
                          ? "text-primary font-semibold"
                          : "text-muted-foreground hover:text-foreground font-medium"
                        }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                  {userLoading ? (
                    <div className="flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-xl animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-muted" />
                      <div className="hidden lg:flex flex-col gap-1.5">
                        <div className="w-20 h-2.5 rounded-full bg-muted" />
                        <div className="w-12 h-2 rounded-full bg-muted/60" />
                      </div>
                    </div>
                  ) : !user ? (
                    <Button
                      onClick={() => navigate(createPageUrl("Login"))}
                      className="px-6"
                    >
                      Login
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 px-3 py-2 bg-card border border-border rounded-xl">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                          <span className="text-primary text-xs font-bold">
                            {user.full_name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="text-left hidden lg:block">
                          <p className="text-xs font-semibold text-foreground leading-none mb-1 truncate max-w-[130px]">{user.full_name}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{user.role}</p>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="text-muted-foreground hover:text-red-400 transition-colors p-2"
                        title="Logout"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted/60"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.15 : 0.24, ease: "easeOut" }}
                  className="md:hidden border-t border-border bg-background overflow-hidden"
                >
                  <div className="px-6 py-6 space-y-4">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                          location.pathname === item.url
                            ? "bg-primary/15 text-primary border border-primary/30"
                            : "text-muted-foreground hover:bg-muted/60"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-semibold text-sm">{item.title}</span>
                      </Link>
                    ))}
                    {!user ? (
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate(createPageUrl("Login"));
                        }}
                        className="w-full mt-3"
                      >
                        Login
                      </Button>
                    ) : (
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center gap-4 mb-4 px-1">
                          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                            <span className="text-primary font-semibold text-base">
                              {user.full_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-400 hover:bg-red-500/10"
                          onClick={handleLogout}
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-10">
            {children}
          </main>

          <footer className="border-t border-border/80 py-10 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  <span className="text-lg font-semibold text-foreground">SmartQueue</span>
                </div>
                <p className="text-muted-foreground text-xs font-medium max-w-xs leading-relaxed">
                  University administrative services optimized for digital efficiency.
                </p>
              </div>

              <div className="flex gap-12">
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-xs font-semibold text-foreground">System</h4>
                  <nav className="flex flex-col gap-3">
                    <Link to="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">System Status</Link>
                    <Link to="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">Documentation</Link>
                  </nav>
                </div>
                <div className="space-y-4 text-center md:text-left">
                  <h4 className="text-xs font-semibold text-foreground">Privacy</h4>
                  <nav className="flex flex-col gap-3">
                    <Link to="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">Privacy Policy</Link>
                    <Link to="#" className="text-muted-foreground hover:text-foreground text-xs transition-colors">Terms of Use</Link>
                  </nav>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-muted-foreground text-xs">
                © {new Date().getFullYear()} SMARTQUEUE. ALL RIGHTS RESERVED.
              </p>
              <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full border border-border">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">All systems online</span>
              </div>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}