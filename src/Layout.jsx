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
  ShieldCheck
} from "lucide-react";
import { Button } from "@/Components/ui/button";

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
  
  if (noLayoutPages.includes(currentPageName)) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-slate-900/90 to-blue-800/95"></div>
      </div>

      <style>{`
        :root {
          --primary-blue: #3B82F6;
          --light-blue: #60A5FA;
          --soft-gray: #F1F5F9;
        }
      `}</style>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <Link to={createPageUrl("Home")} className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-gray-900">SmartQueue</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500">University Services</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.title}
                    to={item.url}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === item.url
                        ? "bg-blue-500 text-white shadow-md"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                ))}
              </nav>

              {/* User Menu */}
              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                {user && (
                  <>
                    <div className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-slate-100 rounded-lg">
                      <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs lg:text-sm font-semibold">
                          {user.full_name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-medium text-gray-900 max-w-[120px] truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      location.pathname === item.url
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
    </div>
  );
}