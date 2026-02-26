import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, CheckCircle2 } from "lucide-react";
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
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="border-none shadow-md bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{ticket.student_name}</h3>
                  <Badge className="bg-green-500">{ticket.ticket_number}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {ticket.student_email || ticket.student_id}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Completed at {format(new Date(ticket.served_at), 'h:mm a')}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Department:</span> {ticket.department_name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}