import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { supabase } from "@/api/supabaseClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { CheckCircle2, UserPlus, ArrowLeft, Loader2, Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function RequestStaffAccess() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    notes: '',
    password: '',
    confirm_password: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.entities.Department.filter({ is_active: true })
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const { password, confirm_password, ...rest } = data;
      
      // 1. Sign up the user so their password is set in auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            department: data.department,
            phone: data.phone || null
          }
        }
      });
      
      // If there's an error (other than "User already registered"), throw it.
      if (authError && !authError.message.includes('already registered')) {
        throw authError;
      }

      // 2. Sign out immediately so they aren't logged in as an unapproved user
      await supabase.auth.signOut();

      // 3. Create the staff request for admins to approve
      return api.entities.StaffRequest.create({
        ...rest,
        phone: rest.phone || null,
        status: 'pending'
      });
    },
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (error) => {
      setPasswordError(error.message || 'Failed to submit request. Please try again.');
      console.error('Failed to submit staff request:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!formData.department) {
      setPasswordError('Please select a department.');
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setPasswordError('Passwords do not match.');
      return;
    }
    createRequestMutation.mutate(formData);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="p-8 sm:p-12 shadow-sm border-border bg-card">
            <CardContent className="p-0 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-semibold text-foreground mb-4">
                Request Submitted!
              </h2>
              <p className="text-muted-foreground text-lg mb-8 text-center max-w-md mx-auto">
                Your request has been sent. An admin will review it and get back to you by email.
              </p>
              
              <div className="w-full max-w-md bg-muted/50 rounded-xl p-6 mb-8 text-left">
                <p className="font-semibold text-foreground mb-3">What happens next:</p>
                <ol className="text-sm text-muted-foreground space-y-3">
                  <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">1</span> An admin reviews your request</li>
                  <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">2</span> You'll receive an approval email</li>
                  <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">3</span> Sign in with your approved email</li>
                  <li className="flex items-start gap-3"><span className="bg-primary/10 text-primary w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium">4</span> Go to the Staff Login page</li>
                </ol>
              </div>

              <Button
                onClick={() => navigate(createPageUrl("StaffLogin"))}
                className="w-full max-w-md h-12 text-base font-medium"
              >
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-12 md:py-20">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-start mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("StaffLogin"))}
            className="text-muted-foreground hover:text-foreground pl-0 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-sm border-border bg-card">
            <CardHeader className="text-center pb-8 border-b border-border">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-semibold text-foreground">Staff Access Request</CardTitle>
              <CardDescription className="text-muted-foreground text-base mt-2">
                Fill in your details and an admin will review your request.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 sm:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      required
                      placeholder="John Doe"
                      className="h-12 bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      placeholder="john@university.edu"
                      className="h-12 bg-background border-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1234567890"
                      className="h-12 bg-background border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) => setFormData({ ...formData, department: value })}
                    >
                      <SelectTrigger className="h-12 bg-background border-input">
                        <SelectValue placeholder="Select department..." />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingDepartments ? (
                          <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                        ) : departments.length > 0 ? (
                          departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>No active departments</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional information..."
                    rows={3}
                    className="bg-background border-input resize-none"
                  />
                </div>

                {/* Password section */}
                <div className="border-t border-border pt-8 mt-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Lock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Set Your Login Password</p>
                      <p className="text-sm text-muted-foreground">You'll use this to sign in once approved. Min. 8 characters.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          placeholder="Min. 8 characters"
                          className="h-12 bg-background border-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm_password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          required
                          placeholder="Repeat password"
                          className="h-12 bg-background border-input pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {passwordError && (
                    <Alert variant="destructive" className="mt-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {passwordError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium mt-8"
                  disabled={createRequestMutation.isPending}
                >
                  {createRequestMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

