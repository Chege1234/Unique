import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function CompletedToday({ tickets }) {
  if (tickets.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-12 text-center">
          <CheckCircle2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Completed Tickets</h3>
          <p className="text-gray-600">Tickets you complete will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="glass-card border-none hover:bg-white/5 transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${ticket.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                {ticket.status === 'cancelled' ? (
                  <XCircle className="w-6 h-6" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-black text-white tracking-tight">{ticket.student_name}</h3>
                  <Badge className={`font-black tracking-widest uppercase py-0.5 ${ticket.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {ticket.ticket_number}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-6 text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-500/50" />
                    {ticket.student_email || ticket.student_id}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500/50" />
                    {(ticket.status === 'cancelled' || ticket.status === 'skipped') ? 'TERMINATED AT' : 'RESOLVED AT'} {ticket.served_at ? format(new Date(ticket.served_at), 'h:mm a') : format(new Date(ticket.updated_at || ticket.created_date), 'h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}