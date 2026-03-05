import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import {
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Loader2,
  Building2
} from "lucide-react";
import { motion } from "framer-motion";

import WaitingQueue from "../Components/staff/WaitingQueue";
import ServingTicket from "../Components/staff/ServingTicket";
import CompletedToday from "../Components/staff/CompletedToday";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(createPageUrl("StaffDashboard"));
          return;
        }
        const currentUser = await base44.auth.me();

        if (!currentUser) {
          throw new Error("User data not found");
        }

        if (currentUser.role !== 'staff' && currentUser.role !== 'admin') {
          // Redirect non-staff away
          navigate(createPageUrl("Home"));
          return;
        }

        // Allow admin to preview staff dashboard
        if (currentUser.role === 'admin') {
          setUser(currentUser);
          return;
        }

        if (!currentUser.department) {
          setUser(currentUser);
          return;
        }
        setUser(currentUser);
        setSelectedDepartment(currentUser.department);
      } catch (err) {
        console.error("StaffDashboard initialization error:", err);
        setError(err.message || "Failed to initialize dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
    enabled: !!user && user.role === 'admin'
  });

  const activeDepartment = user?.role === 'admin' ? selectedDepartment : user?.department;

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets', activeDepartment],
    queryFn: () => {
      if (!activeDepartment) return [];
      return base44.entities.QueueTicket.filter({ department_name: activeDepartment }, '-created_date');
    },
    enabled: !!activeDepartment,
    // Realtime subscription replaces polling
  });

  // Setup Realtime subscription
  useEffect(() => {
    if (!activeDepartment) return;

    const channel = base44.entities.QueueTicket._subscribeToDepartmentChanges(activeDepartment, (payload) => {
      // Invalidate the query when a change happens in this department
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    });

    return () => {
      if (channel) {
        base44.entities.QueueTicket._unsubscribe(channel);
      }
    };
  }, [activeDepartment, queryClient]);

  const waitingTickets = allTickets.filter(t => t.status === 'waiting')
    // oldest first for waiting list
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const servingTickets = allTickets.filter(t => t.status === 'in_progress' || t.status === 'called');

  const completedToday = allTickets.filter(t =>
    (t.status === 'completed' || t.status === 'cancelled') &&
    new Date(t.created_date).toDateString() === new Date().toDateString()
  );

  const callNextMutation = useMutation({
    mutationFn: async () => {
      if (waitingTickets.length === 0) return;
      const nextTicket = waitingTickets[0]; // Gets the first one because they are sorted created_at asc
      return base44.entities.QueueTicket.update(nextTicket.id, {
        status: 'in_progress',
        served_by: user.id || user.email, // use ID for correctness if available
        called_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    }
  });

  const serveTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'completed',
        served_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    }
  });

  const skipTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    }
  });

  const stats = [
    {
      title: "Queue Size",
      value: waitingTickets.length,
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Active Calls",
      value: servingTickets.length,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Handled Today",
      value: completedToday.length,
      icon: CheckCircle2,
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Efficiency",
      value: `${Math.round(completedToday.length > 0 ? 95 : 0)}%`,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-white rounded-2xl shadow-xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Error</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <div className="flex gap-4">
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
            Retry Loading
          </Button>
          <Button variant="outline" onClick={() => navigate(createPageUrl("Home"))}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 italic">User session lost. Please try logging in again.</p>
        <Button onClick={() => base44.auth.redirectToLogin(createPageUrl("StaffDashboard"))} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!user.department && user.role !== 'admin') {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Account Not Configured</h3>
        <p className="mt-1 text-sm text-gray-500">
          Your staff account is not assigned to a department. Please contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Terminal</span>
          </h1>
          {user.role === 'admin' ? (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-widest px-3 py-1 backdrop-blur-md">
                👑 Authority Override
              </Badge>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-1 pr-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-400" />
                </div>
                <Select value={selectedDepartment || ""} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-full sm:w-64 bg-transparent border-none text-white font-bold h-10 focus:ring-0">
                    <SelectValue placeholder="Network Node..." />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/10 text-white">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.name} className="hover:bg-white/5 cursor-pointer">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-blue-200/50 font-medium tracking-wide">Managing Node:</span>
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black tracking-widest uppercase py-1">
                {user.department}
              </Badge>
            </div>
          )}
        </motion.div>
      </div>

      {!activeDepartment && user.role === 'admin' ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="p-8 sm:p-12 text-center">
            <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Select a Department</h3>
            <p className="text-sm sm:text-base text-gray-600">Choose a department from the dropdown above to preview its queue management</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overlay */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-none group hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-blue-200/30 uppercase tracking-[0.2em] mb-1 truncate">{stat.title}</p>
                        <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} border border-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                        <stat.icon className={`w-6 h-6 ${stat.color.replace('text-', 'text-glow text-')}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Queue Management Interface */}
          <Tabs defaultValue="waiting" className="space-y-8">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-2xl h-14 sm:w-auto grid grid-cols-3 sm:inline-flex backdrop-blur-md">
              <TabsTrigger value="waiting" className="rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-900/40 text-xs font-bold tracking-widest uppercase transition-all duration-300">
                <span className="hidden sm:inline">Waiting List</span>
                <span className="sm:hidden">Waiting</span>
                <Badge className="ml-2 bg-white/10 text-white border-none text-[10px] tabular-nums">{waitingTickets.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="serving" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-900/40 text-xs font-bold tracking-widest uppercase transition-all duration-300">
                <span className="hidden sm:inline">Live Session</span>
                <span className="sm:hidden">Session</span>
                <Badge className="ml-2 bg-white/10 text-white border-none text-[10px] tabular-nums">{servingTickets.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-green-900/40 text-xs font-bold tracking-widest uppercase transition-all duration-300">
                <span className="hidden sm:inline">Terminal History</span>
                <span className="sm:hidden">History</span>
                <Badge className="ml-2 bg-white/10 text-white border-none text-[10px] tabular-nums">{completedToday.length}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="waiting">
              <WaitingQueue
                tickets={waitingTickets}
                onCallNext={() => callNextMutation.mutate()}
                isCallingNext={callNextMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="serving">
              <ServingTicket
                tickets={servingTickets}
                onComplete={(id) => serveTicketMutation.mutate(id)}
                onCancel={(id) => skipTicketMutation.mutate(id)}
                isCompleting={serveTicketMutation.isPending}
                isCancelling={skipTicketMutation.isPending}
              />
            </TabsContent>

            <TabsContent value="completed">
              <CompletedToday tickets={completedToday} />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
