import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { TrendingUp, Users, Clock, Building2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";

export default function Analytics() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authenticated = await api.auth.isAuthenticated();
        if (!authenticated) {
          api.auth.redirectToLogin(createPageUrl("Analytics"));
          return;
        }
        const currentUser = await api.auth.me();
        if (currentUser.role !== 'admin') {
          navigate(createPageUrl("Home"));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        api.auth.redirectToLogin(createPageUrl("Analytics"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets'],
    queryFn: () => api.entities.QueueTicket.list(),
    enabled: !!user
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.entities.Department.list(),
    enabled: !!user
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayTickets = allTickets.filter(t =>
      new Date(t.created_date).toDateString() === date.toDateString()
    );
    return {
      date: format(date, 'MMM dd'),
      tickets: dayTickets.length,
      completed: dayTickets.filter(t => t.status === 'completed').length
    };
  });

  const departmentStats = departments.map(dept => {
    const deptTickets = allTickets.filter(t => t.department_id === dept.id);
    return {
      name: dept.name,
      tickets: deptTickets.length,
      completed: deptTickets.filter(t => t.status === 'completed').length,
      avgWait: dept.average_service_time || 15
    };
  });

  const statusDistribution = [
    { name: 'Completed', value: allTickets.filter(t => t.status === 'completed').length, color: '#10B981' },
    { name: 'Waiting', value: allTickets.filter(t => t.status === 'waiting').length, color: '#3B82F6' },
    { name: 'In Progress', value: allTickets.filter(t => t.status === 'in_progress').length, color: '#F59E0B' },
    { name: 'Cancelled', value: allTickets.filter(t => t.status === 'cancelled').length, color: '#EF4444' }
  ];

  const todayTickets = allTickets.filter(t =>
    new Date(t.created_date).toDateString() === new Date().toDateString()
  );

  const metrics = [
    {
      title: "Total Tickets",
      value: allTickets.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Today's Tickets",
      value: todayTickets.length,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Departments",
      value: departments.length,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Avg Wait Time",
      value: "15 min",
      icon: Clock,
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

  const statusColors = {
    'Completed': '#8B5CF6',
    'Waiting': '#3B82F6',
    'In Progress': '#A78BFA',
    'Cancelled': '#EF4444'
  };

  return (
    <div className="space-y-10 relative z-10 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight">Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-2 text-balance">Ticket and queue activity across all departments.</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">{metric.title}</p>
                    <p className="text-3xl font-semibold text-foreground tracking-tight">{metric.value}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-purple-500/10`}>
                    <metric.icon className={`w-6 h-6 text-purple-400`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Weekly Trend */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="p-8 border-b border-white/5 bg-white/5">
            <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Tickets This Week</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="tickets" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Total" />
                  <Line type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={4} dot={{ r: 6, fill: '#8B5CF6', strokeWidth: 0 }} activeDot={{ r: 8, strokeWidth: 0 }} name="Completed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card className="glass-card border-none overflow-hidden group">
          <CardHeader className="p-8 border-b border-white/5 bg-white/5">
            <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Ticket Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-10 flex flex-col items-center">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-[10px] font-black text-blue-100/30 uppercase tracking-widest ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card className="glass-card border-none overflow-hidden group lg:col-span-2">
          <CardHeader className="p-8 border-b border-white/5 bg-white/5">
            <CardTitle className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', textTransform: 'uppercase', fontSize: '10px', fontWeight: '900' }}
                  />
                  <Bar dataKey="tickets" fill="url(#barGradient)" radius={[8, 8, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

