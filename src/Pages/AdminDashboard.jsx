import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  Ticket,
  TrendingUp,
  BarChart3,
  Plus,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";

import DepartmentManager from "../Components/admin/DepartmentManager";
import SystemStats from "../Components/admin/SystemStats";
import StaffRequestManager from "../Components/admin/StaffRequestManager";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (!authenticated) {
          base44.auth.redirectToLogin(createPageUrl("AdminDashboard"));
          return;
        }
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          navigate(createPageUrl("Home"));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(createPageUrl("AdminDashboard"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => base44.entities.Department.list(),
    enabled: !!user
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets'],
    queryFn: () => base44.entities.QueueTicket.list(),
    refetchInterval: 5000,
    enabled: !!user
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const { data: staffRequests = [] } = useQuery({
    queryKey: ['staffRequests'],
    queryFn: () => base44.entities.StaffRequest.list('-created_date'),
    enabled: !!user
  });

  const pendingRequests = staffRequests.filter(r => r.status === 'pending');

  const todayTickets = allTickets.filter(t =>
    new Date(t.created_date).toDateString() === new Date().toDateString()
  );

  const stats = [
    {
      title: "Total Departments",
      value: departments.length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Active Tickets Today",
      value: todayTickets.length,
      icon: Ticket,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Avg. Queue Time",
      value: "15m",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] relative z-10">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-10 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-2">Manage departments, staff access, and system operations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("StaffDashboard"))}
            className="h-11"
          >
            <Users className="w-4 h-4 mr-2" />
            Staff View
          </Button>
          <Button
            onClick={() => navigate(createPageUrl("Analytics"))}
            className="h-11"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className="text-3xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500`}>
                    <stat.icon className={`w-6 h-6 text-purple-400`} />
                  </div>
                </div>
                {/* Subtle bottom gradient indicator */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Staff Access Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 ml-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <h2 className="text-[10px] font-black text-red-400 uppercase tracking-[0.4em]">Pending Authorizations</h2>
            </div>
            <StaffRequestManager requests={staffRequests} />
          </div>
        )}

        {/* Department Management */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] ml-1">Department Setup</h2>
          <DepartmentManager departments={departments} />
        </div>

        {/* System Stats */}
        <div className="space-y-6">
          <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] ml-1">System Stats</h2>
          <SystemStats tickets={allTickets} departments={departments} />
        </div>

        {/* All Staff Requests - Collapsible / History */}
        {staffRequests.length > 0 && pendingRequests.length === 0 && (
          <div className="space-y-6 opacity-60 hover:opacity-100 transition-opacity">
            <h2 className="text-[10px] font-black text-blue-100/30 uppercase tracking-[0.4em] ml-1">Access History</h2>
            <StaffRequestManager requests={staffRequests} />
          </div>
        )}
      </div>
    </div>
  );
}
