import React from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ServingTicket({ tickets, onComplete, onCancel }) {
  if (tickets.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-12 text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Services</h3>
          <p className="text-gray-600">Start serving a student from the waiting queue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {tickets.map((ticket) => (
        <Card key={ticket.id} className="border-none shadow-md bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.student_name}</h3>
                    <Badge className="bg-orange-500">{ticket.ticket_number}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {ticket.student_email || ticket.student_id}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Started {format(new Date(ticket.updated_date), 'h:mm a')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-medium">Department:</span> {ticket.department_name}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onComplete(ticket.id)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCancel(ticket.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}