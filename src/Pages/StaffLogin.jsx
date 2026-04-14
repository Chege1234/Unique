import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Shield, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function StaffLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConfiguring, setIsConfiguring] = React.useState(false);
  const [configMessage, setConfigMessage] = React.useState("");
  const [debugInfo, setDebugInfo] = React.useState("");

  useEffect(() => {
    const checkAuthAndConfigure = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();

        if (!authenticated) {
          setIsLoading(false);
          return;
        }

        const currentUser = await base44.auth.me();

        // Admin users go straight to admin dashboard (but can access staff dashboard from there)
        if (currentUser.role === 'admin') {
          navigate(createPageUrl("AdminDashboard"));
          return;
        }

        // Check if user already has department configured
        if (currentUser.department) {
          navigate(createPageUrl("StaffDashboard"));
          return;
        }

        // User is authenticated but not configured
        setIsConfiguring(true);
        setConfigMessage("Checking your staff access...");
        setDebugInfo(`Looking for approved request with email: ${currentUser.email}`);

        try {
          // Get ALL staff requests and filter manually to avoid case sensitivity issues
          const allRequests = await base44.entities.StaffRequest.list();
          setDebugInfo(prev => prev + `\n\nFound ${allRequests.length} total requests`);

          const approvedRequest = allRequests.find(r =>
            r.email.toLowerCase() === currentUser.email.toLowerCase() &&
            r.status === 'approved'
          );

          if (approvedRequest) {
            setDebugInfo(prev => prev + `\n\nFound approved request for ${approvedRequest.email}, department: ${approvedRequest.department}`);
            setConfigMessage("Configuring your staff account...");

            // Update user with department
            await base44.auth.updateMe({
              department: approvedRequest.department,
              phone: approvedRequest.phone || ""
            });

            setConfigMessage("✓ Account configured successfully! Redirecting...");
            setDebugInfo(prev => prev + "\n\nUpdate successful!");

            await new Promise(resolve => setTimeout(resolve, 1500));

            // Hard reload to ensure user data is refreshed
            window.location.href = createPageUrl("StaffDashboard");
          } else {
            setConfigMessage("No approved staff request found");
            setDebugInfo(prev => prev + `\n\nNo approved request found. Requests found: ${allRequests.map(r => `${r.email} (${r.status})`).join(', ')}`);
            setIsConfiguring(false);
          }
        } catch (error) {
          setConfigMessage("Error: " + error.message);
          setDebugInfo(prev => prev + "\n\nError: " + error.message);
          setIsConfiguring(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setConfigMessage("Connection error. Please refresh.");
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setConfigMessage("Request timed out. Please check your connection.");
      }
    }, 10000);

    checkAuthAndConfigure();
    return () => clearTimeout(timeoutId);
  }, [navigate, isLoading]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("StaffLogin"));
  };

  const handleRequestAccess = () => {
    navigate(createPageUrl("RequestStaffAccess"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] relative z-10">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (isConfiguring) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="glass-card border-none p-12 text-center">
            <CardContent className="p-0">
              {configMessage.includes("successfully") ? (
                <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto mb-8 animate-bounce shadow-2xl shadow-green-500/20" />
              ) : configMessage.includes("No approved") ? (
                <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-8 shadow-2xl shadow-red-500/20" />
              ) : (
                <Loader2 className="w-20 h-20 text-purple-500 mx-auto mb-8 animate-spin shadow-2xl shadow-purple-500/20" />
              )}
              <h2 className="text-3xl font-black text-white tracking-tight mb-6 uppercase">
                {configMessage}
              </h2>
              {debugInfo && (
                <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl text-left">
                  <p className="text-[10px] font-mono text-blue-100/30 whitespace-pre-wrap leading-relaxed uppercase tracking-widest">{debugInfo}</p>
                </div>
              )}
              {configMessage.includes("No approved") && (
                <div className="mt-10 flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleRequestAccess}
                    className="flex-1 h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl shadow-2xl transition-all"
                  >
                    SUBMIT NEW REQUEST
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.logout()}
                    className="flex-1 h-16 text-blue-100/30 hover:text-white hover:bg-white/5 font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
                  >
                    SIGN OUT
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="text-center pb-10 border-b border-white/5">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-4xl font-black text-white tracking-tight uppercase">Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">Login</span></CardTitle>
            <CardDescription className="text-blue-100/30 font-medium text-lg mt-3">
              Sign in to manage your department's queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 space-y-12">
            <Button
              onClick={handleLogin}
              className="w-full h-20 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-black uppercase tracking-[0.4em] text-sm rounded-3xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              <Shield className="w-6 h-6 mr-4" />
              AUTHENTICATE STAFF
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="px-6 bg-[#0B0118] text-blue-100/20 text-[10px] font-black uppercase tracking-[0.5em]">OR REQUEST ACCESS</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRequestAccess}
              className="w-full h-16 bg-white/5 border-white/10 hover:bg-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all"
            >
              REQUEST STAFF ACCESS
            </Button>

            <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8">
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-4">
                  How to get access:
                </p>
              <ol className="text-[10px] text-blue-100/30 font-bold uppercase tracking-[0.15em] space-y-3">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">1</span> Request staff access &amp; set a password</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">2</span> Wait for admin approval</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">3</span> Once approved, come back here</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">4</span> Sign in with your email &amp; password</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
