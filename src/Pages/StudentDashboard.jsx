import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
  Ticket,
  Clock,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Ban
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import ActiveTicketCard from "../Components/student/ActiveTicketCard";
import TicketHistory from "../Components/student/TicketHistory";

export default function StudentDashboard() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      // Only set user if they are a student (e.g., has student_id or similar role check)
      // For this system, we'll assume if they logged in they are a student unless specified otherwise.
      // A more robust solution would check user.roles or a specific attribute.
      // The current implementation of base44.auth.me() usually returns the currently logged in user
      // irrespective of role for display purposes, but filtering tickets will only work for students.
      // If a staff logs in, `user.email` won't match `student_id` in QueueTicket, so myTickets will be empty.
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: myTickets = [], refetch } = useQuery({
    queryKey: ['myTickets', user?.email],
    queryFn: () => base44.entities.QueueTicket.filter(
      { student_email: user?.email },
      '-created_date'
    ),
    enabled: !!user,
    refetchInterval: 5000
  });

  const activeTickets = myTickets.filter(t =>
    t.status === 'waiting' || t.status === 'in_progress'
  );
  const completedTickets = myTickets.filter(t =>
    t.status === 'completed' || t.status === 'cancelled'
  );

  const stats = [
    {
      title: "Active Tickets",
      value: activeTickets.length,
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "In Progress",
      value: myTickets.filter(t => t.status === 'in_progress').length,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Completed Today",
      value: myTickets.filter(t =>
        t.status === 'completed' &&
        new Date(t.created_date).toDateString() === new Date().toDateString()
      ).length,
      icon: CheckCircle2,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  if (!user) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.full_name}!
          </h1>
          <p className="text-gray-600 mt-1">Manage your queue tickets and track your position</p>
        </div>
        <Link
          to={activeTickets.length > 0 ? '#' : createPageUrl("TakeTicket")}
          aria-disabled={activeTickets.length > 0}
          onClick={(e) => activeTickets.length > 0 && e.preventDefault()}
          className={`${activeTickets.length > 0 ? 'cursor-not-allowed' : ''}`}
        >
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed"
            disabled={activeTickets.length > 0}
            title={activeTickets.length > 0 ? "You can only have one active ticket at a time" : "Take a new ticket"}
          >
            {activeTickets.length > 0 ? (
              <>
                <Ban className="w-4 h-4 mr-2" />
                Ticket Limit Reached
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Take New Ticket
              </>
            )}
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
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
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Tickets */}
      {activeTickets.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Tickets</h2>
          <div className="grid gap-6">
            {activeTickets.map((ticket) => (
              <ActiveTicketCard key={ticket.id} ticket={ticket} onUpdate={refetch} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Tickets</h3>
            <p className="text-gray-600 mb-6">
              You don't have any active tickets. Take a new ticket to get started.
            </p>
            <Link to={createPageUrl("TakeTicket")}>
              <Button className="bg-blue-500 hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Take Ticket
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent History */}
      {completedTickets.length > 0 && (
        <TicketHistory tickets={completedTickets.slice(0, 5)} />
      )}
    </div>
  );
}
