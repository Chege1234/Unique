import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import DepartmentCard from "../Components/departments/DepartmentCard";

export default function StudentTakeTicket() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDept, setSelectedDept] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const studentNumber = urlParams.get('student');

  React.useEffect(() => {
    if (!studentNumber || !/^20\d{6}$/.test(studentNumber)) {
      navigate(createPageUrl("Home"));
    }
  }, [studentNumber, navigate]);

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => api.entities.Department.filter({ is_active: true })
  });

  const { data: allTickets = [] } = useQuery({
    queryKey: ['allTickets'],
    queryFn: () => api.entities.QueueTicket.list(),
    refetchInterval: 5000
  });

  const { data: myTickets = [] } = useQuery({
    queryKey: ['myTickets', studentNumber],
    queryFn: () => api.entities.QueueTicket.filter({ student_email: `${studentNumber}@student.edu` }),
    enabled: !!studentNumber
  });

  const activeTicket = myTickets.find(t => t.status === 'waiting' || t.status === 'in_progress' || t.status === 'called');

  const createTicketMutation = useMutation({
    mutationFn: async (departmentId) => {
      return api.entities.QueueTicket.createViaRpc(
        `${studentNumber}@student.edu`,
        `Student ${studentNumber}`,
        departmentId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myTickets']);
      queryClient.invalidateQueries(['allTickets']);
      navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`);
    },
    onError: (error) => {
      console.error('Failed to create ticket:', error);
      if (error.message?.includes('already has an active ticket')) {
        toast.error('You already have an active ticket. Cancel it first.');
      } else {
        toast.error('Failed to create ticket. Please try again.');
      }
    }
  });

  const getDepartmentStats = (deptId) => {
    const deptTickets = allTickets.filter(t => t.department_id === deptId);
    const waiting = deptTickets.filter(t => t.status === 'waiting').length;
    const avgTime = departments.find(d => d.id === deptId)?.average_service_time || 15;

    return {
      waiting,
      estimatedWait: waiting * avgTime
    };
  };

  const handleSelectDepartment = (dept) => {
    setSelectedDept(dept);
  };

  const handleConfirm = () => {
    if (selectedDept) {
      createTicketMutation.mutate(selectedDept.id);
    }
  };

  if (activeTicket) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto relative z-10">
        <div className="w-full max-w-lg relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none p-10 text-center">
              <div className="w-20 h-20 bg-red-500/20 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/20">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-4">You Already Have a Ticket</h2>
              <p className="text-blue-100/40 font-medium text-lg leading-relaxed mb-10">
                You already have an active ticket. Please cancel it before getting a new one.
              </p>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => navigate(createPageUrl("StudentTicketView") + `?student=${studentNumber}`)}
              >
                View Active Ticket
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(createPageUrl("Home"))}
                className="w-11 h-11 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-tight">Choose a Department</h1>
                <p className="text-muted-foreground text-sm mt-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  Student ID: {studentNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {!selectedDept ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept, index) => {
              const stats = getDepartmentStats(dept.id);
              return (
                <DepartmentCard
                  key={dept.id}
                  department={dept}
                  stats={stats}
                  onSelect={handleSelectDepartment}
                  delay={index * 0.1}
                />
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="glass-card border-none overflow-hidden relative max-w-3xl mx-auto">
              <CardHeader className="text-center p-6 md:p-10 border-b border-border/70">
                <p className="text-xs font-medium text-primary mb-2">You're almost there</p>
                <CardTitle className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">Confirm Ticket</CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-10">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 p-5 md:p-7 bg-card rounded-2xl border border-border">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-semibold flex-shrink-0">
                      {selectedDept.name[0]}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">{selectedDept.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{selectedDept.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 md:p-6 bg-card rounded-2xl border border-border flex flex-col items-center">
                      <Users className="w-6 h-6 text-primary mb-2 opacity-80" />
                      <span className="text-xs text-muted-foreground mb-1">People waiting</span>
                      <p className="text-2xl md:text-3xl font-semibold text-foreground">{getDepartmentStats(selectedDept.id).waiting}</p>
                    </div>
                    <div className="p-4 md:p-6 bg-card rounded-2xl border border-border flex flex-col items-center">
                      <Clock className="w-6 h-6 text-primary mb-2 opacity-80" />
                      <span className="text-xs text-muted-foreground mb-1">Estimated wait</span>
                      <p className="text-2xl md:text-3xl font-semibold text-foreground">
                        {getDepartmentStats(selectedDept.id).estimatedWait}<span className="text-sm ml-1 text-muted-foreground">m</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      variant="ghost"
                      className="flex-1 h-12"
                      onClick={() => setSelectedDept(null)}
                      disabled={createTicketMutation.isPending}
                    >
                      Go Back
                    </Button>
                    <Button
                      className="flex-[2] h-12"
                      onClick={handleConfirm}
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm & Get Ticket
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

