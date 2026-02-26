import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, XCircle, Mail, Phone, Clock, User } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/Components/ui/dialog";

export default function StaffRequestManager({ requests }) {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [actionType, setActionType] = React.useState(null);

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.StaffRequest.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['staffRequests']);
      setSelectedRequest(null);
      setActionType(null);
    }
  });

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setActionType('approve');
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setActionType('reject');
  };

  const confirmAction = () => {
    if (selectedRequest && actionType) {
      updateRequestMutation.mutate({
        id: selectedRequest.id,
        status: actionType === 'approve' ? 'approved' : 'rejected'
      });
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  return (
    <>
      <Card className="border-none shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Staff Access Requests</CardTitle>
            <Badge variant="secondary" className="text-lg">
              {pendingRequests.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No pending staff requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {request.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{request.full_name}</h3>
                        <Badge className="bg-blue-500">{request.department}</Badge>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {request.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {request.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(request.created_date), 'MMM dd, yyyy h:mm a')}
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-3 p-3 bg-white rounded border border-yellow-200">
                        <p className="text-sm text-gray-700"><strong>Notes:</strong> {request.notes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex md:flex-col gap-2">
                    <Button
                      onClick={() => handleApprove(request)}
                      className="flex-1 md:flex-none bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      variant="destructive"
                      className="flex-1 md:flex-none"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {processedRequests.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Processed Requests</h3>
              <div className="space-y-3">
                {processedRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                        {request.full_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{request.full_name}</p>
                        <p className="text-sm text-gray-600">{request.department}</p>
                      </div>
                    </div>
                    <Badge className={request.status === 'approved' ? 'bg-green-500' : 'bg-red-500'}>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Reject'} Staff Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this staff access request? You will need to manually invite the user via Dashboard → Users → Invite User.'
                : 'Are you sure you want to reject this staff access request?'}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedRequest.full_name}</p>
                <p><strong>Email:</strong> {selectedRequest.email}</p>
                <p><strong>Department:</strong> {selectedRequest.department}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-green-500 hover:bg-green-600' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              disabled={updateRequestMutation.isPending}
            >
              {updateRequestMutation.isPending ? 'Processing...' : `Confirm ${actionType === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}