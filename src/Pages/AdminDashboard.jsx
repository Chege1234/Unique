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

import DepartmentManager from "../components/admin/DepartmentManager";
import SystemStats from "../components/admin/SystemStats";
import StaffRequestManager from "../components/admin/StaffRequestManager";

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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage system configuration and monitor performance</p>
        </div>
        <div className="flex gap-3">
          <Link to={createPageUrl("StaffDashboard")}>
            <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
              <Users className="w-4 h-4 mr-2" />
              Preview Staff Dashboard
            </Button>
          </Link>
          <Link to={createPageUrl("Analytics")}>
            <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Staff Access Requests - Show if there are pending requests */}
      {pendingRequests.length > 0 && (
        <StaffRequestManager requests={staffRequests} />
      )}

      {/* Department Management */}
      <DepartmentManager departments={departments} />

      {/* System Stats */}
      <SystemStats tickets={allTickets} departments={departments} />

      {/* All Staff Requests - Collapsible */}
      {staffRequests.length > 0 && pendingRequests.length === 0 && (
        <StaffRequestManager requests={staffRequests} />
      )}
    </div>
  );
}