import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, Play, XCircle } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function WaitingQueue({ tickets, onCallNext, isCallingNext }) {
  if (tickets.length === 0) {
    return (
      <Card className="glass-card border-none">
        <CardContent className="p-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <Clock className="w-16 h-16 text-blue-300/20 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-white mb-2">Queue is Empty</h3>
            <p className="text-blue-100/40 font-medium">No students are currently waiting.</p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_#a855f7]" />
            Wait List
          </h2>
          <p className="text-blue-100/30 text-xs font-bold mt-1 uppercase tracking-widest">{tickets.length} student{tickets.length !== 1 ? 's' : ''} waiting</p>
        </div>
        <Button
          onClick={onCallNext}
          disabled={isCallingNext || tickets.length === 0}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-widest px-8 py-6 rounded-2xl transition-all duration-300 group"
        >
          {isCallingNext ? "Calling..." : "CALL NEXT"}
          {!isCallingNext && <Play className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {tickets.map((ticket, index) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="glass-card border-none hover:bg-white/5 transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:border-purple-500/50 transition-colors">
                      <span className="text-purple-400 font-black text-lg">0{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-1">
                        <h3 className="text-lg font-black text-white tracking-tight">{ticket.student_name}</h3>
                        <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold tracking-widest uppercase py-0.5">{ticket.ticket_number}</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.15em]">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-purple-500/50" />
                          <span>{ticket.student_email || ticket.student_id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          {format(new Date(ticket.created_date), 'h:mm a')}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-2 truncate">
                        <span className="font-medium">Department:</span> {ticket.department_name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

