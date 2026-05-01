import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function TicketHistory({ tickets }) {
  return (
    <Card className="glass-card border-none">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black text-white uppercase tracking-widest">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-6 bg-white/5 hover:bg-white/10 transition-colors rounded-2xl border border-white/5 group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${ticket.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {ticket.status === 'completed' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-white tracking-tight">{ticket.department_name}</p>
                  <p className="text-[10px] font-bold text-blue-100/30 uppercase tracking-[0.2em] mt-1">
                    {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-white tracking-widest group-hover:text-purple-400 transition-colors uppercase">{ticket.ticket_number}</p>
                <div className="mt-1">
                  <Badge className={`text-[10px] font-black uppercase tracking-widest py-0.5 ${ticket.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
