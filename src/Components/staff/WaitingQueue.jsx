import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { User, Clock, Play, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function WaitingQueue({ tickets, onStartServing, onCancel }) {
  if (tickets.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
        <CardContent className="p-8 sm:p-12 text-center">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Students Waiting</h3>
          <p className="text-sm sm:text-base text-gray-600">The queue is currently empty</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4">
      {tickets.map((ticket, index) => (
        <Card key={ticket.id} className="border-none shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold text-base sm:text-lg">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{ticket.student_name}</h3>
                    <Badge className="bg-blue-500 w-fit text-xs sm:text-sm">{ticket.ticket_number}</Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{ticket.student_email || ticket.student_id}</span>
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => onStartServing(ticket.id)}
                  className="bg-green-500 hover:bg-green-600 flex-1 h-10 sm:h-auto text-sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Serving
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onCancel(ticket.id)}
                  className="text-red-600 hover:bg-red-50 w-full sm:w-auto h-10 sm:h-auto text-sm"
                >
                  <XCircle className="w-4 h-4 mr-1 sm:mr-0" />
                  <span className="sm:hidden">Cancel</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
