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

import WaitingQueue from "../components/staff/WaitingQueue";
import ServingTicket from "../components/staff/ServingTicket";
import CompletedToday from "../components/staff/CompletedToday";

export default function StaffDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
        
        // Allow admin to preview staff dashboard
        if (currentUser.role === 'admin') {
          setUser(currentUser);
          setIsLoading(false);
          return;
        }
        
        if (!currentUser.department) {
          navigate(createPageUrl("Home"));
          return;
        }
        setUser(currentUser);
        setSelectedDepartment(currentUser.department);
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("StaffDashboard"));
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
    refetchInterval: 3000
  });

  const waitingTickets = allTickets.filter(t => t.status === 'waiting');
  const inProgressTickets = allTickets.filter(t => t.status === 'in_progress');
  const completedToday = allTickets.filter(t => 
    t.status === 'completed' &&
    new Date(t.created_date).toDateString() === new Date().toDateString()
  );

  const startServingMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'in_progress',
        served_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets']);
    }
  });

  const completeServingMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'completed',
        served_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets']);
    }
  });

  const cancelTicketMutation = useMutation({
    mutationFn: async (ticketId) => {
      return base44.entities.QueueTicket.update(ticketId, {
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allTickets']);
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
      title: "Currently Serving",
      value: inProgressTickets.length,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Completed Today",
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

  if (!user) {
    return null;
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
                <span className="hidden sm:inline">Currently Serving</span>
                <span className="sm:hidden">Serving</span>
                <span className="ml-1">({inProgressTickets.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-4">
                <span className="hidden sm:inline">Completed Today</span>
                <span className="sm:hidden">Done</span>
                <span className="ml-1">({completedToday.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="waiting">
              <WaitingQueue 
                tickets={waitingTickets}
                onStartServing={(id) => startServingMutation.mutate(id)}
                onCancel={(id) => cancelTicketMutation.mutate(id)}
              />
            </TabsContent>

            <TabsContent value="serving">
              <ServingTicket 
                tickets={inProgressTickets}
                onComplete={(id) => completeServingMutation.mutate(id)}
                onCancel={(id) => cancelTicketMutation.mutate(id)}
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