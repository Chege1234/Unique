import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/apiClient";
import { Clock, Users, Hash, XCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ActiveTicketCard({ ticket, onUpdate }) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => api.entities.QueueTicket.update(ticket.id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      onUpdate();
    }
  });

  const getStatusBadge = () => {
    if (ticket.status === 'in_progress' || ticket.status === 'called') {
      return <Badge className="bg-orange-500">Now Serving</Badge>;
    }
    return <Badge className="bg-blue-500">Waiting</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="glass-card border-none overflow-hidden relative group">
        {(ticket.status === 'in_progress' || ticket.status === 'called') && (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 animate-pulse" />
        )}
        <CardHeader className="border-b border-white/5 p-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em] mb-1">Active Department</p>
              <CardTitle className="text-3xl font-black text-white tracking-tight">{ticket.department_name}</CardTitle>
              <div className="flex items-center gap-2 mt-3 text-[10px] font-bold text-blue-100/30 uppercase tracking-widest">
                <Clock className="w-3 h-3" />
                Joined at {format(new Date(ticket.created_date), 'h:mm a')}
              </div>
            </div>
            {ticket.status === 'in_progress' || ticket.status === 'called' ? (
              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 font-black tracking-tighter uppercase px-4 py-2 rounded-full text-xs">
                Now serving you
              </Badge>
            ) : (
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 font-black tracking-tighter uppercase px-4 py-2 rounded-full text-xs">
                Waiting in queue
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-8">
            {/* Ticket Number - Massive Display */}
            <div className="p-10 bg-white/5 rounded-3xl text-center border border-white/10 shadow-inner group-hover:border-purple-500/30 transition-colors">
              <p className="text-[10px] font-black text-blue-100/20 uppercase tracking-[0.3em] mb-4">Your Ticket Number</p>
              <p className="text-7xl font-black text-white tracking-widest leading-none bg-clip-text bg-gradient-to-b from-white to-white/60">
                {ticket.ticket_number}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                <Users className="w-5 h-5 text-purple-400 mb-2 opacity-50" />
                <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-1">Your position</span>
                <p className="text-3xl font-black text-white tracking-tighter">#{ticket.queue_position || 1}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                <Clock className="w-5 h-5 text-blue-400 mb-2 opacity-50" />
                <span className="text-[10px] font-black text-blue-100/20 uppercase tracking-widest mb-1">Wait time</span>
                <p className="text-3xl font-black text-white tracking-tighter">
                  {ticket.estimated_wait_time || 15}<span className="text-sm ml-1 text-blue-400">m</span>
                </p>
              </div>
            </div>

            {(ticket.status === 'in_progress' || ticket.status === 'called') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-green-500/20 border border-green-500/30 rounded-3xl text-center backdrop-blur-md"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <p className="text-lg font-black text-green-300 tracking-tight leading-tight uppercase">
                  IT'S YOUR TURN!<br />
                  <span className="text-xs font-bold text-green-400/60 tracking-widest opacity-80">Head to the counter now</span>
                </p>
              </motion.div>
            )}

            <Button
              variant="ghost"
              className="w-full text-blue-100/20 hover:text-red-400 hover:bg-red-500/10 transition-colors font-bold uppercase tracking-[0.25em] text-[10px] py-6"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              CANCEL TICKET
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
