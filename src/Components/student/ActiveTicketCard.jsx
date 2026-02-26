import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Clock, Users, Hash, XCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ActiveTicketCard({ ticket, onUpdate }) {
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => base44.entities.QueueTicket.update(ticket.id, { status: 'cancelled' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      onUpdate();
    }
  });

  const getStatusBadge = () => {
    if (ticket.status === 'in_progress') {
      return <Badge className="bg-orange-500">Now Serving</Badge>;
    }
    return <Badge className="bg-blue-500">Waiting</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`border-none shadow-xl ${
        ticket.status === 'in_progress' 
          ? 'bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100'
      }`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{ticket.department_name}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Created {format(new Date(ticket.created_date), 'h:mm a')}
              </p>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Ticket Number - Large Display */}
            <div className="p-6 bg-white rounded-xl text-center shadow-md">
              <p className="text-sm text-gray-600 mb-2">Your Ticket Number</p>
              <p className="text-5xl font-bold text-gray-900">{ticket.ticket_number}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Queue Position</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">#{ticket.queue_position || 1}</p>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Est. Wait</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {ticket.estimated_wait_time || 15} min
                </p>
              </div>
            </div>

            {ticket.status === 'in_progress' && (
              <div className="p-4 bg-orange-100 border-2 border-orange-300 rounded-lg text-center">
                <CheckCircle2 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <p className="font-semibold text-orange-800">It's your turn! Please proceed to the counter.</p>
              </div>
            )}

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}