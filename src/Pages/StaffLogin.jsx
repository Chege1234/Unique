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
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndConfigure();
  }, [navigate]);

  const handleLogin = () => {
    base44.auth.redirectToLogin(createPageUrl("StaffLogin"));
  };

  const handleRequestAccess = () => {
    navigate(createPageUrl("RequestStaffAccess"));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isConfiguring) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="shadow-2xl border-none">
            <CardContent className="p-8 text-center">
              {configMessage.includes("successfully") ? (
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
              ) : configMessage.includes("No approved") ? (
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              ) : (
                <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {configMessage}
              </h2>
              {debugInfo && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
                  <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">{debugInfo}</p>
                </div>
              )}
              {configMessage.includes("No approved") && (
                <div className="mt-6">
                  <Button onClick={handleRequestAccess} className="mr-2">
                    Submit New Request
                  </Button>
                  <Button variant="outline" onClick={() => base44.auth.logout()}>
                    Logout
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-none">
          <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Staff & Admin Access</CardTitle>
            <CardDescription className="text-blue-100">
              Login to manage queues and system settings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 h-12 text-lg"
            >
              <Shield className="w-5 h-5 mr-2" />
              Login as Staff / Admin
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleRequestAccess}
              className="w-full h-12 text-lg"
            >
              Request Staff Access
            </Button>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>For New Staff:</strong>
              </p>
              <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                <li>Request staff access</li>
                <li>Wait for admin approval</li>
                <li>Receive invite email</li>
                <li>Create your account with EXACT email</li>
                <li>Come back here and login</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}