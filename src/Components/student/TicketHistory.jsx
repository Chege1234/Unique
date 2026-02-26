import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function TicketHistory({ tickets }) {
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle>Recent History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {ticket.status === 'completed' ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium text-gray-900">{ticket.department_name}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(ticket.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{ticket.ticket_number}</p>
                <Badge variant={ticket.status === 'completed' ? 'default' : 'destructive'}>
                  {ticket.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}