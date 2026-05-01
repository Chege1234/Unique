import React, { useEffect } from "react";
import { api } from "@/api/apiClient";
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
    let cancelled = false;

    const checkAuthAndConfigure = async () => {
      try {
        const authenticated = await api.auth.isAuthenticated();

        if (!authenticated) {
          if (!cancelled) setIsLoading(false);
          return;
        }

        const currentUser = await api.auth.me();

        if (cancelled) return;

        // Admin users go straight to admin dashboard
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
          const allRequests = await api.entities.StaffRequest.list();
          if (cancelled) return;
          setDebugInfo(prev => prev + `\n\nFound ${allRequests.length} total requests`);

          const approvedRequest = allRequests.find(r =>
            r.email.toLowerCase() === currentUser.email.toLowerCase() &&
            r.status === 'approved'
          );

          if (approvedRequest) {
            setDebugInfo(prev => prev + `\n\nFound approved request for ${approvedRequest.email}, department: ${approvedRequest.department}`);
            setConfigMessage("Configuring your staff account...");

            await api.auth.updateMe({
              department: approvedRequest.department,
              phone: approvedRequest.phone || ""
            });

            setConfigMessage("✓ Account configured successfully! Redirecting...");
            setDebugInfo(prev => prev + "\n\nUpdate successful!");

            await new Promise(resolve => setTimeout(resolve, 1500));
            window.location.href = createPageUrl("StaffDashboard");
          } else {
            setConfigMessage("No approved staff request found");
            setDebugInfo(prev => prev + `\n\nNo approved request found. Requests found: ${allRequests.map(r => `${r.email} (${r.status})`).join(', ')}`);
            setIsConfiguring(false);
          }
        } catch (error) {
          if (!cancelled) {
            setConfigMessage("Error: " + error.message);
            setDebugInfo(prev => prev + "\n\nError: " + error.message);
            setIsConfiguring(false);
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (!cancelled) setConfigMessage("Connection error. Please refresh.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setConfigMessage("Request timed out. Please check your connection.");
    }, 15000);

    checkAuthAndConfigure();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  const handleLogin = () => {
    api.auth.redirectToLogin(createPageUrl("StaffLogin"));
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
          <Card className="shadow-sm border-border bg-card p-8 sm:p-12 text-center">
            <CardContent className="p-0 flex flex-col items-center">
              {configMessage.includes("successfully") ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600 animate-bounce" />
                </div>
              ) : configMessage.includes("No approved") ? (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              )}
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {configMessage}
              </h2>
              {debugInfo && (
                <div className="mt-6 w-full p-4 bg-muted/50 border border-border rounded-xl text-left">
                  <p className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">{debugInfo}</p>
                </div>
              )}
              {configMessage.includes("No approved") && (
                <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Button
                    onClick={handleRequestAccess}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    Submit New Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => api.auth.logout()}
                    className="flex-1 h-12 text-base font-medium"
                  >
                    Sign Out
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
        <Card className="shadow-sm border-border bg-card overflow-hidden">
          <CardHeader className="text-center pb-8 border-b border-border">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-semibold text-foreground">Staff Login</CardTitle>
            <CardDescription className="text-muted-foreground text-base mt-2">
              Sign in to manage your department's queue.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 sm:p-12 space-y-8">
            <Button
              onClick={handleLogin}
              className="w-full h-14 text-lg font-medium"
            >
              <Shield className="w-5 h-5 mr-3" />
              Authenticate Staff
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                  <span className="px-4 bg-card text-muted-foreground text-sm font-medium">Or request access</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRequestAccess}
              className="w-full h-14 text-base font-medium"
            >
              Request Staff Access
            </Button>

            <div className="bg-muted/50 rounded-xl p-6 border border-border">
                <p className="font-semibold text-foreground mb-4">
                  How to get access:
                </p>
              <ol className="text-sm text-muted-foreground space-y-3">
                <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span> Request staff access & set a password</li>
                <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span> Wait for admin approval</li>
                <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span> Once approved, come back here</li>
                <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">4</span> Sign in with your email & password</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

