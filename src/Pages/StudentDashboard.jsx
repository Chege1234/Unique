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
    t.status === 'waiting' || t.status === 'in_progress' || t.status === 'called'
  );
  const completedTickets = myTickets.filter(t =>
    t.status === 'completed' || t.status === 'cancelled'
  );

  const stats = [
    {
      title: "Active Tickets",
      value: activeTickets.length,
      icon: Ticket,
      color: "text-[#0d6cf2]",
      bgColor: "bg-blue-100"
    },
    {
      title: "In Progress",
      value: myTickets.filter(t => t.status === 'in_progress').length,
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      title: "Completed Today",
      value: myTickets.filter(t =>
        t.status === 'completed' &&
        new Date(t.created_date).toDateString() === new Date().toDateString()
      ).length,
      icon: CheckCircle2,
      color: "text-blue-400",
      bgColor: "bg-blue-100"
    }
  ];

  if (!user) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-10 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#0d6cf2]">{user.full_name.split(' ')[0]}!</span>
          </h1>
          <p className="text-blue-200/50 mt-2 font-medium uppercase tracking-widest text-xs">Your personal queue command center</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to={activeTickets.length > 0 ? '#' : createPageUrl("TakeTicket")}
            aria-disabled={activeTickets.length > 0}
            onClick={(e) => activeTickets.length > 0 && e.preventDefault()}
            className={`${activeTickets.length > 0 ? 'cursor-not-allowed' : ''}`}
          >
            <Button
              className="bg-[#0d6cf2] hover:bg-[#0b5ed7] text-white shadow-xl shadow-blue-500/20 px-8 py-6 rounded-2xl font-bold uppercase tracking-wider disabled:opacity-50 transition-all transform hover:-translate-y-1"
              disabled={activeTickets.length > 0}
            >
              {activeTickets.length > 0 ? (
                <>
                  <Ban className="w-5 h-5 mr-3" />
                  Limit Reached
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-3" />
                  New Ticket
                </>
              )}
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-none group hover:scale-[1.02] transition-transform duration-300">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-blue-200/40 uppercase tracking-widest mb-1">{stat.title}</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                  </div>
                  <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#0d6cf2]/50 transition-colors`}>
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Session
          </h2>
          <div className="grid gap-8">
            {activeTickets.map((ticket) => (
              <ActiveTicketCard key={ticket.id} ticket={ticket} onUpdate={refetch} />
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="glass-card border-none overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
            <CardContent className="p-16 text-center relative z-10">
              <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <AlertCircle className="w-10 h-10 text-blue-300/40" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">All Caught Up</h3>
              <p className="text-blue-100/40 mb-10 max-w-sm mx-auto font-medium">
                You're currently not in any queue. Ready to experience our seamless service?
              </p>
              <Link to={createPageUrl("TakeTicket")}>
                <Button className="bg-[#0d6cf2] hover:bg-[#0b5ed7] text-white border-none rounded-2xl px-10 py-7 text-lg font-bold group shadow-lg shadow-blue-500/20">
                  <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                  NEW SESSION
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent History */}
      {completedTickets.length > 0 && (
        <TicketHistory tickets={completedTickets.slice(0, 5)} />
      )}
    </div>
  );
}
