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
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const calledTickets = allTickets.filter(t => t.status === 'called');

  const completedToday = allTickets.filter(t =>
    (t.status === 'served' || t.status === 'skipped') &&
    new Date(t.created_date).toDateString() === new Date().toDateString()
  );

  const callNextMutation = useMutation({
    mutationFn: async () => {
      if (waitingTickets.length === 0) return;
      const nextTicket = waitingTickets[0]; // Gets the first one because they are sorted created_at asc
      return base44.entities.QueueTicket.update(nextTicket.id, {
        status: 'called',
        served_by: user.id || user.email // use ID for correctness if available
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    }
  });

  const serveTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'served',
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
        status: 'skipped'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets', activeDepartment]);
    }
  });

  const stats = [
    {
      title: "Waiting in Queue",
      value: waitingTickets.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Currently Calling",
      value: calledTickets.length,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Processed Today",
      value: completedToday.length,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Avg. Service Time",
      value: `${Math.round(completedToday.length > 0 ? 15 : 0)}m`,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Staff Dashboard</h1>
        {user.role === 'admin' ? (
          <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <Badge className="bg-orange-500 text-sm sm:text-base px-3 sm:px-4 py-1">
              👑 Admin Preview Mode
            </Badge>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Building2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <Select value={selectedDepartment || ""} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Managing queue for: <Badge className="text-sm sm:text-base">{user.department}</Badge>
          </p>
        )}
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
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.title}</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Queue Management */}
          <Tabs defaultValue="waiting" className="space-y-4 sm:space-y-6">
            <TabsList className="bg-white shadow-md w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
              <TabsTrigger value="waiting" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Waiting Queue</span>
                <span className="sm:hidden">Waiting</span>
                <span className="ml-1">({waitingTickets.length})</span>
              </TabsTrigger>
              <TabsTrigger value="serving" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Currently Calling</span>
                <span className="sm:hidden">Calling</span>
                <span className="ml-1">({calledTickets.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Processed Today</span>
                <span className="sm:hidden">Done</span>
                <span className="ml-1">({completedToday.length})</span>
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
                tickets={calledTickets}
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
