import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function ServingTicket({ tickets, onComplete, onCancel, isCompleting, isCancelling }) {
  if (tickets.length === 0) {
    return (
      <Card className="glass-card border-none">
        <CardContent className="p-20 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <User className="w-20 h-20 text-blue-300/10 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-white mb-2">Ready for Service</h3>
            <p className="text-blue-100/40 font-medium">Awaiting next engagement from queue</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="glass-card border-none overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-2xl font-black text-white tracking-tight">{ticket.student_name}</h3>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-black tracking-widest uppercase">{ticket.ticket_number}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-6 text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-500/50" />
                      {ticket.student_email || ticket.student_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500/50" />
                      INITIATED {format(new Date(ticket.called_at || ticket.created_date), 'h:mm a')}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => onComplete(ticket.id)}
                  disabled={isCompleting}
                  className="bg-green-600 hover:bg-green-500 text-white font-black uppercase tracking-widest h-14 px-8 rounded-2xl shadow-xl shadow-green-900/20"
                >
                  <CheckCircle2 className="w-5 h-5 mr-3" />
                  MARK SERVED
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCancel(ticket.id)}
                  disabled={isCancelling}
                  className="bg-white/5 border-white/10 hover:bg-red-500/10 text-white hover:text-red-400 hover:border-red-500/30 font-black uppercase tracking-widest h-14 px-8 rounded-2xl transition-all"
                >
                  <XCircle className="w-5 h-5 mr-3" />
                  CANCEL
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}